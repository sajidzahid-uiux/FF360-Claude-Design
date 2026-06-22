"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { isValidPermissionCode } from "@/utils/validation";

import { StorageKey } from "../storage-data";
import {
  type MatchedRoutePermission,
  matchPathnameRoutePermission,
} from "./matchAppRoutePermission";
import { parsePermissionCodes } from "./parsePermissionCodes";

type RoutePermission = MatchedRoutePermission;

/**
 * Hook to check permissions for the current route
 * Automatically matches the current URL path with permission resources
 *
 * @returns {RoutePermission | null} Permission object for the matched route, or null if no match
 *
 * @example
 * const routePerms = useRoutePermissions();
 *
 * if (routePerms?.read) {
 *   // User can view current page
 * }
 *
 * if (routePerms?.write) {
 *   // User can edit current page
 * }
 */
export const useRoutePermissions = (): RoutePermission | null => {
  const pathname = usePathname();

  return useMemo(() => {
    try {
      // Check if localStorage is available (client-side only)
      if (typeof window === "undefined") {
        return null;
      }

      const storedPermissionCodes = localStorage.getItem(StorageKey.PERM_CODES);

      if (!storedPermissionCodes) {
        return null;
      }

      let permissionCodesArray: string[];

      try {
        const parsed = JSON.parse(storedPermissionCodes);

        if (!Array.isArray(parsed)) {
          console.warn("Invalid permission codes format: not an array");
          return null;
        }

        permissionCodesArray = parsed.filter(
          (code): code is string =>
            typeof code === "string" && isValidPermissionCode(code)
        );

        if (permissionCodesArray.length === 0) {
          console.warn("No valid permission codes found");
          return null;
        }
      } catch (parseError) {
        console.error("Failed to parse permission codes:", parseError);
        return null;
      }

      const parsedPermissions = parsePermissionCodes(permissionCodesArray);
      return matchPathnameRoutePermission(pathname, parsedPermissions);
    } catch (err) {
      console.error("Failed to check route permissions:", err);
      return null;
    }
  }, [pathname]);
};
