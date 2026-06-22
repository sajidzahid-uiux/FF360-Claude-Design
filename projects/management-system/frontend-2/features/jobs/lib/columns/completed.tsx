import { useMemo } from "react";

import type {
  CellContext,
  ColumnDef,
  HeaderContext,
  Row,
} from "@tanstack/react-table";

import type { JobStatus } from "@/api/types";
import type { TransformedJob } from "@/features/completed";
import { formatMaterialStatusLabel } from "@/features/jobs";
import { clientsAndFarmsColumn } from "@/shared/lib/table/columns/common";
import { JobOrLeadListNameWithDescriptionCell } from "@/shared/ui";
import { ColumnBuilder, ColumnPresets, Dropdown } from "@/shared/ui/common";
import { SanitizedInput } from "@/shared/ui/primitives";
import { buildRowActions } from "@/utils/actions";

const TILING_JOB_SUBCLASS = "Drainage_TilingJob";

function CompletedJobActionsCell({
  row,
  onAction,
  isArchiving,
  handleArchiveJob,
  handleDeleteJob,
  handleJobLogs,
}: {
  row: Row<TransformedJob>;
  onAction: (job: TransformedJob, action: string) => void;
  isArchiving: boolean;
  handleArchiveJob: (params: { id: number }) => void;
  handleDeleteJob: (job: TransformedJob) => void;
  handleJobLogs: (job: TransformedJob, isArchived: boolean) => void;
}) {
  const canEdit = row.original.permissions?.canEdit || false;
  const canDelete = row.original.permissions?.canDelete || false;
  const canRead = row.original.permissions?.canRead || false;
  const items = useMemo(
    () =>
      buildRowActions({
        canView: canRead,
        canEdit: canEdit && !isArchiving,
        canDelete: canDelete && !isArchiving,
        canArchive: canEdit,
        canTrack: false,
        isArchived: isArchiving,
        onView: () => onAction(row.original, "view"),
        onLogs: () => handleJobLogs(row.original, isArchiving),
        onArchive: () =>
          handleArchiveJob({
            id: row.original.id,
          }),
        onUnarchive: () =>
          handleArchiveJob({
            id: row.original.id,
          }),
        onDelete: () => handleDeleteJob(row.original),
      }),
    [
      canEdit,
      canDelete,
      canRead,
      isArchiving,
      row.original,
      onAction,
      handleJobLogs,
      handleArchiveJob,
      handleDeleteJob,
    ]
  );
  return <Dropdown items={items} />;
}

