import { JobLeadTypeRouteSegment } from "@/constants";
import { APP_ROUTES, LEGACY_APP_ROUTES } from "@/shared/config/routes";

export type AppRouteKind =
  | "feature"
  | "redirect"
  | "job-lead-lazy"
  | "job-gate-placeholder"
  | "public";

export interface AppRouteDefinition {
  id: string;
  /** Normalized path without org prefix; dynamic segments use `:id`. */
  normalizedPath: string;
  kind: AppRouteKind;
  featureModule?: string;
  permissionResource?: string;
  notes?: string;
}

const JOB_TYPES = [
  JobLeadTypeRouteSegment.REPAIR,
  JobLeadTypeRouteSegment.EXCAVATION,
  JobLeadTypeRouteSegment.DRAINAGE_TILING,
] as const;

function jobLeadRoutes(
  entity: "jobs" | "leads",
  permissionResource: string
): AppRouteDefinition[] {
  const routes: AppRouteDefinition[] = [];

  for (const type of JOB_TYPES) {
    const base = `/${entity}/${type}`;
    routes.push(
      {
        id: `${entity}-${type}-list`,
        normalizedPath: base,
        kind: "job-lead-lazy",
        featureModule: "features/job-lead",
        permissionResource,
      },
      {
        id: `${entity}-${type}-detail`,
        normalizedPath: `${base}/:id`,
        kind: "job-lead-lazy",
        featureModule: "features/job-lead",
        permissionResource,
      },
      {
        id: `${entity}-${type}-logs`,
        normalizedPath: `${base}/:id/logs`,
        kind: "job-lead-lazy",
        featureModule: "features/job-lead",
        permissionResource,
      }
    );
  }

  for (const type of JOB_TYPES) {
    routes.push({
      id: `jobs-${type}-on-site`,
      normalizedPath: `/jobs/${type}/:id/on-site-tracking`,
      kind: "feature",
      featureModule: "features/time-tracking",
      permissionResource: "jobs_*_page",
    });
  }

  return routes;
}

