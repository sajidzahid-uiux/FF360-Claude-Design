"use client";

import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";

import type { ContactInfo, Job, JobStatus, Status } from "@/api/types";
import { JobType } from "@/api/types";
import { useJobPermissions } from "@/hooks/permissions";
import { clientsAndFarmsColumn } from "@/shared/lib/table/columns/common";
import { JobOrLeadListNameWithDescriptionCell } from "@/shared/ui";
import { ColumnBuilder, ColumnPresets, Dropdown } from "@/shared/ui/common";
import { buildRowActions } from "@/utils/actions";

function RepairJobNameCell({ job }: { job: Job }) {
  const isOnHold = job.on_hold;

  return (
    <JobOrLeadListNameWithDescriptionCell
      highlightClassName={isOnHold ? "text-yellow-500" : ""}
      row={job}
      typeLabel="Job"
    />
  );
}

function RepairJobActionsCell({
  job,
  onShowMore,
  onTrash,
  onUnarchive,
  onArchive,
  onOnSiteTracking,
  onLogs,
  isArchived = false,
}: {
  job: Job;
  onShowMore: (id: number, isArchived: boolean) => void;
  onTrash: (id: number) => void;
  onUnarchive: (id: number) => void;
  onArchive: (id: number) => void;
  onOnSiteTracking?: (id: number) => void;
  onLogs?: (id: number, isArchived?: boolean) => void;
  isArchived?: boolean;
}) {
  const finalIsArchived = Boolean(isArchived);
  const { canEdit, canDelete } = useJobPermissions(JobType.REPAIR);
  const items = useMemo(
    () =>
      buildRowActions({
        canView: true,
        canEdit: canEdit && !finalIsArchived,
        canDelete: canDelete && !finalIsArchived,
        canArchive: canEdit,
        canTrack: !!onOnSiteTracking,
        isArchived: finalIsArchived,

        onView: () => onShowMore(job.id, finalIsArchived),
        onLogs: onLogs ? () => onLogs(job.id, finalIsArchived) : undefined,
        onArchive: () => onArchive(job.id),
        onUnarchive: () => onUnarchive(job.id),
        onTrash: () => onTrash(job.id),
        onTrack: onOnSiteTracking ? () => onOnSiteTracking(job.id) : undefined,
      }),
    [
      canEdit,
      canDelete,
      finalIsArchived,
      onShowMore,
      onLogs,
      onArchive,
      onUnarchive,
      onTrash,
      onOnSiteTracking,
      job.id,
    ]
  );

  return <Dropdown items={items} />;
}

export const getRepairJobColumns = (
  onShowMore: (id: number, isArchived: boolean) => void,
  onTrash: (id: number) => void,
  onUnarchive: (id: number) => void,
  onArchive: (id: number) => void,
  statusTypes?: Status[],
  onOnSiteTracking?: (id: number) => void,
  isArchived?: boolean,
  onLogs?: (id: number, isArchived?: boolean) => void
): ColumnDef<Job, unknown>[] => {
  const builder = new ColumnBuilder<Job, unknown>();

  // Select column
  const { column: selectCol } = ColumnPresets.selectColumnPreset<Job>();
  builder.addColumn(selectCol as ColumnDef<Job, unknown>);

  // Job Name
  builder.addColumn({
    accessorKey: "customer_name",
    header: "Job Name",
    cell: ({ row }) => <RepairJobNameCell job={row.original} />,
  });

  // Phone
  builder.addColumn({
    accessorKey: "contact_info",
    header: "Phone",
    cell: ({ row }) => {
      const contactInfo = row.getValue("contact_info") as ContactInfo;
      return (
        contactInfo?.phone_number || contactInfo?.home_phone_number || "N/A"
      );
    },
  });

  builder.addColumn(clientsAndFarmsColumn<Job>());

  // Job Status
  const { column: statusCol } = ColumnPresets.statusColumnPreset<
    Job,
    JobStatus
  >({
    accessorKey: "job_status",
    title: "Job Status",
    renderStatus: (status: JobStatus | undefined) => {
      if (!status) return <span className="text-text-muted">N/A</span>;
      return (
        <span
          className="rounded px-2 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: status.color }}
        >
          {status.title}
        </span>
      );
    },
  });
  builder.addColumn({
    ...statusCol,
    filterFn: (row, id, value) => {
      const statusId = row.getValue(id);
      const statusObj = statusTypes?.find((s) => s.id === statusId);
      const statusTitle = statusObj ? statusObj.title : String(statusId);
      return value.some((val: string) => statusTitle === val);
    },
  } as ColumnDef<Job, unknown>);

  // Job Progress
  const { column: progressCol } = ColumnPresets.progressColumnPreset<Job>({
    id: "progress_bar",
    title: "Job Progress",
    getProgress: (row) => {
      const progress = String(row.progress_bar ?? "");
      const [current, total] = progress.split("/").map(Number);
      return {
        percent: total > 0 ? (current / total) * 100 : 0,
        label: progress,
      };
    },
  });
  builder.addColumn({
    ...progressCol,
    accessorKey: "progress_bar",
  } as ColumnDef<Job, unknown>);

  // Last Updated
  builder.addColumn({
    accessorKey: "last_updated",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = new Date(row.getValue("last_updated"));
      const username = row.original.update_by_username || "N/A";
      return date.toLocaleDateString() + " • " + (username || "N/A");
    },
  });

  // Actions column
  const { column: actionsCol } = ColumnPresets.actionsColumnPreset<Job>({
    cell: ({ row }) => (
      <RepairJobActionsCell
        isArchived={isArchived}
        job={row.original}
        onArchive={onArchive}
        onLogs={onLogs}
        onOnSiteTracking={onOnSiteTracking}
        onShowMore={onShowMore}
        onTrash={onTrash}
        onUnarchive={onUnarchive}
      />
    ),
  });
  builder.addColumn(actionsCol as ColumnDef<Job, unknown>);

  return builder.build({});
};
