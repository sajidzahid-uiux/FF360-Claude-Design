import { useQuery } from "@tanstack/react-query";

import { RolesService } from "@/api/services";
import type { Role } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";
import { useIsAdmin } from "./useIsAdmin";

export const useRoles = () => {
  const { orgId: organizationId } = useRouteIds();
  const isAdmin = useIsAdmin();

  // Only enable query if user is admin (roles endpoint requires IsAdminMember permission)

  return useQuery<Role[]>({
    queryKey: [QUERY_KEYS.ROLES, organizationId],
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return RolesService.getRoles(organizationId);
    },
    enabled: !!organizationId && isAdmin,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};

export const useRole = (roleId: number | string | null) => {
  const { orgId: organizationId } = useRouteIds();
  const isAdmin = useIsAdmin();

  // Only enable query if user is admin (roles endpoint requires IsAdminMember permission)

  return useQuery<Role>({
    queryKey: [QUERY_KEYS.ROLES, organizationId, roleId],
    queryFn: () => {
      if (!organizationId || !roleId) {
        throw new Error("Organization ID and Role ID are required");
      }
      return RolesService.getRole(organizationId, roleId);
    },
    enabled: !!organizationId && !!roleId && isAdmin,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};
