const ORGANIZATION_PREFIX = "/organizations";
const ORG_ID_PARAM = ":orgId";
const LEGACY_ORG_ID_PARAM = ":orgId(\\d+)";

const APP_ROUTES = Object.freeze({
  dashboard: "/dashboard",
  calendar: "/calendar",
  footage: "/footage",
  leads: "/leads/drainage-tiling",
  leadsRepair: "/leads/repair",
  leadsExcavation: "/leads/excavation",
  leadsTiling: "/leads/drainage-tiling",
  jobs: "/jobs",
  jobsRepair: "/jobs/repair",
  jobsExcavation: "/jobs/excavation",
  jobsTiling: "/jobs/drainage-tiling",
  completed: "/completed",
  pendingApproval: "/pending/tiling",
  quickActions: "/quick-actions",
  orderPipe: "/order-pipe",
  bookKeeping: "/book-keeping",
  contact: "/contact",
  statusManagement: "/status-management",
  systemSettings: "/system-settings",
  favorites: "/favorites",
  crewManagement: "/crew-management",
  equipment: "/equipment",
  maintenance: "/maintenance",
  taskManagement: "/task-management",
  upcomingFeatures: "/upcoming-features",
  industrySpecialists: "/industry-specialists",
  messages: "/messages",
  map: "/map",
  subscribe: "/subscribe",
  settings: "/settings",
  organizationSettings: "/settings/org/organization",
  organizationPreferences: "/settings/org/org-preferences",
  ff360DesignParameters: "/settings/org/ff360-design-parameters",
  roleAccess: "/settings/org/role-access",
  team: "/settings/org/team",
  billing: "/settings/org/billing",
  trash: "/settings/org/trash",
  legacyStatusSettings: "/settings/org/settings",
  userSettings: "/settings/user",
  userPreferences: "/settings/user/preferences",
  userSecurity: "/settings/user/security",
  userNotifications: "/settings/user/notifications",
  userThemes: "/settings/user/themes",
  userDelete: "/settings/user/delete",
});

const LEGACY_APP_ROUTES = Object.freeze({
  preferences: "/preferences",
  org: "/org",
  orgInfo: "/org/info",
  orgPreferences: "/org/preferences",
  orgNotifications: "/org/notifications",
  orgSettings: "/org/settings",
  orgTeam: "/org/team",
  orgTrash: "/org/trash",
});

const APP_ROUTE_LABELS = Object.freeze({
  dashboard: "Dashboard",
  calendar: "Calendar",
  footage: "Installed Footage",
  leads: "Leads",
  jobs: "Jobs",
  completed: "Completed & Cancelled Jobs",
  pendingApproval: "Pending Approval",
  quickActions: "Quick Actions",
  orderPipe: "Order Pipe",
  bookKeeping: "Book Keeping",
  contact: "Contact Info",
  statusManagement: "Status Management",
  systemSettings: "System Settings",
  favorites: "Favorite Vendors",
  crewManagement: "Crew Management",
  equipment: "Equipment",
  maintenance: "Maintenance",
  taskManagement: "To-Do List",
  upcomingFeatures: "Upcoming Features",
  industrySpecialists: "Industry Specialists",
  organizationSettings: "Organization Settings",
  organizationInfo: "Organization Info",
  organizationPreferences: "Organization Preferences",
  ff360DesignParameters: "FF360 Design Parameters",
  roleAccess: "Role & Access Overview",
  team: "Team",
  billing: "Billing",
  trash: "Trash",
  userSettings: "User Settings",
  profile: "Profile",
  userPreferences: "User Preferences",
  security: "Security",
  notifications: "Notifications",
  themes: "Themes",
  deleteAccount: "Delete Account",
  subscribe: "Subscribe",
});

const SETTINGS_PAGE_METADATA = Object.freeze({
  organization: {
    title: "Organization Information",
    description: "Manage your organization information and location",
    route: APP_ROUTES.organizationSettings,
  },
  "org-preferences": {
    title: APP_ROUTE_LABELS.organizationPreferences,
    description: "Manage organization-wide preferences and defaults",
    route: APP_ROUTES.organizationPreferences,
  },
  "ff360-design-parameters": {
    title: APP_ROUTE_LABELS.ff360DesignParameters,
    description:
      "Configure default design parameters for FieldFlow360 design requests",
    route: APP_ROUTES.ff360DesignParameters,
  },
  "role-access": {
    title: APP_ROUTE_LABELS.roleAccess,
    description: "Review roles and permissions for your organization",
    route: APP_ROUTES.roleAccess,
  },
  team: {
    title: APP_ROUTE_LABELS.team,
    description: "Manage team members, roles, and invitations",
    route: APP_ROUTES.team,
  },
  billing: {
    title: APP_ROUTE_LABELS.billing,
    description: "Manage your subscription, payment methods, and invoices",
    route: APP_ROUTES.billing,
  },
  trash: {
    title: APP_ROUTE_LABELS.trash,
    description: "View and restore deleted items",
    route: APP_ROUTES.trash,
  },
  profile: {
    title: APP_ROUTE_LABELS.profile,
    description: "Manage your personal profile information",
    exact: true,
    route: APP_ROUTES.userSettings,
  },
  preferences: {
    title: APP_ROUTE_LABELS.userPreferences,
    description: "Manage your notification and display preferences",
    route: APP_ROUTES.userPreferences,
  },
  security: {
    title: APP_ROUTE_LABELS.security,
    description: "Update your password and security settings",
    route: APP_ROUTES.userSecurity,
  },
  notifications: {
    title: APP_ROUTE_LABELS.notifications,
    description: "View and manage your notifications",
    route: APP_ROUTES.userNotifications,
  },
  themes: {
    title: APP_ROUTE_LABELS.themes,
    description: "Customize your application appearance",
    route: APP_ROUTES.userThemes,
  },
  delete: {
    title: APP_ROUTE_LABELS.deleteAccount,
    description: "Permanently delete your account and associated data",
    route: APP_ROUTES.userDelete,
  },
});

