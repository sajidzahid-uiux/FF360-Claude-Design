import { useQuery } from "@tanstack/react-query";

import { PermissionsService } from "@/api/services";
import type { Permission } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";
import { useIsAdmin } from "./useIsAdmin";

export const usePermissions = () => {
  const { orgId: organizationId } = useRouteIds();
  const isAdmin = useIsAdmin();

  // Only enable query if user is admin (permissions endpoint requires IsAdminMember permission)

  return useQuery<Permission[]>({
    queryKey: [QUERY_KEYS.PERMISSIONS, organizationId],
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return PermissionsService.getPermissions(organizationId);
    },
    enabled: !!organizationId && isAdmin,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};

export const usePermission = (permissionId: number | string | null) => {
  const { orgId: organizationId } = useRouteIds();
  const isAdmin = useIsAdmin();

  // Only enable query if user is admin (permissions endpoint requires IsAdminMember permission)

  return useQuery<Permission>({
    queryKey: [QUERY_KEYS.PERMISSIONS, organizationId, permissionId],
    queryFn: () => {
      if (!organizationId || !permissionId) {
        throw new Error("Organization ID and Permission ID are required");
      }
      return PermissionsService.getPermission(organizationId, permissionId);
    },
    enabled: !!organizationId && !!permissionId && isAdmin,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};