/** Canonical org-scoped routes frontend-2 must ship (parity with classic frontend). */
export const ORG_APP_ROUTE_REGISTRY: AppRouteDefinition[] = [
  {
    id: "dashboard",
    normalizedPath: APP_ROUTES.dashboard,
    kind: "feature",
    featureModule: "features/dashboard",
  },
  {
    id: "calendar",
    normalizedPath: APP_ROUTES.calendar,
    kind: "feature",
    featureModule: "features/calendar",
  },
  {
    id: "map",
    normalizedPath: APP_ROUTES.map,
    kind: "feature",
    featureModule: "features/map",
  },
  {
    id: "messages",
    normalizedPath: APP_ROUTES.messages,
    kind: "feature",
    featureModule: "features/messaging",
  },
  {
    id: "footage",
    normalizedPath: APP_ROUTES.footage,
    kind: "feature",
    featureModule: "features/footage",
  },
  {
    id: "maintenance",
    normalizedPath: APP_ROUTES.maintenance,
    kind: "feature",
    featureModule: "features/maintenance",
  },
  {
    id: "book-keeping",
    normalizedPath: APP_ROUTES.bookKeeping,
    kind: "feature",
    featureModule: "features/book-keeping",
  },
  {
    id: "task-management",
    normalizedPath: APP_ROUTES.taskManagement,
    kind: "feature",
    featureModule: "features/task-management",
  },
  {
    id: "upcoming-features",
    normalizedPath: APP_ROUTES.upcomingFeatures,
    kind: "feature",
    featureModule: "features/upcoming-features",
  },
  {
    id: "industry-specialists",
    normalizedPath: APP_ROUTES.industrySpecialists,
    kind: "feature",
    featureModule: "features/industry-specialists",
  },
  {
    id: "subscribe",
    normalizedPath: APP_ROUTES.subscribe,
    kind: "feature",
    featureModule: "features/subscribe",
    notes: "Owner-gated in UI",
  },
  {
    id: "contact-list",
    normalizedPath: APP_ROUTES.contact,
    kind: "feature",
    featureModule: "features/contacts",
    permissionResource: "contact_access",
  },
  {
    id: "contact-detail",
    normalizedPath: `${APP_ROUTES.contact}/:id`,
    kind: "feature",
    featureModule: "features/contacts",
    permissionResource: "contact_access",
  },
  {
    id: "contact-logs",
    normalizedPath: `${APP_ROUTES.contact}/:id/logs`,
    kind: "feature",
    featureModule: "features/activity-log",
    permissionResource: "contact_access",
  },
  {
    id: "equipment-list",
    normalizedPath: APP_ROUTES.equipment,
    kind: "feature",
    featureModule: "features/equipment",
    permissionResource: "equipment_page",
  },
  {
    id: "equipment-detail",
    normalizedPath: `${APP_ROUTES.equipment}/:id`,
    kind: "feature",
    featureModule: "features/equipment",
    permissionResource: "equipment_page",
  },
  {
    id: "equipment-logs",
    normalizedPath: `${APP_ROUTES.equipment}/:id/logs`,
    kind: "feature",
    featureModule: "features/activity-log",
    permissionResource: "equipment_page",
  },
  {
    id: "completed-list",
    normalizedPath: APP_ROUTES.completed,
    kind: "feature",
    featureModule: "features/completed",
    permissionResource: "completed_canceled_page",
  },
  {
    id: "completed-detail",
    normalizedPath: `${APP_ROUTES.completed}/:id`,
    kind: "feature",
    featureModule: "features/completed",
    permissionResource: "completed_canceled_page",
  },
  {
    id: "order-pipe-list",
    normalizedPath: APP_ROUTES.orderPipe,
    kind: "feature",
    featureModule: "features/order-pipe",
    permissionResource: "order_pipes_list",
  },
  {
    id: "order-pipe-detail",
    normalizedPath: `${APP_ROUTES.orderPipe}/:id`,
    kind: "feature",
    featureModule: "features/order-pipe",
    permissionResource: "order_pipes_list",
  },
  {
    id: "order-pipe-logs",
    normalizedPath: `${APP_ROUTES.orderPipe}/:id/logs`,
    kind: "feature",
    featureModule: "features/activity-log",
    permissionResource: "order_pipes_list",
  },
  {
    id: "favorites",
    normalizedPath: APP_ROUTES.favorites,
    kind: "feature",
    featureModule: "features/order-pipe",
    permissionResource: "settings_page",
  },
  {
    id: "quick-actions-list",
    normalizedPath: APP_ROUTES.quickActions,
    kind: "feature",
    featureModule: "features/quick-actions",
  },
  {
    id: "quick-actions-detail",
    normalizedPath: `${APP_ROUTES.quickActions}/:id`,
    kind: "feature",
    featureModule: "features/quick-actions",
  },
  {
    id: "crew-management",
    normalizedPath: APP_ROUTES.crewManagement,
    kind: "feature",
    featureModule: "features/crew-management",
    permissionResource: "crew_management_page",
  },
  {
    id: "status-management",
    normalizedPath: APP_ROUTES.statusManagement,
    kind: "feature",
    featureModule: "features/status-management",
    permissionResource: "settings_page",
  },
  {
    id: "system-settings",
    normalizedPath: APP_ROUTES.systemSettings,
    kind: "feature",
    featureModule: "features/pin-categories",
    permissionResource: "settings_page",
  },
  {
    id: "settings-index",
    normalizedPath: APP_ROUTES.settings,
    kind: "redirect",
    notes: "Redirects to organization settings",
  },
  {
    id: "settings-org-index",
    normalizedPath: "/settings/org",
    kind: "redirect",
  },
  {
    id: "settings-legacy-status",
    normalizedPath: APP_ROUTES.legacyStatusSettings,
    kind: "redirect",
    notes: "Redirects to status-management",
  },
  {
    id: "settings-org-organization",
    normalizedPath: APP_ROUTES.organizationSettings,
    kind: "feature",
    featureModule: "features/org",
    permissionResource: "team_organization_info",
  },
  {
    id: "settings-org-team",
    normalizedPath: APP_ROUTES.team,
    kind: "feature",
    featureModule: "features/team-management",
    permissionResource: "team_organization_info",
  },
  {
    id: "settings-org-billing",
    normalizedPath: APP_ROUTES.billing,
    kind: "feature",
    featureModule: "features/billing",
    notes: "Owner-gated",
  },
  {
    id: "settings-org-trash",
    normalizedPath: APP_ROUTES.trash,
    kind: "feature",
    featureModule: "features/org-trash",
    permissionResource: "trash_page",
  },
  {
    id: "settings-org-role-access",
    normalizedPath: APP_ROUTES.roleAccess,
    kind: "feature",
    featureModule: "features/role-access",
  },
  {
    id: "settings-org-preferences",
    normalizedPath: APP_ROUTES.organizationPreferences,
    kind: "feature",
    featureModule: "features/org-preferences",
  },
  {
    id: "settings-ff360-design",
    normalizedPath: APP_ROUTES.ff360DesignParameters,
    kind: "feature",
    featureModule: "features/org-design-parameters",
    notes: "v2-only route",
  },
  {
    id: "settings-user",
    normalizedPath: APP_ROUTES.userSettings,
    kind: "feature",
    featureModule: "features/user-settings",
  },
  {
    id: "settings-user-preferences",
    normalizedPath: APP_ROUTES.userPreferences,
    kind: "feature",
    featureModule: "features/user-settings",
  },
  {
    id: "settings-user-security",
    normalizedPath: APP_ROUTES.userSecurity,
    kind: "feature",
    featureModule: "features/security",
  },
  {
    id: "settings-user-notifications",
    normalizedPath: APP_ROUTES.userNotifications,
    kind: "feature",
    featureModule: "features/notification",
  },
  {
    id: "settings-user-themes",
    normalizedPath: APP_ROUTES.userThemes,
    kind: "feature",
    featureModule: "features/user-settings",
  },
  {
    id: "settings-user-delete",
    normalizedPath: APP_ROUTES.userDelete,
    kind: "feature",
    featureModule: "features/user-settings",
  },
  {
    id: "pending-repair",
    normalizedPath: "/pending/repair",
    kind: "job-gate-placeholder",
    permissionResource: "jobs_repair_page",
  },
  {
    id: "pending-excavation",
    normalizedPath: "/pending/excavation",
    kind: "job-gate-placeholder",
    permissionResource: "jobs_excavation_page",
  },
  {
    id: "pending-tiling",
    normalizedPath: "/pending/tiling",
    kind: "job-gate-placeholder",
    permissionResource: "jobs_tiling_page",
  },
  ...jobLeadRoutes("jobs", "jobs_*_page"),
  ...jobLeadRoutes("leads", "leads_page"),
];

