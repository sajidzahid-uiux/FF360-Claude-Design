/**
 * LOCAL PROTOTYPE mock axios adapter.
 *
 * Attached to both axios instances (api/client.ts and lib/axios.ts) when
 * NEXT_PUBLIC_USE_MOCK_DATA === "true". Lets the CMS frontend run with NO
 * backend by answering every request with dummy data instead of hitting the
 * (deleted) Django API.
 *
 * Strategy:
 *  - Explicitly handle the auth/org/members/permissions chain so the app shell
 *    boots and routes into /organizations/{id}/dashboard.
 *  - For everything else, return safe defaults (DRF-style paginated empty list
 *    for collections, {} for detail, echo body for writes) so pages render
 *    empty rather than crashing.
 *  - Unmatched GETs are logged to the console so we can add realistic dummy
 *    datasets per flow (lead-to-job, etc.) as we build them out.
 */
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import type { MapPin } from "@/api/types/mapPin";
import type { MapPinCategory } from "@/api/types/mapPinCategory";
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from "@/hooks/permissions/constants";

import { routes as bookkeepingRoutes } from "./data/bookkeeping";
import { CHAT_GROUPS, UNSEEN_COUNTS } from "./data/chat";
import {
  routes as contactRoutes,
  recordFarmsForContact,
} from "./data/contacts";
import { routes as crewRoutes } from "./data/crews";
import { routes as equipmentRoutes } from "./data/equipment";
import { routes as jobRoutes } from "./data/jobs";
import { routes as leadRoutes } from "./data/leads";
import { routes as memberRoutes } from "./data/members";
import {
  createMockVendorForm,
  findCreatedVendorForm,
  routes as orderPipeRoutes,
} from "./data/orderPipe";
import { routes as quickActionRoutes } from "./data/quickActions";
import { routes as schedulingRoutes } from "./data/scheduling";
import { routes as taskRoutes } from "./data/tasks";
import type { MockRoute } from "./data/types";

/**
 * Org-1 dummy dataset. Every route here is consulted ONLY when the request is
 * scoped to organization 1 ("Sajid & Sons Contractors") — the demo org that has
 * data. Each route's regex is anchored (…/?$) and the path prefixes are disjoint
 * across modules, so cross-module ordering is irrelevant; within a module the
 * file already lists the more specific (detail/sub-action) routes first.
 *
 * The SECOND demo org ("Fresh Contractor", id 2) is intentionally NOT in this
 * set: its list endpoints fall through to the empty defaults below, so it
 * presents as a brand-new organization with nothing created yet.
 */
const ORG1_DATA_ROUTES: MockRoute[] = [
  ...crewRoutes,
  ...jobRoutes,
  ...leadRoutes,
  ...contactRoutes,
  ...equipmentRoutes,
  ...orderPipeRoutes,
  ...quickActionRoutes,
  ...schedulingRoutes,
  ...taskRoutes,
  ...memberRoutes,
  ...bookkeepingRoutes,
];

/** Org id of the request, e.g. "1" for ms/organizations/1/leads/all/ (or null). */
function orgIdOf(url: string): string | null {
  const m = url.match(/^ms\/organizations\/(\d+)(?:\/|$)/);
  return m ? m[1] : null;
}

/**
 * Every `<resource>_<action>` code (read/write/delete) for the demo admin, so
 * the mocked user can see and use every page/flow. Plus role flags the app
 * checks for ("is_admin").
 */
const ALL_PERMISSION_CODES: string[] = [
  ...Object.values(PERMISSION_RESOURCES).flatMap((resource) =>
    PERMISSION_ACTIONS.map((action) => `${resource}_${action}`)
  ),
  "is_admin",
];

/**
 * Permission catalog (ms/organizations/<id>/permissions/). The role editor
 * (Create/Edit User Type) consumes this as a RAW array of Permission objects
 * and maps each PERMISSIONS_CONFIG item to one by `code`. Every `<resource>_<action>`
 * code gets a stable numeric id (used by the editor's selectedPermissionIds set).
 */
const DEMO_PERMISSION_OBJECTS = ALL_PERMISSION_CODES.filter(
  (code) => code !== "is_admin"
).map((code, index) => ({
  id: index + 1,
  name: code,
  code,
  action_type: code.split("_").pop() ?? "read",
}));

/**
 * Billing — Stripe-style subscription info for org 1. Powers the Current plan
 * card (renewal/auto-renew/card) and the Invoices tab. Invoices use the shape
 * the billing UI reads: { amount_paid, status, created, pdf }.
 */
const DEMO_SUBSCRIPTION_INFO = {
  renewal_date: "2026-07-28T00:00:00Z",
  remaining_days: 30,
  trialing: false,
  auto_renew: true,
  card: { brand: "visa", last4: "4242", exp_month: 8, exp_year: 2028 },
  invoices: [
    { amount_paid: 361, status: "paid", created: "2026-06-01T00:00:00Z", pdf: "https://pay.stripe.com/invoice/acct_demo/inv_2606" },
    { amount_paid: 361, status: "paid", created: "2026-05-01T00:00:00Z", pdf: "https://pay.stripe.com/invoice/acct_demo/inv_2605" },
    { amount_paid: 361, status: "paid", created: "2026-04-01T00:00:00Z", pdf: "https://pay.stripe.com/invoice/acct_demo/inv_2604" },
    { amount_paid: 361, status: "paid", created: "2026-03-01T00:00:00Z", pdf: "https://pay.stripe.com/invoice/acct_demo/inv_2603" },
    { amount_paid: 361, status: "open", created: "2026-02-01T00:00:00Z", pdf: "https://pay.stripe.com/invoice/acct_demo/inv_2602" },
    { amount_paid: 361, status: "paid", created: "2026-01-01T00:00:00Z", pdf: "https://pay.stripe.com/invoice/acct_demo/inv_2601" },
    { amount_paid: 361, status: "paid", created: "2025-12-01T00:00:00Z", pdf: "https://pay.stripe.com/invoice/acct_demo/inv_2512" },
    { amount_paid: 78, status: "void", created: "2025-11-01T00:00:00Z", pdf: "" },
  ],
};

