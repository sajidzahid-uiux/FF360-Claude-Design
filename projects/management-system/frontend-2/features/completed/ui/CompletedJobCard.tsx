import { useMemo } from "react";

import { TableActions, TableGridCard } from "@fieldflow360/org-ui";

import type { TransformedJob } from "@/features/completed";
import { ClientsAndFarmsCell } from "@/features/contacts";
import { formatMaterialStatusLabel } from "@/features/jobs";
import { formatCardFieldValue, getJobOrLeadListName } from "@/shared/lib";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";
import { mapDropdownItemsToTableActions } from "@/shared/lib/table/org-ui";
import { buildRowActions } from "@/utils/actions";

const TILING_JOB_SUBCLASS = "Drainage_TilingJob";

interface CompletedJobCardProps {
  job: TransformedJob;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onAction: (action: "view" | "archive" | "delete") => void;
  toggleArchive: boolean;
  onArchiveJob: (job: { id: number }) => void;
  onDeleteJob: (job: TransformedJob) => void;
  onLogsJob: (job: TransformedJob, isArchived: boolean) => void;
}

function ProgressRow({ progressBar }: { progressBar: string | number | null }) {
  const progressBarStr =
    progressBar != null && String(progressBar) !== ""
      ? String(progressBar)
      : "";
  const [progress, progressTotal = 1] = progressBarStr
    ? progressBarStr.split("/").map(Number)
    : [0, 1];
  const percent =
    progressTotal > 0 ? Math.min((progress / progressTotal) * 100, 100) : 0;

  return (
    <div>
      <div className="bg-bg-surface h-2 overflow-hidden rounded-full">
        <div
          className="bg-accent h-full rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-text-muted mt-1 block text-xs">
        {progressBarStr || "N/A"}
      </span>
    </div>
  );
}

export default function CompletedJobCard({
  job,
  selected,
  onSelect,
  onAction,
  toggleArchive,
  onArchiveJob,
  onDeleteJob,
  onLogsJob,
}: CompletedJobCardProps) {
  const lastUpdatedBy = job.last_updated_by;
  const canRead = job.permissions?.canRead || false;
  const canEdit = job.permissions?.canEdit || false;
  const canDelete = job.permissions?.canDelete || false;
  const isTilingJob = job.job_object_subclass === TILING_JOB_SUBCLASS;
  const materialStatusLabel = isTilingJob
    ? formatMaterialStatusLabel(job.material_status)
    : "";
  const materialStatusDisplay = materialStatusLabel
    ? formatCardFieldValue(materialStatusLabel)
    : null;

  const lastUpdated = job.last_updated ? new Date(job.last_updated) : null;
  const formattedLastUpdated = lastUpdated
    ? `${lastUpdated.getFullYear()}-${String(lastUpdated.getMonth() + 1).padStart(2, "0")}-${String(lastUpdated.getDate()).padStart(2, "0")}`
    : "";

  const actionItems = useMemo(
    () =>
      buildRowActions({
        canView: canRead,
        canEdit: canEdit && !toggleArchive,
        canDelete: canDelete && !toggleArchive,
        canArchive: canEdit,
        canTrack: false,
        isArchived: toggleArchive,
        onView: () => onAction("view"),
        onLogs: () => onLogsJob(job, toggleArchive),
        onArchive: () => onArchiveJob({ id: job.id }),
        onUnarchive: () => onArchiveJob({ id: job.id }),
        onDelete: () => onDeleteJob(job),
      }),
    [
      canRead,
      canEdit,
      canDelete,
      toggleArchive,
      job,
      onAction,
      onArchiveJob,
      onDeleteJob,
      onLogsJob,
    ]
  );
  const tableActions = useMemo(
    () =>
      mapDropdownItemsToTableActions<TransformedJob>({ items: actionItems }),
    [actionItems]
  );

  const title = getJobOrLeadListName(job, "Job");
  const jobStatusLabel = job.cancelled ? "Cancelled" : "Completed";

  return (
    <div
      className="h-full cursor-pointer"
      onDoubleClick={() => onAction("view")}
    >
      <TableGridCard
        actions={
          tableActions.length > 0 ? (
            <TableActions
              actions={tableActions}
              item={job}
              {...INLINE_TABLE_ROW_ACTIONS_PROPS}
            />
          ) : undefined
        }
        headerContent={
          lastUpdated ? (
            <p className="truncate">
              {`Last updated: ${formattedLastUpdated}`}
              {lastUpdatedBy ? ` • ${lastUpdatedBy}` : ""}
            </p>
          ) : undefined
        }
        selectable={canEdit}
        selected={selected}
        title={title}
        onSelectedChange={onSelect}
      >
        <dl className="flex flex-col gap-2">
          <div className="min-w-0">
            <dt className="text-text-muted mb-1 text-xs">Client / Farm</dt>
            <dd>
              <ClientsAndFarmsCell
                compact
                contactInfo={job.contact_info}
                contactsCount={job.contacts_count}
                farmName={job.farm_name}
                farmsCount={job.farms_count}
              />
            </dd>
          </div>
          <div>
            <dt className="text-text-muted mb-1 text-xs">Job Progress</dt>
            <dd>
              <ProgressRow progressBar={job.progress_bar} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Job Type</dt>
            <dd className="text-text-primary min-w-0 truncate text-xs font-medium">
              {job.job_object_subclass}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Job Status</dt>
            <dd>
              <span
                className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold text-white ${
                  job.cancelled ? "bg-red-500" : "bg-green-500"
                }`}
              >
                {jobStatusLabel}
              </span>
            </dd>
          </div>
          {isTilingJob && materialStatusDisplay ? (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-text-muted text-xs">Material Status</dt>
              <dd className="text-text-primary min-w-0 truncate text-xs font-medium">
                {materialStatusDisplay}
              </dd>
            </div>
          ) : null}
        </dl>
      </TableGridCard>
    </div>
  );
}
