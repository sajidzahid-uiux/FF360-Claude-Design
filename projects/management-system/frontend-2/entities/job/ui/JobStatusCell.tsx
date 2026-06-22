"use client";

import { useCallback, useMemo } from "react";

import type { JobStatus, JobType, Status } from "@/api/types";
import type { JobTableRow } from "@/entities/job/model/table-row";
import { useInlineJobStatusChange } from "@/features/jobs/hooks/useInlineJobStatusChange";
import { useJobPermissions } from "@/hooks/permissions";
import { isTerminalStatusTitle } from "@/shared/lib/filterExternalStatusOptions";
import { InlineEntityStatusDropdown } from "@/shared/ui/InlineEntityStatusDropdown";

function resolveJobStatus(
  jobStatus: JobTableRow["job_status"],
  statusTypes: Status[]
): JobStatus | undefined {
  if (jobStatus == null) return undefined;
  if (typeof jobStatus === "object") return jobStatus;
  return statusTypes.find((status) => status.id === jobStatus);
}

function isJobStatusEditingDisabled(
  job: JobTableRow,
  canEditStatus: boolean,
  isArchived: boolean
): boolean {
  if (!canEditStatus || isArchived) return true;
  if (job.cancelled === true) return true;

  const statusTitle =
    typeof job.job_status === "object" && job.job_status !== null
      ? job.job_status.title
      : undefined;

  return statusTitle != null && isTerminalStatusTitle(statusTitle);
}

export interface JobStatusCellProps {
  job: JobTableRow;
  jobType: JobType;
  statusTypes: Status[];
  isArchived?: boolean;
}

export function JobStatusCell({
  job,
  jobType,
  statusTypes,
  isArchived = false,
}: JobStatusCellProps) {
  const { canEditStatus } = useJobPermissions(jobType);
  const { handleInlineJobStatusChange } = useInlineJobStatusChange(jobType);

  const currentStatus = useMemo(
    () => resolveJobStatus(job.job_status, statusTypes),
    [job.job_status, statusTypes]
  );

  const disabled = isJobStatusEditingDisabled(job, canEditStatus, isArchived);

  const handleStatusChange = useCallback(
    (statusId: number) => {
      void handleInlineJobStatusChange(job.id, statusId);
    },
    [handleInlineJobStatusChange, job.id]
  );

  return (
    <InlineEntityStatusDropdown
      currentStatus={currentStatus}
      disabled={disabled}
      statusTypes={statusTypes}
      onStatusChange={handleStatusChange}
    />
  );
}
