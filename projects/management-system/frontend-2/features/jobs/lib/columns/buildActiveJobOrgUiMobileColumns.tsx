"use client";

import { useMemo } from "react";

import type { Column } from "@fieldflow360/org-ui";

import type {
  JobOrgUiColumnHandlers,
  JobTableRow,
} from "@/features/jobs/lib/columns";
import { getMobileJobListRowModel } from "@/features/jobs/lib/getMobileJobListRowModel";
import { JobMobileListRowActions } from "@/features/jobs/ui/JobMobileListRowActions";
import {
  JobMobileListRowJobNumberCell,
  JobMobileListRowLastUpdatedCell,
} from "@/features/jobs/ui/JobMobileListRowCells";
import { useJobPermissions } from "@/hooks/permissions";
import type { DropdownItem } from "@/shared/ui/common/Dropdown";
import { buildRowActions } from "@/utils/actions";

function ActiveJobMobileActionsCell({
  job,
  handlers,
}: {
  job: JobTableRow;
  handlers: JobOrgUiColumnHandlers;
}) {
  const { canEdit, canDelete } = useJobPermissions(handlers.jobType);
  const isArchived = Boolean(handlers.isArchived);
  const {
    onShowMore,
    onTrash,
    onUnarchive,
    onArchive,
    onOnSiteTracking,
    onLogs,
  } = handlers;

  const overflowItems = useMemo((): DropdownItem[] => {
    const items = buildRowActions({
      canView: true,
      canEdit: canEdit && !isArchived,
      canDelete: canDelete && !isArchived,
      canArchive: canEdit,
      canTrack: !!onOnSiteTracking,
      isArchived,
      onView: () => onShowMore(job.id, isArchived),
      onLogs: onLogs ? () => onLogs(job.id, isArchived) : undefined,
      onArchive: () => onArchive(job.id),
      onUnarchive: () => onUnarchive(job.id),
      onTrash: () => onTrash(job.id),
      onTrack: onOnSiteTracking ? () => onOnSiteTracking(job.id) : undefined,
    });

    return items.filter((item) => item.id !== "view" && item.id !== "track");
  }, [
    canDelete,
    canEdit,
    isArchived,
    job.id,
    onArchive,
    onLogs,
    onOnSiteTracking,
    onShowMore,
    onTrash,
    onUnarchive,
  ]);

  return (
    <JobMobileListRowActions
      overflowItems={overflowItems}
      onTrack={
        onOnSiteTracking && !isArchived
          ? () => onOnSiteTracking(job.id)
          : undefined
      }
      onView={() => onShowMore(job.id, isArchived)}
    />
  );
}

export function buildActiveJobOrgUiMobileColumns(
  handlers: JobOrgUiColumnHandlers
): Column<JobTableRow>[] {
  const { jobType, statusTypes } = handlers;

  return [
    {
      key: "job_number",
      label: "Job Number",
      header: "Job Number",
      hideable: false,
      render: (job) => {
        const model = getMobileJobListRowModel({
          variant: "active",
          job,
          jobType,
          statusTypes,
        });

        return (
          <JobMobileListRowJobNumberCell
            actions={
              <ActiveJobMobileActionsCell handlers={handlers} job={job} />
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

      header: "Last Updated",
      hideable: false,
      render: (job) => (
        <JobMobileListRowLastUpdatedCell
          inlineStatus={{
            job,
            jobType,
            statusTypes,
          }}
          isArchived={handlers.isArchived}
          jobId={job.id}
          model={getMobileJobListRowModel({
            variant: "active",
            job,
            jobType,
            statusTypes,
          })}
        />
      ),
      width: "180px",
      cellClassName: "min-w-0 align-top",
    },
  ];
}
