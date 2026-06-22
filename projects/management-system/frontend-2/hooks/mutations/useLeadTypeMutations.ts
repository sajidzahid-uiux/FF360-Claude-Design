import { useMutation, useQueryClient } from "@tanstack/react-query";

import { StatusesService } from "@/api/services/statusesService";
import type {
  OrganizationLeadTypeCreatePayload,
  OrganizationLeadTypeUpdateVariables,
} from "@/api/types/settings";
import { QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

function invalidateLeadTypeQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  organizationId: string | null | undefined
) {
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.LEAD_TYPES, organizationId],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.LEAD_TYPES, "settings", organizationId],
  });
}

export function useLeadTypeMutations() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const updateLeadType = useMutation({
    mutationFn: (updatedLeadType: OrganizationLeadTypeUpdateVariables) => {
      if (!organizationId) throw new Error("Organization ID is required");
      const { id, ...data } = updatedLeadType;
      if (id == null) throw new Error("Lead type id is required");
      return StatusesService.updateLeadType(organizationId, id, data);
    },
    onSettled: () => invalidateLeadTypeQueries(queryClient, organizationId),
  });

  const deleteLeadType = useMutation({
    mutationFn: (leadTypeId: number | string) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.deleteLeadType(organizationId, leadTypeId);
    },
    onSettled: () => invalidateLeadTypeQueries(queryClient, organizationId),
  });

  const addLeadType = useMutation({
    mutationFn: (newLeadType: OrganizationLeadTypeCreatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.createLeadType(organizationId, newLeadType);
    },
    onSettled: () => invalidateLeadTypeQueries(queryClient, organizationId),
  });

  return { updateLeadType, deleteLeadType, addLeadType };
}

export function useLeadTypeSettingsMutations() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const updateLeadType = useMutation({
    mutationFn: (updatedLeadType: OrganizationLeadTypeUpdateVariables) => {
      if (!organizationId) throw new Error("Organization ID is required");
      const { id, ...data } = updatedLeadType;
      if (id == null) throw new Error("Lead type id is required");
      return StatusesService.updateLeadTypeSettings(organizationId, id, data);
    },
    onSettled: () => invalidateLeadTypeQueries(queryClient, organizationId),
  });

  const deleteLeadType = useMutation({
    mutationFn: (leadTypeId: number | string) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.deleteLeadTypeSettings(organizationId, leadTypeId);
    },
    onSettled: () => invalidateLeadTypeQueries(queryClient, organizationId),
  });

  const addLeadType = useMutation({
    mutationFn: (newLeadType: OrganizationLeadTypeCreatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.createLeadTypeSettings(
        organizationId,
        newLeadType
      );
    },
    onSettled: () => invalidateLeadTypeQueries(queryClient, organizationId),
  });

  return { updateLeadType, deleteLeadType, addLeadType };
}
