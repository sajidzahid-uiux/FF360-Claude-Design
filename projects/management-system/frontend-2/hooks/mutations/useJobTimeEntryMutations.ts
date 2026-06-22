import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { JobTimeEntriesService } from "@/api/services";
import type {
  TimeEntryPayload,
  TimeEntryResponse,
  UpdateTimeEntryPayload,
} from "@/api/types/jobTimeEntries";
import { JobType, QUERY_KEYS } from "@/constants";
import { getErrorMessage } from "@/utils/apiError";

import {
  invalidateAllActivityLogsForOrg,
  invalidateJobActivityLogs,
} from "../queries/invalidateActivityLogs";
import { JOB_TIME_ENTRIES_QUERY_KEY } from "../queries/timeTrackingQueryKeys";
import { useRouteIds } from "../useRouteIds";

const validJobTypes = [...Object.values(JobType), "tiling"];

function assertCreateTimeEntryPayload(data: TimeEntryPayload): void {
  if (!data.job_id || !data.job_type || !data.hours) {
    throw new Error("job_id, job_type, and hours are required");
  }

  if (!validJobTypes.includes(data.job_type as JobType | "tiling")) {
    throw new Error(
      `Invalid job_type. Must be one of: ${validJobTypes.join(", ")}`
    );
  }

  if (data.hours <= 0) {
    throw new Error("Hours must be greater than 0");
  }
}

export function useAddJobTimeEntry() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation<TimeEntryResponse, unknown, TimeEntryPayload>({
    mutationFn: async (data: TimeEntryPayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      assertCreateTimeEntryPayload(data);
      return JobTimeEntriesService.createJobTimeEntry(organizationId, data);
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      void queryClient.invalidateQueries({ queryKey: ["job"] });
      void queryClient.invalidateQueries({ queryKey: ["jobHistory"] });
      void queryClient.invalidateQueries({ queryKey: ["jobFinancial"] });
      void queryClient.invalidateQueries({
        queryKey: ["financialMachineAssignments"],
      });
      void queryClient.invalidateQueries({
        queryKey: [JOB_TIME_ENTRIES_QUERY_KEY],
      });
      invalidateJobActivityLogs(queryClient, organizationId, variables.job_id);

      toast.success(data.message || "Time entry added successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to add time entry"));
    },
  });
}

export function useUpdateJobTimeEntry() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation<void, unknown, UpdateTimeEntryPayload>({
    mutationFn: async ({ id, hours, description }) => {
      if (!organizationId) throw new Error("Organization ID is required");
      if (hours <= 0) throw new Error("Hours must be greater than 0");
      await JobTimeEntriesService.updateJobTimeEntry(organizationId, id, {
        hours,
        description,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      void queryClient.invalidateQueries({ queryKey: ["job"] });
      void queryClient.invalidateQueries({
        queryKey: [JOB_TIME_ENTRIES_QUERY_KEY],
      });
      invalidateAllActivityLogsForOrg(queryClient, organizationId);
      toast.success("Time entry updated");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update time entry"));
    },
  });
}

export function useDeleteJobTimeEntry() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation<void, unknown, number>({
    mutationFn: async (id: number) => {
      if (!organizationId) throw new Error("Organization ID is required");
      await JobTimeEntriesService.deleteJobTimeEntry(organizationId, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      void queryClient.invalidateQueries({ queryKey: ["job"] });
      void queryClient.invalidateQueries({
        queryKey: [JOB_TIME_ENTRIES_QUERY_KEY],
      });
      invalidateAllActivityLogsForOrg(queryClient, organizationId);
      toast.success("Time entry deleted");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete time entry"));
    },
  });
}
