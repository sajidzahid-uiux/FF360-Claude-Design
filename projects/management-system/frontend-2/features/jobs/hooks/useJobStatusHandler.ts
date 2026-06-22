import { useQueryClient } from "@tanstack/react-query";

import type { Job, JobStatus } from "@/api/types";
import { JobType } from "@/constants";
import { usePatchJob } from "@/hooks/mutations";

interface UseJobStatusHandlerArgs {
  job: Job | undefined;
  jobType: JobType;
  statusTypes: JobStatus[] | undefined;
  jobId: string;
  isArchived: boolean;
}

interface UseJobStatusHandlerResult {
  currentStatusId: number | undefined;
  toggleArchive: boolean;
  completedJob: boolean;
  cancelled: boolean;
  handleStatusChange: (statusId: number) => Promise<void>;
}

function resolveStatusId(
  jobStatus: Job["job_status"] | undefined
): number | undefined {
  if (jobStatus == null) return undefined;
  return typeof jobStatus === "object" ? jobStatus.id : jobStatus;
}

function isCompletedStatus(
  statusTypes: JobStatus[] | undefined,
  statusId: number | undefined
): boolean {
  if (statusId == null) return false;
  return (
    statusTypes
      ?.find((status) => status.id === statusId)
      ?.title?.toLowerCase() === "completed"
  );
}

export function useJobStatusHandler({
  job,
  jobType,
  statusTypes,
  jobId,
  isArchived,
}: UseJobStatusHandlerArgs): UseJobStatusHandlerResult {
  const queryClient = useQueryClient();
  const patchJob = usePatchJob();

  const currentStatusId = resolveStatusId(job?.job_status);
  const toggleArchive = job?.archived ?? false;
  const completedJob = isCompletedStatus(statusTypes, currentStatusId);
  const cancelled = job?.cancelled ?? false;

  async function handleStatusChange(statusId: number): Promise<void> {
    if (!job?.id) return;

    try {
      await patchJob.mutateAsync({
        id: job.id,
        updatedJob: { job_status: statusId },
        jobType,
      });

      await queryClient.invalidateQueries({
        queryKey: ["job", jobId, jobType, isArchived, false],
      });

      const wasCompleted = isCompletedStatus(statusTypes, currentStatusId);
      const isCompleted = isCompletedStatus(statusTypes, statusId);

      if (wasCompleted || isCompleted) {
        await queryClient.invalidateQueries({ queryKey: ["allJobs"] });
      }
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  }

  return {
    currentStatusId,
    toggleArchive,
    completedJob,
    cancelled,
    handleStatusChange,
  };
}