export const PUBLIC_APP_ROUTE_REGISTRY: AppRouteDefinition[] = [
  { id: "home", normalizedPath: "/", kind: "public" },
  { id: "sign-in", normalizedPath: "/sign-in", kind: "public" },
  { id: "terms", normalizedPath: "/terms", kind: "public" },
  {
    id: "create",
    normalizedPath: "/create",
    kind: "public",
    featureModule: "features/organizations",
  },
  { id: "success", normalizedPath: "/success", kind: "public" },
  {
    id: "organizations",
    normalizedPath: "/organizations",
    kind: "public",
    featureModule: "features/organizations",
  },
  {
    id: "auth-callback",
    normalizedPath: "/auth/callback",
    kind: "public",
    featureModule: "features/auth",
  },
  {
    id: "auth-verify",
    normalizedPath: "/auth/verify-email",
    kind: "public",
    featureModule: "features/auth",
  },
  {
    id: "help-center",
    normalizedPath: "/help-center",
    kind: "public",
    featureModule: "features/help-center",
  },
  {
    id: "help-kb",
    normalizedPath: "/help-center/knowledge-base",
    kind: "public",
    featureModule: "features/help-center",
  },
  {
    id: "help-support",
    normalizedPath: "/help-center/contact-support",
    kind: "public",
    featureModule: "features/help-center",
  },
];

/** Legacy v1-only paths that redirect in v2 (from shared/config/routes.js). */
export const LEGACY_REDIRECT_SOURCES = [
  LEGACY_APP_ROUTES.preferences,
  LEGACY_APP_ROUTES.orgInfo,
  LEGACY_APP_ROUTES.orgPreferences,
  LEGACY_APP_ROUTES.orgNotifications,
  LEGACY_APP_ROUTES.org,
  LEGACY_APP_ROUTES.orgSettings,
] as const;
