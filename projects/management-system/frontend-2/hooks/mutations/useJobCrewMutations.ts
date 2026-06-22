import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CrewService } from "@/api/services";
import type {
  AssignCrewGroupPayload,
  AssignIndividualPayload,
  DeactivateAssignmentPayload,
  JobId,
  ReactivateAssignmentPayload,
} from "@/api/types";
import { QUERY_KEYS } from "@/constants";
import { getErrorMessage } from "@/utils/apiError";

import { useRouteIds } from "../useRouteIds";

export const useJobCrewMutations = (jobId: JobId) => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const assignCrewGroup = useMutation({
    mutationFn: async (data: AssignCrewGroupPayload) => {
      if (!organizationId || !jobId) {
        throw new Error("Organization ID and Job ID are required");
      }
      return CrewService.assignCrewGroupToJob(organizationId, jobId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      toast.success(data.message || "Crew group assigned successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to assign crew group"));
    },
  });

  const assignIndividual = useMutation({
    mutationFn: async (data: AssignIndividualPayload) => {
      if (!organizationId || !jobId) {
        throw new Error("Organization ID and Job ID are required");
      }
      return CrewService.assignIndividualToJob(organizationId, jobId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      toast.success(data.message || "Individual assigned successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to assign individual"));
    },
  });

  const deactivateAssignment = useMutation({
    mutationFn: async (data: DeactivateAssignmentPayload) => {
      if (!organizationId || !jobId) {
        throw new Error("Organization ID and Job ID are required");
      }
      return CrewService.deactivateJobAssignment(organizationId, jobId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      toast.success(data.message || "Assignment deactivated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to deactivate assignment"));
    },
  });

  const reactivateAssignment = useMutation({
    mutationFn: async (data: ReactivateAssignmentPayload) => {
      if (!organizationId || !jobId) {
        throw new Error("Organization ID and Job ID are required");
      }
      return CrewService.reactivateJobAssignment(organizationId, jobId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      toast.success(data.message || "Assignment reactivated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to reactivate assignment"));
    },
  });

  return {
    assignCrewGroup,
    assignIndividual,
    deactivateAssignment,
    reactivateAssignment,
  };
};
