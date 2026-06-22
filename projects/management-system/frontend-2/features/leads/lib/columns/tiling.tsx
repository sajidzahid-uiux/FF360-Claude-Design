import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";

import type { LeadStatus, LeadTypeInfo, Status, TeamMember } from "@/api/types";
import { clientsAndFarmsColumn } from "@/shared/lib/table/columns/common";
import { ColumnBuilder, ColumnPresets, Dropdown } from "@/shared/ui/common";
import { buildRowActions } from "@/utils/actions";

import { LeadNameWithDescriptionCell } from "./LeadNameCell";
import type { LeadTableRow } from "./types";

function TilingLeadActionsCell({
  rowOriginal,
  readOnly,
  onShowMore,
  onLogs,
  onTrash,
  onUnarchive,
  onArchive,
  isArchived = false,
}: {
  rowOriginal: LeadTableRow;
  readOnly?: boolean;
  onShowMore: (id: number, isArchived?: boolean) => void;
  onLogs?: (id: number, isArchived?: boolean) => void;
  onTrash: (id: number) => void;
  onUnarchive: (id: number) => void;
  onArchive: (id: number) => void;
  isArchived?: boolean;
}) {
  const finalIsArchived = Boolean(isArchived);
  const items = useMemo(
    () =>
      buildRowActions({
        canView: true,
        canEdit: !readOnly && !finalIsArchived,
        canDelete: !readOnly && !finalIsArchived,
        canArchive: !readOnly,
        canTrack: false,
        isArchived: finalIsArchived,
        onView: () => onShowMore(rowOriginal.id, finalIsArchived),
        onLogs: onLogs
          ? () => onLogs(rowOriginal.id, finalIsArchived)
          : undefined,
        onTrash: () => onTrash(rowOriginal.id),
        onArchive: () => onArchive(rowOriginal.id),
        onUnarchive: () => onUnarchive(rowOriginal.id),
      }),
    [
      readOnly,
      finalIsArchived,
      onShowMore,
      onLogs,
      onTrash,
      onArchive,
      onUnarchive,
      rowOriginal.id,
    ]
  );
  return <Dropdown items={items} />;
}

export function getTilingLeadColumns(
  onShowMore: (id: number, isArchived?: boolean) => void,
  onTrash: (id: number) => void,
  onUnarchive: (id: number) => void,
  onArchive: (id: number) => void,
  leadStatuses: Status[],
  leadTypes: Status[] = [],
  teamData: TeamMember[] = [],
  readOnly?: boolean,
  isArchived?: boolean,
  onLogs?: (id: number, isArchived?: boolean) => void
): ColumnDef<LeadTableRow>[] {
  const builder = new ColumnBuilder<LeadTableRow, unknown>();

  // Select column
  const { column: selectCol } =
    ColumnPresets.selectColumnPreset<LeadTableRow>();
  builder.addColumn(selectCol as ColumnDef<LeadTableRow, unknown>);

  // Lead Name (+ description preview, same UX as job tables)
  builder.addColumn({
    accessorKey: "customer_name",
    header: "Lead Name",
    cell: ({ row }) => <LeadNameWithDescriptionCell row={row.original} />,
  });

  // Estimate Number
  builder.addColumn({
    accessorKey: "estimate_number",
    header: "Estimate Number",
    cell: ({ row }) => row.original.estimate_number || "N/A",
  });

  // Phone
  builder.addColumn({
    accessorKey: "customer_phone_number",
    header: "Phone",
    cell: ({ row }) => {
      return (
        row.original.contact_info?.phone_number ||
        row.original.contact_info?.home_phone_number ||
        "N/A"
      );
    },
  });

  builder.addColumn(clientsAndFarmsColumn<LeadTableRow>());

  // Lead Source (status badge)
  const { column: leadTypeCol } = ColumnPresets.statusColumnPreset<
    LeadTableRow,
    LeadTypeInfo | number | undefined
  >({
    accessorKey: "lead_type",
    title: "Lead Source",
    renderStatus: (typeId) => {
      const leadType = leadTypes?.find((t) => t.id === typeId);
      const color = leadType?.color || "#3b82f6";
      return (
        <span
          className="rounded px-2 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {leadType?.title || "N/A"}
        </span>
      );
    },
  });
  builder.addColumn(leadTypeCol as ColumnDef<LeadTableRow, unknown>);

  // Lead Status (status badge)
  const { column: statusCol } = ColumnPresets.statusColumnPreset<
    LeadTableRow,
    LeadStatus | number | undefined
  >({
    accessorKey: "lead_status",
    title: "Status",
    renderStatus: (status, row) => {
      // The status might come from row.original.lead_status directly
      const actualStatus = row?.lead_status ?? status;
      if (!actualStatus) return <span className="text-text-muted">N/A</span>;
      // Handle both object and ID formats
      const leadStatus =
        typeof actualStatus === "object"
          ? actualStatus
          : leadStatuses?.find((s) => s.id === actualStatus);
      const color = leadStatus?.color || "#3b82f6";
      if (!leadStatus) return <span className="text-text-muted">N/A</span>;
      return (
        <span
          className="rounded px-2 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {leadStatus?.title || "N/A"}
        </span>
      );
    },
  });
  builder.addColumn(statusCol as ColumnDef<LeadTableRow, unknown>);

  // Last Updated
  builder.addColumn({
    accessorKey: "last_updated",
    header: "Last Updated",
    cell: ({ row }) => {
      const value = row.getValue("last_updated");
      const username = teamData
        ? teamData?.find((t) => t.id === row.original.last_updated_by)?.user
            ?.username
        : "N/A";
      if (!value) return "N/A";
      try {
        const date = new Date(value as string | number | Date);
        return date.toLocaleDateString() + " • " + (username || "N/A");
      } catch (error) {
        console.error(error);
        return "Invalid Date";
      }
    },
  });

  // Actions column
  const { column: actionsCol } =
    ColumnPresets.actionsColumnPreset<LeadTableRow>({
      cell: ({ row }) => (
        <TilingLeadActionsCell
          isArchived={isArchived}
          readOnly={readOnly}
          rowOriginal={row.original}
          onArchive={onArchive}
          onLogs={onLogs}
          onShowMore={onShowMore}
          onTrash={onTrash}
          onUnarchive={onUnarchive}
        />
      ),
    });
  builder.addColumn(actionsCol as ColumnDef<LeadTableRow, unknown>);

  return builder.build({});
}
