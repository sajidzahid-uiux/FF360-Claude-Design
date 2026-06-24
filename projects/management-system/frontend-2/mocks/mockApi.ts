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

import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from "@/hooks/permissions/constants";

import { routes as bookkeepingRoutes } from "./data/bookkeeping";
import {
  routes as contactRoutes,
  recordFarmsForContact,
} from "./data/contacts";
import { routes as crewRoutes } from "./data/crews";
import { routes as equipmentRoutes } from "./data/equipment";
import { routes as jobRoutes } from "./data/jobs";
import { routes as leadRoutes } from "./data/leads";
import { routes as memberRoutes } from "./data/members";
import { routes as orderPipeRoutes } from "./data/orderPipe";
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
  if (url.includes("permission") && method === "get") {
    return makeResponse(DEMO_PERMISSIONS, config);
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
    // Messaging chat groups (useChatGroups).
    if (/chat\/[^/]+\/chatgroups\/?$/.test(url)) {
      return makeResponse([], config);
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