/** Billing — saved payment methods (Payment tab). */
const DEMO_PAYMENT_CARDS = [
  { id: "pm_demo_visa", brand: "visa", last4: "4242", exp_month: 8, exp_year: 2028, is_default: true },
  { id: "pm_demo_mc", brand: "mastercard", last4: "5454", exp_month: 4, exp_year: 2027, is_default: false },
];

/**
 * Map pin categories (org 1). Powers the on-map Add Pin menu's category list
 * and the Manage Categories screen. Colors come from the pin category palette.
 */
const DEMO_PIN_CATEGORIES: MapPinCategory[] = [
  { id: 1, name: "Water Source", color: "#3B82F6", pin_count: 0 },
  { id: 2, name: "Main Valve", color: "#EF4444", pin_count: 0 },
  { id: 3, name: "Riser", color: "#22C55E", pin_count: 0 },
  { id: 4, name: "Obstruction", color: "#F97316", pin_count: 0 },
  { id: 5, name: "Access Point", color: "#A855F7", pin_count: 0 },
  { id: 6, name: "Utility Marker", color: "#EAB308", pin_count: 0 },
];

/**
 * In-memory map pins per job/lead, keyed by "job:<id>" / "lead:<id>". Created
 * pins persist for the browser session so the Add Pin flow and the Pins list
 * stay coherent without a backend (reset on reload).
 */
const demoPinsByKey: Record<string, MapPin[]> = {};

/**
 * Notifications (ms/organizations/<id>/new-notifications/). Built at request time
 * off `now` so created_at stays relative (Today / Yesterday / Last 7 days / Older
 * grouping in the UI). category drives the priority colour: critical | important | fyi.
 */
function buildDemoNotifications() {
  const now = Date.now();
  const HOUR = 3_600_000;
  const DAY = 86_400_000;
  const mk = (
    id: number,
    offset: number,
    read: boolean,
    category: "critical" | "important" | "fyi",
    moduleName: string,
    title: string,
    description: string,
    url: string | null
  ) => {
    const iso = new Date(now - offset).toISOString();
    return {
      id,
      title,
      description,
      created_at: iso,
      read,
      url,
      web_url: url,
      category,
      module: moduleName,
      event_key: `${moduleName}_${id}`,
      date_group:
        offset < DAY ? "today" : offset < 7 * DAY ? "last_7_days" : "older",
      display_date: iso,
    };
  };

  // A representative notification for every module and all three priority
  // categories (critical | important | fyi), spread across read/unread and the
  // Today / Yesterday / Last 7 days / Older date groups. The most recent unread
  // ones surface in the header bell dropdown (page_size 5, unread only).
  return [
    // --- Today ---
    mk(1, 2 * HOUR, false, "critical", "Jobs", "Repair job overdue", "Repair job #402 at Sandhill Ranch is past its scheduled completion date.", "/organizations/1/jobs/repair"),
    mk(2, 3 * HOUR, false, "critical", "Pending Approval", "Estimate awaiting your approval", "The excavation estimate for Cedar Hollow Farms needs sign-off before work can start.", "/organizations/1/pending/excavation"),
    mk(3, 5 * HOUR, false, "important", "Leads", "New lead assigned to you", "Riverside Grain Co. submitted a drainage-tiling lead for 200 acres.", "/organizations/1/leads/drainage-tiling"),
    mk(4, 6 * HOUR, false, "important", "Messages", "New message from client", "Mara Lindqvist replied about the Delta Wetland scheduling.", "/organizations/1/messages"),
    mk(5, 7 * HOUR, false, "fyi", "Map", "Crew checked in on site", "Crew B checked in at the Oakridge job site at 8:42 AM.", "/organizations/1/map"),
    mk(6, 8 * HOUR, true, "fyi", "Equipment", "Maintenance reminder", "Excavator EX-12 is due for 250-hour service this week.", "/organizations/1/equipment"),

    // --- Yesterday ---
    mk(7, DAY + 2 * HOUR, false, "critical", "Billing", "Payment failed", "The payment for Invoice #9 ($1,240) was declined — update the card on file.", "/organizations/1/settings/org/billing"),
    mk(8, DAY + 5 * HOUR, false, "important", "Quick Actions", "Quick action needs attention", "A quick-action draft for the Maple Ridge tiling job is waiting to be finished.", "/organizations/1/quick-actions"),
    mk(9, DAY + 8 * HOUR, true, "important", "Order Pipe", "Order delivered", "Order #18 (dual-wall pipe) was marked delivered.", "/organizations/1/order-pipe"),
    mk(10, DAY + 11 * HOUR, true, "fyi", "Team", "New team member joined", "Dana White accepted the invitation and joined as Bookkeeper.", "/organizations/1/settings/org/team"),

    // --- Last 7 days ---
    mk(11, 2 * DAY, false, "critical", "Calendar", "Equipment scheduling conflict", "Two jobs are scheduled on the same trencher this week.", "/organizations/1/calendar"),
    mk(12, 3 * DAY, false, "important", "Maintenance", "Service due this week", "Tractor TR-04 is approaching its scheduled maintenance window.", "/organizations/1/maintenance"),
    mk(13, 3 * DAY + 6 * HOUR, true, "important", "Pending Approval", "Repair quote approved", "Your repair quote for Birchwood Co-op was approved by the client.", "/organizations/1/pending/repair"),
    mk(14, 4 * DAY, false, "important", "Tasks", "Task assigned to you", "“Confirm material counts for the Delta Wetland dig” was assigned to you.", "/organizations/1/task-management"),
    mk(15, 5 * DAY, true, "fyi", "Leads", "Lead status updated", "Oakridge Agronomy lead moved to ‘Estimate sent’.", "/organizations/1/leads/excavation"),
    mk(16, 6 * DAY, true, "fyi", "Book Keeping", "Monthly statement ready", "Your May bookkeeping statement is ready to review.", "/organizations/1/book-keeping"),
    mk(17, 6 * DAY + 4 * HOUR, true, "fyi", "Status Management", "New job status added", "The status “Awaiting Permit” was added to the Jobs workflow.", "/organizations/1/status-management"),

    // --- Older ---
    mk(18, 9 * DAY, true, "important", "Billing", "Invoice paid", "Invoice #6 for $361 was paid successfully.", "/organizations/1/settings/org/billing"),
    mk(19, 10 * DAY, true, "fyi", "Billing", "Card expiring soon", "Visa ending 4242 expires in 60 days.", "/organizations/1/settings/org/billing"),
    mk(20, 11 * DAY, true, "critical", "Security", "New sign-in detected", "A new sign-in to your account was detected from Des Moines, IA.", "/organizations/1/settings/user/security"),
    mk(21, 12 * DAY, true, "important", "Roles & Access", "Your role was updated", "You were granted the “Approve Estimates” permission.", "/organizations/1/settings/org/role-access"),
    mk(22, 12 * DAY + 8 * HOUR, true, "fyi", "Jobs", "Added to crew", "You were added to the crew for the Delta Wetland excavation.", "/organizations/1/jobs/excavation"),
    mk(23, 14 * DAY, true, "fyi", "System Settings", "System settings updated", "Default unit system for the organization was changed to Imperial.", "/organizations/1/system-settings"),
    mk(24, 20 * DAY, true, "fyi", "Trash", "Items scheduled for cleanup", "3 archived records in Trash will be permanently removed in 7 days.", "/organizations/1/settings/org/trash"),
  ];
}

