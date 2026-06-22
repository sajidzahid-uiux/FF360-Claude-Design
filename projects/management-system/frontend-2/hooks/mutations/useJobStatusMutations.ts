import { useMutation, useQueryClient } from "@tanstack/react-query";

import { StatusesService } from "@/api/services/statusesService";
import type {
  OrganizationJobStatusCreateArgs,
  OrganizationJobStatusUpdateVariables,
} from "@/api/types/settings";
import { QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

function invalidateJobStatusQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  organizationId: string | null | undefined,
  jobType?: string
) {
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.JOB_STATUSES, organizationId],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.STATUSES, organizationId, jobType ?? null],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.STATUSES, organizationId],
  });
  void queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEYS.JOB_STATUSES,
      "settings",
      organizationId,
      jobType ?? null,
    ],
  });
}

export function useJobStatusMutations(jobType?: string) {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const updateStatus = useMutation({
    mutationFn: (updatedStatus: OrganizationJobStatusUpdateVariables) => {
      if (!organizationId) throw new Error("Organization ID is required");
      const { id, ...data } = updatedStatus;
      if (id == null) throw new Error("Status id is required");
      return StatusesService.updateJobStatus(organizationId, id, data);
    },
    onSettled: () =>
      invalidateJobStatusQueries(queryClient, organizationId, jobType),
  });

  const deleteStatus = useMutation({
    mutationFn: (statusId: number | string) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.deleteJobStatus(organizationId, statusId);
    },
    onSettled: () =>
      invalidateJobStatusQueries(queryClient, organizationId, jobType),
  });

  const addStatus = useMutation({
    mutationFn: ({ newStatus, Type }: OrganizationJobStatusCreateArgs) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.createJobStatusSettings(
        organizationId,
        { ...newStatus, job_type: Type },
        Type
      );
    },
    onSettled: () =>
      invalidateJobStatusQueries(queryClient, organizationId, jobType),
  });

  return { updateStatus, deleteStatus, addStatus };
}

export function useJobStatusSettingsMutations(jobType?: string) {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const updateStatus = useMutation({
    mutationFn: (updatedStatus: OrganizationJobStatusUpdateVariables) => {
      if (!organizationId) throw new Error("Organization ID is required");
      const { id, ...data } = updatedStatus;
      if (id == null) throw new Error("Status id is required");
      return StatusesService.updateJobStatusSettings(organizationId, id, data);
    },
    onSettled: () =>
      invalidateJobStatusQueries(queryClient, organizationId, jobType),
  });

  const deleteStatus = useMutation({
    mutationFn: (statusId: number | string) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.deleteJobStatusSettings(organizationId, statusId);
    },
    onSettled: () =>
      invalidateJobStatusQueries(queryClient, organizationId, jobType),
  });

  const addStatus = useMutation({
    mutationFn: ({ newStatus, Type }: OrganizationJobStatusCreateArgs) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.createJobStatusSettings(
        organizationId,
        { ...newStatus, job_type: Type },
        Type
      );
    },
    onSettled: () =>
      invalidateJobStatusQueries(queryClient, organizationId, jobType),
  });

  return { updateStatus, deleteStatus, addStatus };
}
