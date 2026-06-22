import { APP_ROUTES, LEGACY_APP_ROUTES } from "@/shared/config/routes";
import { escapeRegExp } from "@/shared/lib/escapeRegExp";

import { PERMISSION_RESOURCES } from "./constants";
import type { PermissionCodeMap } from "./parsePermissionCodes";

export interface MatchedRoutePermission {
  resource: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

/** Strips org prefix so route patterns match `/organizations/:id/...` and legacy `/:id/...`. */
export function normalizeAppPathname(pathname: string): string {
  const organizationsMatch = pathname.match(/^\/organizations\/[^/]+(\/.*)?$/);
  if (organizationsMatch) {
    return organizationsMatch[1] ?? "";
  }

  const legacyOrgMatch = pathname.match(/^\/\d+(\/.*)?$/);
  if (legacyOrgMatch) {
    return legacyOrgMatch[1] ?? "";
  }

  return pathname;
}

function routePattern(...routes: string[]) {
  return new RegExp(
    `^(?:${routes.map((route) => escapeRegExp(route)).join("|")})(?:/|$)`
  );
}

function exactRoutePattern(...routes: string[]) {
  return new RegExp(
    `^(?:${routes.map((route) => escapeRegExp(route)).join("|")})/?$`
  );
}

const ROUTE_PERMISSION_PATTERNS: Array<{
  pattern: RegExp;
  resourceKey: string;
}> = [
  {
    pattern: routePattern(APP_ROUTES.jobsRepair),
    resourceKey: PERMISSION_RESOURCES.JOBS_REPAIR_PAGE,
  },
  {
    pattern: routePattern(APP_ROUTES.jobsExcavation),
    resourceKey: PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE,
  },
  {
    pattern: routePattern(APP_ROUTES.jobsTiling),
    resourceKey: PERMISSION_RESOURCES.JOBS_TILING_PAGE,
  },
  {
    pattern: routePattern(APP_ROUTES.contact),
    resourceKey: PERMISSION_RESOURCES.CONTACT_ACCESS,
  },
  {
    pattern: routePattern(APP_ROUTES.equipment),
    resourceKey: PERMISSION_RESOURCES.EQUIPMENT_PAGE,
  },
  {
    pattern: routePattern(APP_ROUTES.completed),
    resourceKey: PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE,
  },
  {
    pattern: routePattern(APP_ROUTES.crewManagement),
    resourceKey: PERMISSION_RESOURCES.CREW_MANAGEMENT_PAGE,
  },
  {
    pattern: routePattern(
      APP_ROUTES.trash,
      LEGACY_APP_ROUTES.orgTrash,
      "/trash"
    ),
    resourceKey: PERMISSION_RESOURCES.TRASH_PAGE,
  },
  {
    pattern: routePattern(APP_ROUTES.team, LEGACY_APP_ROUTES.orgTeam),
    resourceKey: PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO,
  },
  {
    pattern: exactRoutePattern(LEGACY_APP_ROUTES.org),
    resourceKey: PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO,
  },
  {
    pattern: routePattern(
      APP_ROUTES.organizationSettings,
      LEGACY_APP_ROUTES.orgInfo
    ),
    resourceKey: PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO,
  },
  {
    pattern: routePattern(
      APP_ROUTES.statusManagement,
      APP_ROUTES.systemSettings,
      LEGACY_APP_ROUTES.orgSettings
    ),
    resourceKey: PERMISSION_RESOURCES.SETTINGS_PAGE,
  },
  {
    pattern: routePattern(APP_ROUTES.legacyStatusSettings),
    resourceKey: PERMISSION_RESOURCES.SETTINGS_PAGE,
  },
  {
    pattern: routePattern(APP_ROUTES.settings),
    resourceKey: PERMISSION_RESOURCES.SETTINGS_PAGE,
  },
  {
    pattern: routePattern(APP_ROUTES.favorites),
    resourceKey: PERMISSION_RESOURCES.SETTINGS_PAGE,
  },
  {
    pattern: routePattern(
      APP_ROUTES.leadsRepair,
      APP_ROUTES.leadsExcavation,
      APP_ROUTES.leadsTiling
    ),
    resourceKey: PERMISSION_RESOURCES.LEADS_PAGE,
  },
  {
    pattern: routePattern(APP_ROUTES.orderPipe),
    resourceKey: PERMISSION_RESOURCES.ORDER_PIPES_LIST,
  },
];

export function matchAppRoutePermission(
  appPath: string,
  parsedPermissions: PermissionCodeMap
): MatchedRoutePermission | null {
  for (const { pattern, resourceKey } of ROUTE_PERMISSION_PATTERNS) {
    if (!pattern.test(appPath)) continue;

    const resourcePerms = parsedPermissions[resourceKey] ?? {
      read: false,
      write: false,
      delete: false,
    };

    return {
      resource: resourceKey,
      read: resourcePerms.read || false,
      write: resourcePerms.write || false,
      delete: resourcePerms.delete || false,
    };
  }

  return null;
}

export function matchPathnameRoutePermission(
  pathname: string,
  parsedPermissions: PermissionCodeMap
): MatchedRoutePermission | null {
  return matchAppRoutePermission(
    normalizeAppPathname(pathname),
    parsedPermissions
  );
}
