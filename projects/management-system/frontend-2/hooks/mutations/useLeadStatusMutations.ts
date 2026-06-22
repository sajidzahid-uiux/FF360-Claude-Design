import { useMutation, useQueryClient } from "@tanstack/react-query";

import { StatusesService } from "@/api/services/statusesService";
import type {
  OrganizationLeadStatusCreatePayload,
  OrganizationLeadStatusUpdateVariables,
} from "@/api/types/settings";
import { QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

function invalidateLeadStatusQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  organizationId: string | null | undefined
) {
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.LEAD_STATUSES, organizationId],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.LEAD_STATUSES, "settings", organizationId],
  });
}

export function useLeadStatusMutations() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const updateLeadStatus = useMutation({
    mutationFn: (updatedLeadStatus: OrganizationLeadStatusUpdateVariables) => {
      if (!organizationId) throw new Error("Organization ID is required");
      const { id, ...data } = updatedLeadStatus;
      if (id == null) throw new Error("Status id is required");
      return StatusesService.updateLeadStatus(organizationId, id, data);
    },
    onSettled: () => invalidateLeadStatusQueries(queryClient, organizationId),
  });

  const deleteLeadStatus = useMutation({
    mutationFn: (leadStatusId: number | string) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.deleteLeadStatus(organizationId, leadStatusId);
    },
    onSettled: () => invalidateLeadStatusQueries(queryClient, organizationId),
  });

  const addLeadStatus = useMutation({
    mutationFn: (newLeadStatus: OrganizationLeadStatusCreatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.createLeadStatus(organizationId, newLeadStatus);
    },
    onSettled: () => invalidateLeadStatusQueries(queryClient, organizationId),
  });

  return { updateLeadStatus, deleteLeadStatus, addLeadStatus };
}

export function useLeadStatusSettingsMutations() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const updateLeadStatus = useMutation({
    mutationFn: (updatedLeadStatus: OrganizationLeadStatusUpdateVariables) => {
      if (!organizationId) throw new Error("Organization ID is required");
      const { id, ...data } = updatedLeadStatus;
      if (id == null) throw new Error("Status id is required");
      return StatusesService.updateLeadStatusSettings(organizationId, id, data);
    },
    onSettled: () => invalidateLeadStatusQueries(queryClient, organizationId),
  });

  const deleteLeadStatus = useMutation({
    mutationFn: (leadStatusId: number | string) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.deleteLeadStatusSettings(
        organizationId,
        leadStatusId
      );
    },
    onSettled: () => invalidateLeadStatusQueries(queryClient, organizationId),
  });

  const addLeadStatus = useMutation({
    mutationFn: (newLeadStatus: OrganizationLeadStatusCreatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.createLeadStatusSettings(
        organizationId,
        newLeadStatus
      );
    },
    onSettled: () => invalidateLeadStatusQueries(queryClient, organizationId),
  });

  return { updateLeadStatus, deleteLeadStatus, addLeadStatus };
}
