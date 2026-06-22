"use client";

import {
  type Column,
  type TableAction,
  TableActions,
  TableHeaderLabel,
} from "@fieldflow360/org-ui";
import {
  Calendar,
  CalendarClock,
  Eye,
  FileDown,
  HardHat,
  MessageSquare,
  Ruler,
  User,
} from "lucide-react";

import type { FormattedFootageData } from "@/api/types";
import {
  orgUiTouchSlideTextColumn,
  orgUiTruncatedTextColumn,
  tableActionsColumnShell,
} from "@/shared/lib/table/org-ui";

export interface FootageOrgUiColumnHandlers {
  onView: (row: FormattedFootageData) => void;
  onDownloadExcel: (jobId: number, jobTitle: string) => void;
  onAddNote: (row: FormattedFootageData) => void;
  isAdmin: boolean;
}

function canManageFootageNote(row: FormattedFootageData): boolean {
  return !row.is_completed && !row.is_cancelled;
}

function buildFootageTableActions(
  row: FormattedFootageData,
  handlers: FootageOrgUiColumnHandlers
): TableAction<FormattedFootageData>[] {
  const actions: TableAction<FormattedFootageData>[] = [
    {
      label: "View charts",
      icon: <Eye aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => handlers.onView(row),
    },
    {
      label: "Download Excel",
      icon: <FileDown aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => handlers.onDownloadExcel(row.job_id, row.name),
    },
  ];

  if (!canManageFootageNote(row)) {
    return actions;
  }

  if (handlers.isAdmin) {
    actions.push({
      label: row.note ? "Edit note" : "Add note",
      icon: <MessageSquare aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => handlers.onAddNote(row),
    });
  } else if (row.note) {
    actions.push({
      label: "View note",
      icon: <MessageSquare aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => handlers.onAddNote(row),
    });
  }

  return actions;
}

export function getFootageOrgUiColumns(
  handlers: FootageOrgUiColumnHandlers
): Column<FormattedFootageData>[] {
  return [
    orgUiTouchSlideTextColumn<FormattedFootageData>({
      key: "name",
      label: "Name",
      icon: User,
      sortable: true,
      width: "24%",
      maxWidth: "w-full",
      getText: (row) => row.name,
    }),
    orgUiTruncatedTextColumn<FormattedFootageData>({
      key: "crew_display",
      label: "Crew",
      icon: HardHat,
      width: "200px",
      truncateHeader: true,
      muted: true,
      getText: (row) => row.crew_display,
      emptyLabel: "—",
    }),
    orgUiTruncatedTextColumn<FormattedFootageData>({
      key: "first_recorded",
      label: "First Recorded",
      icon: Calendar,
      sortable: true,
      width: "10%",
      tabularNums: true,
      getText: (row) => row.first_recorded,
    }),
    orgUiTruncatedTextColumn<FormattedFootageData>({
      key: "last_updated",
      label: "Last Updated",
      icon: CalendarClock,
      sortable: true,
      width: "10%",
      tabularNums: true,
      getText: (row) => row.last_updated,
    }),
    orgUiTruncatedTextColumn<FormattedFootageData>({
      key: "total_lateral_footage",
      label: "Lateral Footage",
      icon: Ruler,
      width: "12%",
      tabularNums: true,
      getText: (row) => row.total_lateral_footage,
    }),
    orgUiTruncatedTextColumn<FormattedFootageData>({
      key: "total_main_footage",
      label: "Main Footage",
      icon: Ruler,
      width: "12%",
      tabularNums: true,
      getText: (row) => row.total_main_footage,
    }),
    {
      key: "note",
      label: "Note",
      width: "10%",
      cellClassName: "min-w-0",
      header: <TableHeaderLabel icon={MessageSquare} label="Note" />,
      render: (row) => {
        if (row.is_completed || row.is_cancelled) return null;

        if (!row.note) {
          return (
            <span className="text-text-muted text-xs italic">No note</span>
          );
        }

        return (
          <span
            className="text-text-muted block truncate text-xs"
            title={row.note}
          >
            {row.note}
          </span>
        );
      },
    },
    {
      ...tableActionsColumnShell<FormattedFootageData>({
        width: "72px",
        render: (row) => (
          <TableActions
            actions={buildFootageTableActions(row, handlers)}
            item={row}
            maxVisibleActions={0}
          />
        ),
      }),
    },
  ];
}
