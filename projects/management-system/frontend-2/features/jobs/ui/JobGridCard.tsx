"use client";

import { memo } from "react";

import { TableActions, TableGridCard } from "@fieldflow360/org-ui";

import type { Status } from "@/api/types";
import { ClientsAndFarmsCell } from "@/features/contacts";
import {
  type JobOrgUiColumnHandlers,
  type JobTableRow,
  buildJobTableActions,
} from "@/features/jobs/lib/columns";
import { JobStatusCell } from "@/features/jobs/ui/JobStatusCell";
import { useJobPermissions } from "@/hooks/permissions";
import { getJobOrLeadListName } from "@/shared/lib";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";

function ProgressRow({ progress }: { progress: string | null | undefined }) {
  const value = String(progress ?? "");
  const [current, total] = value.split("/").map(Number);
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div>
      <div className="bg-bg-surface h-2 overflow-hidden rounded-full">
        <div
          className="bg-accent h-full rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-text-muted mt-1 block text-xs">
        {value || "N/A"}
      </span>
    </div>
  );
}

function resolvePhone(job: JobTableRow) {
  return (
    job.contact_info?.phone_number ||
    job.contact_info?.home_phone_number ||
    "N/A"
  );
}

export interface JobGridCardProps {
  job: JobTableRow;
  handlers: JobOrgUiColumnHandlers;
  statusTypes: Status[];
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  selectable?: boolean;
  onDoubleClick?: () => void;
}

export const JobGridCard = memo(function JobGridCard({
  job,
  handlers,
  statusTypes,
  selected,
  onSelectedChange,
  selectable = false,
  onDoubleClick,
}: JobGridCardProps) {
  const { canEdit, canDelete } = useJobPermissions(handlers.jobType);
  const title = getJobOrLeadListName(job, "Job");
  const secondary = job.description?.trim() || undefined;
  const titleClassName = job.on_hold
    ? "text-yellow-600 dark:text-yellow-400"
    : "";

  return (
    <div className="h-full cursor-pointer" onDoubleClick={onDoubleClick}>
      <TableGridCard
        actions={
          <TableActions
            actions={buildJobTableActions(job, handlers, {
              canEdit,
              canDelete,
            })}
            item={job}
            {...INLINE_TABLE_ROW_ACTIONS_PROPS}
          />
        }
        headerContent={
          secondary || job.last_updated ? (
            <>
              {secondary ? (
                <p className="text-text-muted truncate">{secondary}</p>
              ) : null}
              {job.last_updated ? (
                <p className="truncate">
                  {`Last updated: ${new Date(job.last_updated).toLocaleDateString()} • ${job.update_by_username || "N/A"}`}
                </p>
              ) : null}
            </>
          ) : undefined
        }
        selectable={selectable}
        selected={selected}
        title={<span className={titleClassName || undefined}>{title}</span>}
        onSelectedChange={onSelectedChange}
      >
        <dl className="flex flex-col gap-2">
          {job.estimate_number ? (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-text-muted text-xs">Estimate</dt>
              <dd className="text-text-primary text-xs font-medium tabular-nums">
                {job.estimate_number}
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Phone</dt>
            <dd className="text-text-primary text-xs font-medium tabular-nums">
              {resolvePhone(job)}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-text-muted mb-1 text-xs">Client / Farm</dt>
            <dd>
              <ClientsAndFarmsCell
                compact
                contactInfo={job.contact_info}
                farmName={job.farm_name}
              />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Status</dt>
            <dd>
              <JobStatusCell
                isArchived={handlers.isArchived}
                job={job}
                jobType={handlers.jobType}
                statusTypes={statusTypes}
              />
            </dd>
          </div>
          <div>
            <dt className="text-text-muted mb-1 text-xs">Progress</dt>
            <dd>
              <ProgressRow progress={String(job.progress_bar ?? "")} />
            </dd>
          </div>
        </dl>
      </TableGridCard>
    </div>
  );
});
