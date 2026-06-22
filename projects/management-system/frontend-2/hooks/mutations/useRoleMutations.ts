import { useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { RolesService } from "@/api/services";
import type { Role, RoleCreatePayload, RoleUpdatePayload } from "@/api/types";
import type { RoleIdUpdatePayload } from "@/api/types/common";
import { QUERY_KEYS } from "@/constants/enums";

import { useRouteIds } from "../useRouteIds";

export const useRoleMutations = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  // Invalidate all role-related queries
  const invalidateRoleQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROLES] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERMISSIONS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM] });
    // Invalidate member_roles mapping query used by the Members filter dropdown
    queryClient.invalidateQueries({
      queryKey: ["memberRoleData", "member_roles"],
      exact: false,
    });
  }, [queryClient]);

  const createRole = useMutation({
    mutationFn: (payload: RoleCreatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return RolesService.createRole(organizationId, payload);
    },
    onSuccess: () => {
      invalidateRoleQueries();
      toast.success("Role created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create role");
    },
  });

  const updateRole = useMutation({
    mutationFn: (args: RoleIdUpdatePayload<RoleUpdatePayload, Role>) => {
      const { roleId, payload } = args;
      if (!organizationId) throw new Error("Organization ID is required");
      return RolesService.updateRole(organizationId, roleId, payload);
    },
    onSuccess: () => {
      invalidateRoleQueries();
      toast.success("Role permissions updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role permissions");
    },
  });

  const deleteRole = useMutation({
    mutationFn: (roleId: number | string) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return RolesService.deleteRole(organizationId, roleId);
    },
    onSuccess: () => {
      invalidateRoleQueries();
      toast.success("Role deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete role");
    },
  });

  return {
    createRole,
    updateRole,
    deleteRole,
    updateRolePermissions: updateRole,
  };
};