const getCompletedJobsColumns = (
  onAction: (job: TransformedJob, action: string) => void,
  isArchiving: boolean,
  handleArchiveJob: (params: { id: number }) => void,
  handleDeleteJob: (job: TransformedJob) => void,
  handleJobLogs: (job: TransformedJob, isArchived: boolean) => void,
  hasAnyWritePermission: boolean = false
): ColumnDef<TransformedJob, unknown>[] => {
  const builder = new ColumnBuilder<TransformedJob, unknown>();

  // Select column (conditional - complex permission-based logic)
  if (hasAnyWritePermission) {
    builder.addColumn({
      id: "select",
      header: ({ table }: HeaderContext<TransformedJob, unknown>) => {
        const allRows = table.getFilteredRowModel().rows;
        const editableRows = allRows.filter(
          (row) => row.original?.permissions?.canEdit
        );

        if (editableRows.length === 0) {
          return <div className="w-6"></div>;
        }

        const allEditableSelected =
          editableRows.length > 0 &&
          editableRows.every((row) => row.getIsSelected());
        const someEditableSelected = editableRows.some((row) =>
          row.getIsSelected()
        );

        return (
          <SanitizedInput
            ref={(el) => {
              if (el) {
                el.indeterminate = someEditableSelected && !allEditableSelected;
              }
            }}
            aria-label="Select all"
            checked={allEditableSelected}
            type="checkbox"
            onChange={() => {
              const newSelection: Record<string, boolean> = {};
              if (!someEditableSelected) {
                editableRows.forEach((row) => {
                  newSelection[row.index.toString()] = true;
                });
              }
              table.setRowSelection(newSelection);
            }}
          />
        );
      },
      cell: ({ row }: CellContext<TransformedJob, unknown>) => {
        const canEdit = row.original.permissions?.canEdit || false;

        if (!canEdit) {
          return null;
        }

        return (
          <SanitizedInput
            aria-label="Select row"
            checked={row.getIsSelected?.()}
            type="checkbox"
            onChange={(e) => row.toggleSelected?.(e.target.checked)}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 48,
    } as ColumnDef<TransformedJob, unknown>);
  }

  // Job Name
  builder.addColumn({
    accessorKey: "title",
    header: "Job Name",
    cell: ({ row }: CellContext<TransformedJob, unknown>) => {
      const job = row.original;
      return <JobOrLeadListNameWithDescriptionCell row={job} typeLabel="Job" />;
    },
  });

  builder.addColumn(clientsAndFarmsColumn<TransformedJob>());

  // Job Progress
  const { column: progressCol } =
    ColumnPresets.progressColumnPreset<TransformedJob>({
      id: "progress_bar",
      title: "Job Progress",
      getProgress: (job: TransformedJob) => {
        const progressBar = job.progress_bar || "0/1";
        const [progress, progressTotal] = String(progressBar)
          .split("/")
          .map(Number);
        return {
          percent: (progress / progressTotal) * 100,
          label: `${progress}/${progressTotal}`,
        };
      },
    });
  builder.addColumn({
    ...progressCol,
    accessorKey: "progress_bar",
  } as ColumnDef<TransformedJob, unknown>);

  // Job Type
  builder.addColumn({
    accessorKey: "job_object_subclass",
    header: "Job Type",
    cell: ({ row }: CellContext<TransformedJob, unknown>) => {
      const jobType = row.getValue("job_object_subclass");
      return jobType === TILING_JOB_SUBCLASS ? "Tile Job" : jobType;
    },
  });

  // Material Status (tiling jobs only)
  builder.addColumn({
    accessorKey: "material_status",
    header: "Material Status",
    cell: ({ row }: CellContext<TransformedJob, unknown>) => {
      if (row.original.job_object_subclass !== TILING_JOB_SUBCLASS) {
        return null;
      }
      return formatMaterialStatusLabel(row.original.material_status) || null;
    },
  });

  // Job Status (status badge)
  const { column: statusCol } = ColumnPresets.statusColumnPreset<
    TransformedJob,
    JobStatus | undefined
  >({
    accessorKey: "job_status",
    title: "Job Status",
    renderStatus: (_status, job) => {
      const status = job.cancelled === true ? "Cancelled" : "Completed";
      const backgroundColor = status === "Cancelled" ? "#ef4444" : "#22c55e";
      return (
        <span
          className="rounded px-2 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor }}
        >
          {status}
        </span>
      );
    },
  });
  builder.addColumn({
    ...statusCol,
    filterFn: (row, _id, value) => {
      const status =
        row.original.cancelled === true ? "Cancelled" : "Completed";
      const filters = value as string[];
      return filters.some((val) => {
        if (val === "completed" && status === "Completed") return true;
        if (val === "cancelled" && status === "Cancelled") return true;
        return false;
      });
    },
  } as ColumnDef<TransformedJob, unknown>);

  // Date
  builder.addColumn({
    accessorKey: "last_updated",
    header: "Date",
    cell: ({ row }: CellContext<TransformedJob, unknown>) => {
      const created = row.original.created_at
        ? new Date(row.original.created_at).toLocaleDateString()
        : "-";
      const updatedby = row.original.last_updated_by;
      return `${created} - ${updatedby}`;
    },
  });

  // Actions column
  const { column: actionsCol } =
    ColumnPresets.actionsColumnPreset<TransformedJob>({
      cell: ({ row }: CellContext<TransformedJob, unknown>) => (
        <CompletedJobActionsCell
          handleArchiveJob={handleArchiveJob}
          handleDeleteJob={handleDeleteJob}
          handleJobLogs={handleJobLogs}
          isArchiving={isArchiving}
          row={row}
          onAction={onAction}
        />
      ),
    });
  builder.addColumn({
    ...actionsCol,
    size: 48,
  } as ColumnDef<TransformedJob, unknown>);

  return builder.build({});
};

export default getCompletedJobsColumns;