function normalizeRelativePath(path) {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

function orgPath(orgId, path = "") {
  return `${ORGANIZATION_PREFIX}/${orgId}${normalizeRelativePath(path)}`;
}

function orgRoute(orgId, route) {
  return orgPath(orgId, route);
}

/** `/organizations/{orgId}{path}` with optional query (`?foo=bar` or `foo=bar`). */
function orgUrl(orgId, path = "", search) {
  const base = orgPath(orgId, path);
  if (search == null || search === "") {
    return base;
  }
  const query =
    typeof search === "string" ? search.replace(/^\?/, "") : String(search);
  return query ? `${base}?${query}` : base;
}

function orgRoutePattern(route, orgParam = ORG_ID_PARAM) {
  return orgPath(orgParam, route);
}

function appendWildcard(route) {
  return `${route}/:path*`;
}

function buildAppRedirects() {
  return [
    {
      source: `/${LEGACY_ORG_ID_PARAM}`,
      destination: orgRoutePattern(""),
      permanent: false,
    },
    {
      source: `/${LEGACY_ORG_ID_PARAM}/:path*`,
      destination: appendWildcard(orgRoutePattern("")),
      permanent: false,
    },
    {
      source: orgRoutePattern(LEGACY_APP_ROUTES.preferences),
      destination: orgRoutePattern(APP_ROUTES.organizationPreferences),
      permanent: false,
    },
    {
      source: appendWildcard(orgRoutePattern(LEGACY_APP_ROUTES.preferences)),
      destination: appendWildcard(
        orgRoutePattern(APP_ROUTES.organizationPreferences)
      ),
      permanent: false,
    },
    {
      source: orgRoutePattern(APP_ROUTES.legacyStatusSettings),
      destination: orgRoutePattern(APP_ROUTES.statusManagement),
      permanent: false,
    },
    {
      source: orgRoutePattern(APP_ROUTES.settings),
      destination: orgRoutePattern(APP_ROUTES.organizationSettings),
      permanent: false,
    },
    {
      source: orgRoutePattern(LEGACY_APP_ROUTES.orgInfo),
      destination: orgRoutePattern(APP_ROUTES.organizationSettings),
      permanent: false,
    },
    {
      source: appendWildcard(orgRoutePattern(LEGACY_APP_ROUTES.orgInfo)),
      destination: appendWildcard(
        orgRoutePattern(APP_ROUTES.organizationSettings)
      ),
      permanent: false,
    },
    {
      source: orgRoutePattern(LEGACY_APP_ROUTES.orgPreferences),
      destination: orgRoutePattern(APP_ROUTES.userPreferences),
      permanent: false,
    },
    {
      source: appendWildcard(orgRoutePattern(LEGACY_APP_ROUTES.orgPreferences)),
      destination: appendWildcard(orgRoutePattern(APP_ROUTES.userPreferences)),
      permanent: false,
    },
    {
      source: orgRoutePattern(LEGACY_APP_ROUTES.orgNotifications),
      destination: orgRoutePattern(APP_ROUTES.userNotifications),
      permanent: false,
    },
    {
      source: appendWildcard(
        orgRoutePattern(LEGACY_APP_ROUTES.orgNotifications)
      ),
      destination: appendWildcard(
        orgRoutePattern(APP_ROUTES.userNotifications)
      ),
      permanent: false,
    },
    {
      source: orgRoutePattern(LEGACY_APP_ROUTES.org),
      destination: orgRoutePattern(APP_ROUTES.organizationSettings),
      permanent: false,
    },
    {
      source: appendWildcard(orgRoutePattern(LEGACY_APP_ROUTES.org)),
      destination: appendWildcard(orgRoutePattern("/settings/org")),
      permanent: false,
    },
  ];
}

module.exports = {
  APP_ROUTE_LABELS,
  APP_ROUTES,
  LEGACY_APP_ROUTES,
  ORGANIZATION_PREFIX,
  SETTINGS_PAGE_METADATA,
  buildAppRedirects,
  normalizeRelativePath,
  orgPath,
  orgRoute,
  orgRoutePattern,
  orgUrl,
};
