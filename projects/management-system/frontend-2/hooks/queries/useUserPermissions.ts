"use client";

import { useEffect } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PermissionsService } from "@/api/services";
import type { UserPermissionsResponse } from "@/api/types";
import { CACHE_TIME, PermissionCode, QUERY_KEYS } from "@/constants";

import { StorageKey } from "../storage-data";
import { usePersistentStorage } from "../usePersistentStorage";
import { useRouteIds } from "../useRouteIds";

/**
 * Shared query configuration for user permissions
 */
const useUserPermissionsQuery = () => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<UserPermissionsResponse>({
    queryKey: [QUERY_KEYS.USER_PERMISSIONS, organizationId],
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return PermissionsService.getMyPermissions(organizationId);
    },
    enabled: !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};

export const useUserPermissions = () => {
  const storage = usePersistentStorage();
  const query = useUserPermissionsQuery();

  useEffect(() => {
    if (query.data) {
      try {
        storage.setItem("userPermissions", JSON.stringify(query.data));

        // Add role-based permission codes
        const permissionCodes = [...query.data.permission_codes];
        if (query.data.role?.name === "Admin") {
          permissionCodes.push("is_admin");
        }

        storage.setItem(StorageKey.PERM_CODES, JSON.stringify(permissionCodes));
        storage.setItem(StorageKey.USER_ROLE, JSON.stringify(query.data.role));
      } catch (error) {
        console.error("Failed to store user permissions:", error);
      }
    }
  }, [query.data, storage]);

  return query;
};

export const useHasPermission = (
  permissionCodes: PermissionCode | PermissionCode[] | null
) => {
  const storage = usePersistentStorage();
  const query = useUserPermissionsQuery();

  const normalizedCodes = Array.isArray(permissionCodes)
    ? permissionCodes.filter(Boolean)
    : permissionCodes
      ? [permissionCodes]
      : [];

  const hasPermission = (code: string): boolean => {
    // API data has priority
    if (query.data?.permission_codes && !query.isLoading) {
      return query.data.permission_codes.includes(code);
    }

    // Fallback to cache
    const cachedPermissionCodes = storage.getItem(StorageKey.PERM_CODES);
    if (cachedPermissionCodes) {
      try {
        const codes = JSON.parse(cachedPermissionCodes) as string[];
        return codes.includes(code);
      } catch {
        console.error("Failed to parse cached permission codes");
      }
    }

    return false;
  };

  const hasAnyPermission = (): boolean => {
    if (normalizedCodes.length === 0) return false;
    return normalizedCodes.some(hasPermission);
  };

  const hasAllPermissions = (): boolean => {
    if (normalizedCodes.length === 0) return false;
    return normalizedCodes.every(hasPermission);
  };

  return {
    ...query,
    hasAnyPermission,
    hasAllPermissions,
    hasPermission: hasAnyPermission,
  };
};

export const useUserRole = () => {
  const query = useUserPermissionsQuery();

  return {
    ...query,
    data: query.data?.role,
  };
};

export const useInvalidateUserPermissions = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.USER_PERMISSIONS, organizationId],
    });
  };
};
