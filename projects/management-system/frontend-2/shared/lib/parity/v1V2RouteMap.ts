/** Maps classic v1 org URLs to frontend-2 normalized app paths (no org prefix). */
export interface V1V2RoutePair {
  v1Path: string;
  v2AppPath: string;
  /** v2 adds permission mapping where v1 had none — intentional, not a regression. */
  v2PermissionEnhancement?: boolean;
}

export const V1_V2_ORG_ROUTE_PAIRS: V1V2RoutePair[] = [
  { v1Path: "/12/dashboard", v2AppPath: "/dashboard" },
  { v1Path: "/12/calendar", v2AppPath: "/calendar" },
  { v1Path: "/12/map", v2AppPath: "/map" },
  { v1Path: "/12/messages", v2AppPath: "/messages" },
  { v1Path: "/12/footage", v2AppPath: "/footage" },
  { v1Path: "/12/maintenance", v2AppPath: "/maintenance" },
  { v1Path: "/12/book-keeping", v2AppPath: "/book-keeping" },
  { v1Path: "/12/task-management", v2AppPath: "/task-management" },
  { v1Path: "/12/upcoming-features", v2AppPath: "/upcoming-features" },
  { v1Path: "/12/industry-specialists", v2AppPath: "/industry-specialists" },
  { v1Path: "/12/subscribe", v2AppPath: "/subscribe" },
  { v1Path: "/12/contact", v2AppPath: "/contact" },
  { v1Path: "/12/contact/42", v2AppPath: "/contact/42" },
  { v1Path: "/12/contact/42/logs", v2AppPath: "/contact/42/logs" },
  { v1Path: "/12/equipment", v2AppPath: "/equipment" },
  { v1Path: "/12/equipment/7/logs", v2AppPath: "/equipment/7/logs" },
  { v1Path: "/12/completed", v2AppPath: "/completed" },
  { v1Path: "/12/completed/99", v2AppPath: "/completed/99" },
  { v1Path: "/12/order-pipe", v2AppPath: "/order-pipe" },
  { v1Path: "/12/order-pipe/3/logs", v2AppPath: "/order-pipe/3/logs" },
  { v1Path: "/12/favorites", v2AppPath: "/favorites" },
  { v1Path: "/12/quick-actions", v2AppPath: "/quick-actions" },
  { v1Path: "/12/quick-actions/5", v2AppPath: "/quick-actions/5" },
  { v1Path: "/12/crew-management", v2AppPath: "/crew-management" },
  { v1Path: "/12/status-management", v2AppPath: "/status-management" },
  { v1Path: "/12/system-settings", v2AppPath: "/system-settings" },
  { v1Path: "/12/jobs/repair", v2AppPath: "/jobs/repair" },
  { v1Path: "/12/jobs/repair/1", v2AppPath: "/jobs/repair/1" },
  {
    v1Path: "/12/jobs/repair/1/on-site-tracking",
    v2AppPath: "/jobs/repair/1/on-site-tracking",
  },
  { v1Path: "/12/jobs/repair/1/logs", v2AppPath: "/jobs/repair/1/logs" },
  { v1Path: "/12/jobs/excavation", v2AppPath: "/jobs/excavation" },
  { v1Path: "/12/jobs/drainage-tiling", v2AppPath: "/jobs/drainage-tiling" },
  { v1Path: "/12/leads/repair", v2AppPath: "/leads/repair" },
  {
    v1Path: "/12/leads/excavation/2/logs",
    v2AppPath: "/leads/excavation/2/logs",
  },
  { v1Path: "/12/pending/repair", v2AppPath: "/pending/repair" },
  { v1Path: "/12/pending/excavation", v2AppPath: "/pending/excavation" },
  { v1Path: "/12/pending/tiling", v2AppPath: "/pending/tiling" },
  { v1Path: "/12/org/trash", v2AppPath: "/settings/org/trash" },
  { v1Path: "/12/org/team", v2AppPath: "/settings/org/team" },
  { v1Path: "/12/org/settings", v2AppPath: "/status-management" },
  {
    v1Path: "/12/org/info",
    v2AppPath: "/settings/org/organization",
    v2PermissionEnhancement: true,
  },
  {
    v1Path: "/12/org/billing",
    v2AppPath: "/settings/org/billing",
    v2PermissionEnhancement: true,
  },
  {
    v1Path: "/12/org/role-access",
    v2AppPath: "/settings/org/role-access",
    v2PermissionEnhancement: true,
  },
  {
    v1Path: "/12/org/org-preferences",
    v2AppPath: "/settings/org/org-preferences",
    v2PermissionEnhancement: true,
  },
  {
    v1Path: "/12/user",
    v2AppPath: "/settings/user",
    v2PermissionEnhancement: true,
  },
  {
    v1Path: "/12/user/security",
    v2AppPath: "/settings/user/security",
    v2PermissionEnhancement: true,
  },
  {
    v1Path: "/12/user/preferences",
    v2AppPath: "/settings/user/preferences",
    v2PermissionEnhancement: true,
  },
  {
    v1Path: "/12/user/notifications",
    v2AppPath: "/settings/user/notifications",
    v2PermissionEnhancement: true,
  },
  {
    v1Path: "/12/user/themes",
    v2AppPath: "/settings/user/themes",
    v2PermissionEnhancement: true,
  },
  {
    v1Path: "/12/user/delete",
    v2AppPath: "/settings/user/delete",
    v2PermissionEnhancement: true,
  },
];