/**
 * Demo org #1 — fully populated. `current_plan` MUST be a real plan apiId
 * (solo/team/business/enterprise _monthly|_yearly) because the org switcher
 * routes to /subscribe unless getPlanName(current_plan) is non-empty. The
 * list-row fields (company_abbreviation, longitude/latitude, current_plan, role)
 * sit alongside the detail fields so one object serves both the org LIST and the
 * org DETAIL endpoint.
 */
export const DEMO_ORG = {
  id: 1,
  name: "Sajid & Sons Contractors",
  slug: "sajid-sons-contractors",
  company_abbreviation: "S&S",
  logo: null,
  role: "Admin",
  current_plan: "team_monthly",
  address: "1450 County Rd E34, Ames, IA 50010",
  phone_number: "+1 515 555 0142",
  email: "office@sajidsons.com",
  longitude: -93.6319,
  latitude: 42.0308,
  timezone: "America/Chicago",
  unit_system: "imperial",
  subscription_status: "active",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

/**
 * Demo org #2 — "Fresh Contractor". Same shape as org 1, but NO dummy dataset is
 * wired for it (see ORG1_DATA_ROUTES), so every list endpoint returns empty and
 * the dashboard returns zeros: a brand-new organization with nothing set up yet.
 */
export const DEMO_ORG_2 = {
  id: 2,
  name: "Fresh Contractor",
  slug: "fresh-contractor",
  company_abbreviation: "FC",
  logo: null,
  role: "Admin",
  current_plan: "team_monthly",
  address: "300 Main St, Des Moines, IA 50309",
  phone_number: "+1 515 555 0900",
  email: "hello@freshcontractor.com",
  longitude: -93.6091,
  latitude: 41.5868,
  timezone: "America/Chicago",
  unit_system: "imperial",
  subscription_status: "active",
  is_active: true,
  created_at: "2026-06-20T00:00:00Z",
  updated_at: "2026-06-20T00:00:00Z",
};

const ALL_ORGS = [DEMO_ORG, DEMO_ORG_2];

/** Org detail by id — falls back to org 1 for unknown ids. */
function orgById(orgId: string | null) {
  return ALL_ORGS.find((o) => String(o.id) === orgId) ?? DEMO_ORG;
}

export const DEMO_USER = {
  id: 1,
  email: "sajid.zahid@fieldflow360.com",
  first_name: "Sajid",
  last_name: "Zahid",
  full_name: "Sajid Zahid",
  phone_number: "+1 515 555 0142",
  is_active: true,
  email_verified: true,
};

const DEMO_MEMBER = {
  id: 1,
  user: DEMO_USER,
  owner: true,
  role_id: 1,
  role_fk: {
    id: 1,
    name: "Admin",
    is_admin: true,
    is_default: true,
    organization: 1,
  },
};

const DEMO_PERMISSIONS = {
  permission_codes: ALL_PERMISSION_CODES,
  role: { id: 1, name: "Admin", is_admin: true, is_default: true },
};

/** Realistic non-zero dashboard payload (OrganizationDashboardResponse). */
const DEMO_DASHBOARD = {
  shared_to_diggs_jobs: 4,
  not_approved_farmer_jobs: 3,
  not_approved_farmer_tiling_jobs: 1,
  not_approved_farmer_excavation_jobs: 1,
  not_approved_farmer_repair_jobs: 1,
  total_members: 6,
  admin_members: 1,
  project_managers_members: 1,
  project_crews_members: 3,
  bookkeepers_members: 1,
  total_farmer_jobs: 12,
  tiling_farmer_jobs: 6,
  excavation_farmer_jobs: 3,
  repair_farmer_jobs: 3,
  total_invoices: 9,
  checked_by_admin_invoices: 6,
  sent_to_client_invoices: 5,
  paid_invoices: 4,
  designs_needed_by_you: {},
  near_maintenance_count: 2,
  total_jobs: 24,
  cancelled_jobs: 2,
  completed_jobs: 10,
  total_running_tiling_jobs: 5,
  total_running_excavation_jobs: 3,
  total_running_repair_jobs: 4,
  total_cancelled_tiling_jobs: 1,
  total_cancelled_excavation_jobs: 1,
  total_cancelled_repair_jobs: 0,
  total_completed_tiling_jobs: 5,
  total_completed_excavation_jobs: 3,
  total_completed_repair_jobs: 2,
  total_billing_tiling_jobs: 2,
  total_billing_excavation_jobs: 1,
  total_billing_repair_jobs: 1,
  total_leads: 14,
  total_drainage_tiling_leads: 7,
  total_excavation_leads: 4,
  total_repair_leads: 3,
  total_equipments: 12,
  total_equipment_in_maintenance: 2,
  total_acres_of_all_tiling_leads: 320,
  total_acres_of_all_uncompleted_tilling_jobs: 180,
  total_acres_of_all_completed_tilling_jobs: 240,
};

/**
 * Zeroed dashboard for a brand-new org (Fresh Contractor): every numeric metric
 * is 0 so the dashboard cards/charts render in their empty state. Derived from
 * DEMO_DASHBOARD so the two payloads always share the same key set.
 */
const EMPTY_DASHBOARD = Object.fromEntries(
  Object.entries(DEMO_DASHBOARD).map(([key, value]) => [
    key,
    typeof value === "number" ? 0 : value,
  ])
);

/**
 * RBAC roles for the org team page (ms/organizations/<id>/roles/). Returned for
 * BOTH demo orgs — every org starts with this default role set. members_count
 * reflects org 1's roster; for the fresh org the counts are cosmetic.
 */
const DEMO_ROLES = [
  { id: 1, name: "Admin", organization: 1, is_default: true, is_admin: true, members_count: 1, permissions: [], created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: 2, name: "Project Manager", organization: 1, is_default: false, is_admin: false, members_count: 1, permissions: [], created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: 3, name: "Crew", organization: 1, is_default: false, is_admin: false, members_count: 3, permissions: [], created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: 4, name: "Bookkeeper", organization: 1, is_default: false, is_admin: false, members_count: 1, permissions: [], created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: 5, name: "Operator", organization: 1, is_default: false, is_admin: false, members_count: 0, permissions: [], created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
];

/** Seat usage (ms/organizations/<id>/seat-usage/) — org-aware. */
function seatUsageFor(orgId: string | null) {
  if (orgId === "1") {
    return { total_seats: 10, used_seats: 6, pending_invites: 2, available_seats: 2 };
  }
  return { total_seats: 10, used_seats: 1, pending_invites: 0, available_seats: 9 };
}

/**
 * Status / type lookups. The hooks that consume these (useJobStatuses,
 * useLeadStatuses, useLeadTypes and their settings variants) expect a RAW
 * array of {id, title, color} — NOT a DRF page — so they must be matched
 * explicitly before the paginated fallback or `.map` blows up at the callsite.
 */
const DEMO_JOB_STATUSES = [
  { id: 1, title: "New", color: "#3b82f6", is_default: true },
  { id: 2, title: "Scheduled", color: "#8b5cf6", is_default: false },
  { id: 3, title: "In Progress", color: "#f59e0b", is_default: false },
  { id: 4, title: "On Hold", color: "#6b7280", is_default: false },
  { id: 5, title: "Completed", color: "#22c55e", is_default: false },
  { id: 6, title: "Cancelled", color: "#ef4444", is_default: false },
];

const DEMO_LEAD_STATUSES = [
  { id: 1, title: "New", color: "#3b82f6", is_default: true },
  { id: 2, title: "Contacted", color: "#06b6d4", is_default: false },
  { id: 3, title: "Qualified", color: "#8b5cf6", is_default: false },
  { id: 4, title: "Proposal Sent", color: "#f59e0b", is_default: false },
  { id: 5, title: "Won", color: "#22c55e", is_default: false },
  { id: 6, title: "Lost", color: "#ef4444", is_default: false },
];

const DEMO_LEAD_TYPES = [
  { id: 1, title: "Website", color: "#3b82f6", is_default: true },
  { id: 2, title: "Referral", color: "#22c55e", is_default: false },
  { id: 3, title: "Cold Call", color: "#f59e0b", is_default: false },
  { id: 4, title: "Trade Show", color: "#8b5cf6", is_default: false },
  { id: 5, title: "Social Media", color: "#ec4899", is_default: false },
];

const DEMO_PAYMENT_STATUSES = [
  { id: 1, title: "Unpaid", color: "#ef4444", is_default: true },
  { id: 2, title: "Partially Paid", color: "#f59e0b", is_default: false },
  { id: 3, title: "Paid", color: "#22c55e", is_default: false },
];

/**
 * Project types per category (T/E/R), consumed by the lead/job detail header
 * dropdown (ProjectTypeDropdown), the New Job form ("Project type *"), and the
 * settings page. ProjectTypesService unwraps either a raw array or a DRF page,
 * so the handler below returns a `listResponse` hybrid filtered by the
 * `?category=` query param when present. Categories use the one-letter
 * JobOrLeadType codes: T = Tiling, E = Excavation, R = Repair.
 */
const DEMO_PROJECT_TYPES = [
  // Tiling (T)
  { id: 1, name: "Pattern Tile", color: "#22c55e", category: "T", category_display: "Tile", is_default: true, organization: 1 },
  { id: 2, name: "Mainline", color: "#0ea5e9", category: "T", category_display: "Tile", is_default: false, organization: 1 },
  { id: 3, name: "Random Tile", color: "#8b5cf6", category: "T", category_display: "Tile", is_default: false, organization: 1 },
  // Excavation (E)
  { id: 4, name: "Basin Dig", color: "#f59e0b", category: "E", category_display: "Excavation", is_default: true, organization: 1 },
  { id: 5, name: "Waterway", color: "#06b6d4", category: "E", category_display: "Excavation", is_default: false, organization: 1 },
  { id: 6, name: "Pond", color: "#3b82f6", category: "E", category_display: "Excavation", is_default: false, organization: 1 },
  // Repair (R)
  { id: 7, name: "Pipe Repair", color: "#ef4444", category: "R", category_display: "Repair", is_default: true, organization: 1 },
  { id: 8, name: "Surface Inlet Repair", color: "#ec4899", category: "R", category_display: "Repair", is_default: false, organization: 1 },
  { id: 9, name: "Main Repair", color: "#f97316", category: "R", category_display: "Repair", is_default: false, organization: 1 },
];

/**
 * Django content_types served by `ms/dropdowns/content_types/` (via useMapping).
 * Comment/file features resolve a contentTypeId by matching `model` against
 * COMMENT_CONTENT_TYPE_MODEL ({ lead: "leaditem", job: "job", equipment: "equipment" }),
 * so those three models must be present. Consumed as a RAW array (.find on it).
 */
const DEMO_CONTENT_TYPES = [
  { id: 1, model: "leaditem" },
  { id: 2, model: "job" },
  { id: 3, model: "equipment" },
];

/**
 * Dummy notes/comments for the floating Notes widget. Only a few records are
 * "seeded" so the tab's red "new" indicator appears conditionally (others stay
 * empty). Returned as a raw array per requested note section.
 */
const DEMO_NOTE_COMMENTS: Record<string, { author: string; text: string; at: string }[]> = {
  general: [
    { author: "Omar Zahid", text: "Customer confirmed access through the north gate — crew can start Monday.", at: "2026-06-29T14:20:00Z" },
    { author: "Sajid Zahid", text: "Soil is wetter than expected on the east side; flagged for the design team.", at: "2026-06-30T09:05:00Z" },
  ],
  office: [
    { author: "Bilal Zahid", text: "Estimate sent to the client, awaiting signature before we schedule.", at: "2026-06-28T16:45:00Z" },
  ],
  onsite: [
    { author: "Tyler Brooks", text: "Located the collapsed main ~60ft in from the road. Photos uploaded.", at: "2026-06-30T18:10:00Z" },
  ],
};

/** Records that have notes (so the red dot shows on some, not all). */
const SEEDED_NOTE_OBJECT_IDS = new Set(["101", "201", "301"]);
const NOTE_SECTION_ORDER = ["general", "office", "onsite"];

function demoCommentsFor(objectId: string | null, noteSection: string | null) {
  if (!objectId || !SEEDED_NOTE_OBJECT_IDS.has(String(objectId))) return [];
  const section = noteSection ?? "general";
  const entries = DEMO_NOTE_COMMENTS[section] ?? [];
  const sectionIndex = Math.max(0, NOTE_SECTION_ORDER.indexOf(section));
  return entries.map((entry, i) => ({
    id: Number(objectId) * 1000 + sectionIndex * 10 + i,
    text: entry.text,
    note_section: section,
    member_name: entry.author,
    created_at: entry.at,
    object_id: objectId,
  }));
}

/**
 * List response for any collection GET.
 *
 * Returns an ARRAY that ALSO carries pagination metadata (both DRF `count` and
 * the CMS `total_count`/`total_pages`/`current_page`/`page_size`). With no real
 * backend, list endpoints are consumed three incompatible ways across the app:
 *   - directly:        `data.map(...)`, `data.find(...)`, `for (const x of data)`
 *   - unwrapped:       `data.results.map(...)`
 *   - gated:           `isPaginated(data) ? data.results : data` (needs total_count)
 * A plain object breaks the first; a plain array breaks the others. An array
 * with the metadata attached satisfies all three, so empty list endpoints never
 * throw "X is not a function / is not iterable" in dummy-data mode.
 */
function listResponse<T>(results: T[] = []) {
  const arr = [...results] as T[] & Record<string, unknown>;
  arr.count = results.length;
  arr.total_count = results.length;
  arr.total_pages = 1;
  arr.current_page = 1;
  arr.page_size = results.length || 100;
  arr.next = null;
  arr.previous = null;
  arr.results = [...results];
  return arr;
}

function makeResponse(
  data: unknown,
  config: InternalAxiosRequestConfig,
  status = 200
): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 204 ? "No Content" : "OK",
    headers: {},
    config,
  } as AxiosResponse;
}

