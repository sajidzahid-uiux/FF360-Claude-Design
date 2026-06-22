"use client";

import { useCallback } from "react";

import { JobType } from "@/constants";
import { usePatchJob } from "@/hooks/mutations/useJobMutations";

export function useInlineJobStatusChange(jobType: JobType) {
  const patchJob = usePatchJob();

  const handleInlineJobStatusChange = useCallback(
    async (jobId: number, statusId: number) => {
      await patchJob.mutateAsync({
        id: jobId,
        updatedJob: { job_status: statusId },
        jobType,
      });
    },
    [patchJob, jobType]
  );

  return {
    handleInlineJobStatusChange,
    isPending: patchJob.isPending,
  };
}
