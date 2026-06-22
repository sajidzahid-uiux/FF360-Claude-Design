import { PERMISSION_RESOURCES } from "@/hooks/permissions/constants";
import type { PermissionCodeMap } from "@/hooks/permissions/parsePermissionCodes";

export interface V1RoutePermissionMatch {
  resource: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

/** Mirrors `frontend/hooks/permissions/useRoutePermissions.ts` URL patterns (classic v1). */
const V1_ROUTE_PATTERNS: Array<{ pattern: RegExp; resourceKey: string }> = [
  {
    pattern: /^\/(?:\d+\/)?jobs\/repair/,
    resourceKey: PERMISSION_RESOURCES.JOBS_REPAIR_PAGE,
  },
  {
    pattern: /^\/(?:\d+\/)?jobs\/excavation/,
    resourceKey: PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE,
  },
  {
    pattern: /^\/(?:\d+\/)?jobs\/drainage-tiling/,
    resourceKey: PERMISSION_RESOURCES.JOBS_TILING_PAGE,
  },
  {
    pattern: /^\/(?:\d+\/)?contact/,
    resourceKey: PERMISSION_RESOURCES.CONTACT_ACCESS,
  },
  {
    pattern: /^\/(?:\d+\/)?equipment/,
    resourceKey: PERMISSION_RESOURCES.EQUIPMENT_PAGE,
  },
  {
    pattern: /^\/(?:\d+\/)?completed/,
    resourceKey: PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE,
  },
  {
    pattern: /^\/(?:\d+\/)?crew-management/,
    resourceKey: PERMISSION_RESOURCES.CREW_MANAGEMENT_PAGE,
  },
  {
    pattern:
      /^\/(?:\d+\/)?(?:org\/settings|settings|status-management|system-settings)/,
    resourceKey: PERMISSION_RESOURCES.SETTINGS_PAGE,
  },
  {
    pattern: /^\/(?:\d+\/)?favorites/,
    resourceKey: PERMISSION_RESOURCES.SETTINGS_PAGE,
  },
  {
    pattern: /^\/(?:\d+\/)?(?:org\/trash|trash)/,
    resourceKey: PERMISSION_RESOURCES.TRASH_PAGE,
  },
  {
    pattern: /^\/(?:\d+\/)?org\/team/,
    resourceKey: PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO,
  },
  {
    pattern: /^\/(?:\d+\/)?leads/,
    resourceKey: PERMISSION_RESOURCES.LEADS_PAGE,
  },
  {
    pattern: /^\/(?:\d+\/)?order-pipe/,
    resourceKey: PERMISSION_RESOURCES.ORDER_PIPES_LIST,
  },
];

export function matchV1RoutePermission(
  pathname: string,
  parsedPermissions: PermissionCodeMap
): V1RoutePermissionMatch | null {
  for (const { pattern, resourceKey } of V1_ROUTE_PATTERNS) {
    if (!pattern.test(pathname)) continue;

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