function normalizeUrl(rawUrl: string): string {
  return rawUrl
    .split("?")[0]
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/+/, "");
}

function parseBody(data: unknown): Record<string, unknown> {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  if (typeof data === "object" && !(data instanceof FormData)) {
    return data as Record<string, unknown>;
  }
  return {};
}

let mockIdCounter = 1000;

export const mockAdapter: AxiosAdapter = async (config) => {
  const method = (config.method || "get").toLowerCase();
  const url = normalizeUrl(config.url || "");

  // --- Auth + organization bootstrap chain (return raw arrays/objects) ---
  if (/^auth\/users\/?$/.test(url)) {
    return makeResponse([DEMO_USER], config);
  }
  // Org list: BOTH demo orgs, so the switcher offers Sajid & Sons + Fresh Contractor.
  if (/^ms\/organizations\/?$/.test(url) && method === "get") {
    return makeResponse(ALL_ORGS, config);
  }
  // Org detail: the correct org by id (so the shell shows the right name/header).
  if (/^ms\/organizations\/\d+\/?$/.test(url) && method === "get") {
    return makeResponse(orgById(orgIdOf(url)), config);
  }
  // The user's own permission set (my-permissions) — an object with
  // permission_codes + role. Must NOT swallow the /permissions/ catalog
  // (handled below as a raw array), so match my-permissions specifically.
  if (/my-permissions\/?$/.test(url) && method === "get") {
    return makeResponse(DEMO_PERMISSIONS, config);
  }

  // --- Order Pipe create flow (org 1) -----------------------------------------
  // POST creates a fresh vendor form (Create Order modal); GET by id resolves a
  // session-created order to its own data. Existing static order ids fall through
  // to the orderPipe route table below (which serves the fully-shaped demo order).
  if (orgIdOf(url) === "1") {
    if (method === "post" && /vendor_forms-v2\/?$/.test(url)) {
      return makeResponse(createMockVendorForm(parseBody(config.data)), config, 201);
    }
    if (method === "get") {
      const detailMatch = url.match(/vendor_forms-v2\/(\d+)\/?$/);
      if (detailMatch) {
        const created = findCreatedVendorForm(detailMatch[1]);
        if (created) return makeResponse(created, config);
      }
    }
  }

  // --- Org-1 dummy dataset ----------------------------------------------------
  // Only org 1 ("Sajid & Sons Contractors") has data. Run its route table BEFORE
  // the generic members/invoices/empty fallbacks so e.g. team_members/ resolves
  // to the full roster for org 1 but still falls through to the owner-only
  // default for org 2 (Fresh Contractor). The whole block is skipped for org 2.
  if (method === "get" && orgIdOf(url) === "1") {
    for (const route of ORG1_DATA_ROUTES) {
      const methods = route.methods ?? ["get"];
      if (methods.includes(method) && route.match.test(url)) {
        const payload =
          route.list === false
            ? route.data
            : listResponse(route.data as unknown[]);
        return makeResponse(payload, config);
      }
    }
  }

  // --- Map pin categories + pins (org 1, stateful for the session) ----------
  if (orgIdOf(url) === "1") {
    // Pin category catalog — shared by the Add Pin menu and Manage Categories.
    if (/\/pin-categories\/?$/.test(url)) {
      if (method === "get") {
        return makeResponse(listResponse(DEMO_PIN_CATEGORIES), config);
      }
      if (method === "post") {
        const body = parseBody(config.data);
        const created: MapPinCategory = {
          id: ++mockIdCounter,
          name: String(body.name ?? "New category"),
          color: String(body.color ?? "#6B7280"),
          pin_count: 0,
        };
        DEMO_PIN_CATEGORIES.push(created);
        return makeResponse(created, config, 201);
      }
    }

    // Job/lead pin collection — created pins persist in demoPinsByKey.
    const pinsCollection = url.match(
      /\/(jobs|leads)\/[^/]+\/(\d+)\/pins\/?$/
    );
    if (pinsCollection) {
      const [, kind, entityId] = pinsCollection;
      const key = `${kind}:${entityId}`;
      const list = (demoPinsByKey[key] ??= []);
      if (method === "get") {
        return makeResponse(listResponse(list), config);
      }
      if (method === "post") {
        const body = parseBody(config.data) as {
          category_id?: number;
          latitude?: number;
          longitude?: number;
          label?: string;
        };
        const category = DEMO_PIN_CATEGORIES.find(
          (item) => item.id === Number(body.category_id)
        );
        const nowIso = new Date().toISOString();
        const created: MapPin = {
          id: ++mockIdCounter,
          organization: 1,
          job: kind === "jobs" ? Number(entityId) : null,
          lead: kind === "leads" ? Number(entityId) : null,
          name: body.label || category?.name || "Pin",
          label: body.label,
          category_id: body.category_id,
          category: category
            ? { id: category.id, name: category.name, color: category.color }
            : undefined,
          latitude: Number(body.latitude),
          longitude: Number(body.longitude),
          created_by: 1,
          created_at: nowIso,
          updated_at: nowIso,
        };
        list.push(created);
        return makeResponse(created, config, 201);
      }
    }

    // Single pin delete: .../pins/<pinId>/
    const pinDetail = url.match(
      /\/(jobs|leads)\/[^/]+\/(\d+)\/pins\/(\d+)\/?$/
    );
    if (pinDetail && method === "delete") {
      const [, kind, entityId, pinId] = pinDetail;
      const key = `${kind}:${entityId}`;
      if (demoPinsByKey[key]) {
        demoPinsByKey[key] = demoPinsByKey[key].filter(
          (pin) => pin.id !== Number(pinId)
        );
      }
      return makeResponse({}, config, 204);
    }
  }

  // Record farms picker (lead/job form): return the selected contact's farms
  // ("contact > farms management"). contact_id rides in the query string.
  if (
    method === "get" &&
    /ms\/organizations\/\d+\/records\/farms\/?$/.test(url)
  ) {
    const contactMatch = (config.url || "").match(/contact_id=(\d+)/);
    const contactId = contactMatch ? Number(contactMatch[1]) : undefined;
    return makeResponse(
      listResponse(recordFarmsForContact(contactId)),
      config
    );
  }

  // Org membership bootstrap + the fresh org's (owner-only) team roster.
  if (/members\/?$/.test(url) && method === "get") {
    return makeResponse([DEMO_MEMBER], config);
  }

  // --- Dashboard: real metrics for org 1, all-zeros for the fresh org ---
  if (/ms\/organizations\/\d+\/dashboard\/?$/.test(url) && method === "get") {
    const base = orgIdOf(url) === "1" ? DEMO_DASHBOARD : EMPTY_DASHBOARD;
    // The default landing paradigm is the current calendar month — a bounded
    // slice of the all-time totals. Scale numeric metrics down so the
    // "This Month" / "All Time" toggle produces a visibly different dashboard.
    const period = (config?.params as { period?: string } | undefined)?.period;
    const payload =
      period === "current_month"
        ? Object.fromEntries(
            Object.entries(base).map(([key, value]) => [
              key,
              typeof value === "number" ? Math.round(value * 0.35) : value,
            ])
          )
        : base;
    return makeResponse(payload, config);
  }
  // --- Invoices (org 2 only; org 1 served above): RAW empty array ---
  if (/ms\/organizations\/\d+\/invoices\/?$/.test(url) && method === "get") {
    return makeResponse([], config);
  }
  // --- RBAC roles + seat usage (both orgs; team page needs them) ---
  if (/ms\/organizations\/\d+\/roles\/?$/.test(url) && method === "get") {
    return makeResponse(DEMO_ROLES, config);
  }
  // Permission catalog for the role editor (must precede the my-permissions
  // handler is unaffected: "my-permissions" has no "/permissions" segment).
  if (/ms\/organizations\/\d+\/permissions\/?$/.test(url) && method === "get") {
    return makeResponse(DEMO_PERMISSION_OBJECTS, config);
  }
  // --- Billing: subscription info (powers Current plan + Invoices tab) ---
  if (/subscription-info\/?$/.test(url) && method === "get") {
    return makeResponse(DEMO_SUBSCRIPTION_INFO, config);
  }
  if (/list-cards\/?$/.test(url) && method === "get") {
    return makeResponse(DEMO_PAYMENT_CARDS, config);
  }
  // --- Notifications list (paginated; respects unread + search query params) ---
  if (/new-notifications\/?$/.test(url) && method === "get") {
    const rawUrl = config.url || "";
    const qs = rawUrl.includes("?")
      ? rawUrl.slice(rawUrl.indexOf("?") + 1)
      : "";
    const sp = new URLSearchParams(qs);
    const unread = sp.get("unread");
    const search = (sp.get("search") || "").toLowerCase();
    const page = Number(sp.get("page")) || 1;
    const pageSize = Number(sp.get("page_size")) || 10;

    let items = buildDemoNotifications();
    if (unread === "true") items = items.filter((n) => !n.read);
    else if (unread === "false") items = items.filter((n) => n.read);
    if (search) {
      items = items.filter((n) =>
        `${n.title} ${n.description}`.toLowerCase().includes(search)
      );
    }

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    return makeResponse(
      {
        results: items.slice(start, start + pageSize),
        total_count: total,
        total_pages: totalPages,
        current_page: page,
        page_size: pageSize,
        count: total,
        next: null,
        previous: null,
      },
      config
    );
  }
  if (/ms\/organizations\/\d+\/seat-usage\/?$/.test(url) && method === "get") {
    return makeResponse(seatUsageFor(orgIdOf(url)), config);
  }

  // --- Statuses & lead types: consumed as RAW arrays (org-level + settings).
  //     Must precede the paginated/detail fallbacks below. ---
  if (method === "get") {
    // Job statuses:  …/statuses/  and  …/settings/job-statuses/
    if (/ms\/organizations\/\d+\/(settings\/job-)?statuses\/?$/.test(url)) {
      return makeResponse(DEMO_JOB_STATUSES, config);
    }
    // Lead statuses:  …/lead_statuses/  and  …/settings/lead_statuses/
    if (/ms\/organizations\/\d+\/(settings\/)?lead_statuses\/?$/.test(url)) {
      return makeResponse(DEMO_LEAD_STATUSES, config);
    }
    // Lead types/sources:  …/leadTypes/  and  …/settings/leadTypes/
    if (/ms\/organizations\/\d+\/(settings\/)?leadTypes\/?$/.test(url)) {
      return makeResponse(DEMO_LEAD_TYPES, config);
    }
    // Payment statuses:  …/settings/payment-statuses/
    if (/ms\/organizations\/\d+\/settings\/payment-statuses\/?$/.test(url)) {
      return makeResponse(DEMO_PAYMENT_STATUSES, config);
    }
    // Project types:  …/project-types/  and  …/settings/project-types/
    // Optional ?category=T|E|R filters to that lead/job module. Returned as a
    // listResponse hybrid so both raw-array and paginated consumers work.
    if (/ms\/organizations\/\d+\/(settings\/)?project-types\/?$/.test(url)) {
      const category = new URLSearchParams(
        (config.url || "").split("?")[1] ?? ""
      ).get("category");
      const filtered = category
        ? DEMO_PROJECT_TYPES.filter((pt) => pt.category === category)
        : DEMO_PROJECT_TYPES;
      return makeResponse(listResponse(filtered), config);
    }

    // Notes & comments (generic): …/comments/?content_type&object_id&note_section
    // Returned as a RAW array (the hook fetches one batch per note section).
    // Seed a few records so the floating Notes tab shows its "new" red dot;
    // others stay empty to demonstrate the conditional indicator. Params arrive
    // either as config.params (axios) or serialized in the raw url.
    if (/ms\/organizations\/\d+\/comments\/?$/.test(url)) {
      const params = (config.params ?? {}) as Record<string, unknown>;
      const rawUrl = config.url || "";
      const sp = new URLSearchParams(
        rawUrl.includes("?") ? rawUrl.slice(rawUrl.indexOf("?") + 1) : ""
      );
      const objectId =
        params.object_id != null
          ? String(params.object_id)
          : sp.get("object_id");
      const noteSection =
        params.note_section != null
          ? String(params.note_section)
          : sp.get("note_section");
      return makeResponse(demoCommentsFor(objectId, noteSection), config);
    }

    // Dropdown mappings (useMapping → ms/dropdowns/<type>/): each is consumed as
    // a RAW array (.map/.find), so they must not fall through to the DRF page.
    if (/dropdowns\/content_types\/?$/.test(url)) {
      return makeResponse(DEMO_CONTENT_TYPES, config);
    }
    if (/dropdowns\/[^/]+\/?$/.test(url)) {
      return makeResponse([], config);
    }

    // Endpoints whose hooks `.map`/`.find` the response directly (no pagination
    // unwrap), so they need a RAW array rather than a DRF page. Empty = nothing.
    if (/ms\/organizations\/\d+\/scheduling\/items\/?$/.test(url)) {
      return makeResponse([], config);
    }
    // Org id for chat URLs is the segment after "chat/" (chat/{org}/…), which is
    // a different shape from the ms/organizations/{id}/… paths orgIdOf handles.
    const chatOrgId = url.match(/^chat\/([^/]+)\//)?.[1] ?? null;
    // Messaging chat groups (useChatGroups): full conversation roster for org 1,
    // empty (brand-new) for any other org.
    if (/chat\/[^/]+\/chatgroups\/?$/.test(url)) {
      const groups = chatOrgId === "1" ? CHAT_GROUPS : [];
      return makeResponse(groups, config);
    }
    // Unseen message counts per conversation (useUnseenChats → shell badge +
    // sidebar unread pills). Shape: { unseen_counts: { [groupId]: number } }.
    if (/chat\/[^/]+\/unseen\/count\/?$/.test(url)) {
      const counts = chatOrgId === "1" ? UNSEEN_COUNTS : {};
      return makeResponse({ unseen_counts: counts }, config);
    }
    // Unseen messages map (useUnseenChats) — not needed for the demo badges.
    if (/chat\/[^/]+\/unseen\/messages\/?$/.test(url)) {
      return makeResponse({ unseen_messages: {} }, config);
    }
  }

  // --- Writes: echo back the payload with a generated id ---
  if (["post", "put", "patch"].includes(method)) {
    const body = parseBody(config.data);
    return makeResponse(
      { id: ++mockIdCounter, ...body },
      config,
      method === "post" ? 201 : 200
    );
  }
  if (method === "delete") {
    return makeResponse({}, config, 204);
  }

  // --- Generic GET fallbacks ---
  // Detail endpoint (…/123/ or …/123) → empty object
  if (/\/\d+\/?$/.test(url)) {
    return makeResponse({}, config);
  }
  // Collection endpoint → empty list (array + pagination metadata; see listResponse)
  if (typeof console !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug(`[mockApi] unmatched GET → ${url} (returned empty list)`);
  }
  return makeResponse(listResponse([]), config);
};

export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
