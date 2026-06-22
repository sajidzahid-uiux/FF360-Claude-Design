"use client";

import { useMemo } from "react";

import { type Column, TableActions } from "@fieldflow360/org-ui";

import type { TransformedJob } from "@/features/completed/model/types";
import { getMobileJobListRowModel } from "@/features/jobs/lib/getMobileJobListRowModel";
import {
  JobMobileListRowJobNumberCell,
  JobMobileListRowLastUpdatedCell,
} from "@/features/jobs/ui/JobMobileListRowCells";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";
import { mapDropdownItemsToTableActions } from "@/shared/lib/table/org-ui";
import { buildRowActions } from "@/utils/actions";

export interface CompletedJobOrgUiMobileColumnCallbacks {
  onAction: (job: TransformedJob, action: string) => void;
  isArchiving: boolean;
  handleArchiveJob: (params: { id: number }) => void;
  handleDeleteJob: (job: TransformedJob) => void;
  handleJobLogs: (job: TransformedJob, isArchived: boolean) => void;
  onOnSiteTracking?: (job: TransformedJob) => void;
}

function CompletedJobMobileActionsCell({
  job,
  callbacks,
}: {
  job: TransformedJob;
  callbacks: CompletedJobOrgUiMobileColumnCallbacks;
}) {
  const {
    onAction,
    isArchiving,
    handleArchiveJob,
    handleDeleteJob,
    handleJobLogs,
    onOnSiteTracking,
  } = callbacks;

  const canEdit = Boolean(job.permissions?.canEdit);
  const canDelete = Boolean(job.permissions?.canDelete);
  const canRead = Boolean(job.permissions?.canRead);

  const actions = useMemo(
    () =>
      mapDropdownItemsToTableActions<TransformedJob>({
        items: buildRowActions({
          canView: canRead,
          canEdit: canEdit && !isArchiving,
          canDelete: canDelete && !isArchiving,
          canArchive: canEdit,
          canTrack: !!onOnSiteTracking,
          isArchived: isArchiving,
          onView: () => onAction(job, "view"),
          onLogs: () => handleJobLogs(job, isArchiving),
          onArchive: () => handleArchiveJob({ id: job.id }),
          onUnarchive: () => handleArchiveJob({ id: job.id }),
          onDelete: () => handleDeleteJob(job),
          onTrack: onOnSiteTracking ? () => onOnSiteTracking(job) : undefined,
        }),
      }),
    [
      canDelete,
      canEdit,
      canRead,
      handleArchiveJob,
      handleDeleteJob,
      handleJobLogs,
      isArchiving,
      job,
      onAction,
      onOnSiteTracking,
    ]
  );

  return (
    <TableActions
      actions={actions}
      item={job}
      {...INLINE_TABLE_ROW_ACTIONS_PROPS}
    />
  );
}

export function buildCompletedJobOrgUiMobileColumns(
  callbacks: CompletedJobOrgUiMobileColumnCallbacks
): Column<TransformedJob>[] {
  return [
    {
      key: "job_number",
      label: "Job Number",
      header: "Job Number",
      hideable: false,
      render: (job) => {
        const model = getMobileJobListRowModel({
          variant: "completed",
          job,
        });

        return (
          <JobMobileListRowJobNumberCell
            actions={
              <CompletedJobMobileActionsCell callbacks={callbacks} job={job} />
            }
            jobId={job.id}
            model={model}
          />
        );
      },
      width: "140px",
      cellClassName: "min-w-0 align-top",
    },
    {
      key: "last_updated",
      label: "Last Updated",
      header: "Last Updated",
      hideable: false,
      render: (job) => (
        <JobMobileListRowLastUpdatedCell
          isArchived={callbacks.isArchiving}
          jobId={job.id}
          model={getMobileJobListRowModel({
            variant: "completed",
            job,
          })}
        />
      ),
      width: "180px",
      cellClassName: "min-w-0 align-top",
    },
  ];
}
