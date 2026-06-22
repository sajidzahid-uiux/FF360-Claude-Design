"use client";

import type { ReactNode } from "react";

import {
  type Column,
  Eye,
  type TableAction,
  TableActions,
  Trash2,
} from "@fieldflow360/org-ui";
import { Calendar, Clock, RotateCcw, Tag, User } from "lucide-react";

import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";
import {
  mapDropdownItemsToTableActions,
  orgUiTouchSlideTextColumn,
  orgUiTruncatedTextColumn,
  tableActionsColumnShell,
} from "@/shared/lib/table/org-ui";
import { buildRowActions } from "@/utils/actions";

import type { TrashTableRow } from "./trashTableRows";

export interface TrashOrgUiColumnHandlers {
  canRestore: boolean;
  canDelete: boolean;
  onView: (row: TrashTableRow) => void;
  onRestore: (row: TrashTableRow) => void;
  onDelete: (row: TrashTableRow) => void;
}

function buildTrashTableActions(
  row: TrashTableRow,
  handlers: TrashOrgUiColumnHandlers
): TableAction<TrashTableRow>[] {
  const iconByKey: Record<string, ReactNode> = {
    view: <Eye aria-hidden className="h-4 w-4" strokeWidth={2} />,
    restore: <RotateCcw aria-hidden className="h-4 w-4" strokeWidth={2} />,
    delete: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
  };

  return mapDropdownItemsToTableActions<TrashTableRow>({
    items: buildRowActions({
      canView: true,
      canEdit: false,
      canDelete: handlers.canDelete,
      canArchive: false,
      canTrack: false,
      isArchived: false,
      canRestore: handlers.canRestore,
      onView: () => handlers.onView(row),
      onRestore: handlers.canRestore
        ? () => handlers.onRestore(row)
        : undefined,
      onDelete: handlers.canDelete ? () => handlers.onDelete(row) : undefined,
    }),
    iconByKey,
  });
}

export function getTrashOrgUiColumns(
  handlers: TrashOrgUiColumnHandlers
): Column<TrashTableRow>[] {
  return [
    orgUiTouchSlideTextColumn<TrashTableRow>({
      key: "name",
      label: "Name",
      icon: User,
      width: "280px",
      maxWidth: "w-[260px]",
      getText: (row) => row.name,
      onDoubleClick: (row) => handlers.onView(row),
      emptyLabel: "—",
    }),
    orgUiTruncatedTextColumn<TrashTableRow>({
      key: "typeLabel",
      label: "Type",
      icon: Tag,
      width: "180px",
      getText: (row) => row.typeLabel,
    }),
    orgUiTruncatedTextColumn<TrashTableRow>({
      key: "deletedDate",
      label: "Deleted",
      icon: Calendar,
      width: "140px",
      tabularNums: true,
      getText: (row) => row.deletedDate,
    }),
    orgUiTruncatedTextColumn<TrashTableRow>({
      key: "expiresLabel",
      label: "Expires In",
      icon: Clock,
      width: "140px",
      getText: (row) => row.expiresLabel,
    }),
    {
      ...tableActionsColumnShell<TrashTableRow>({
        render: (row) => (
          <TableActions
            {...INLINE_TABLE_ROW_ACTIONS_PROPS}
            actions={buildTrashTableActions(row, handlers)}
            item={row}
          />
        ),
      }),
    },
  ];
}
