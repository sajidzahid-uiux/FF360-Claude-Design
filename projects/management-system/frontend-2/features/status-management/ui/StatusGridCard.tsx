"use client";

import { TableActions, TableGridCard } from "@fieldflow360/org-ui";
import type { TableAction } from "@fieldflow360/org-ui";
import { Pencil, Trash2 } from "lucide-react";

import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";

export interface StatusItemRow {
  id: number | string;
  title: string;
  subtitle: string;
  color: string;
  order?: string | number;
  canDelete: boolean;
}

interface StatusGridCardProps {
  item: StatusItemRow;
  onEdit: () => void;
  onDelete?: () => void;
}

function buildStatusActions(
  item: StatusItemRow,
  onEdit: () => void,
  onDelete?: () => void
): TableAction<StatusItemRow>[] {
  const actions: TableAction<StatusItemRow>[] = [
    {
      label: "Edit",
      icon: <Pencil aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => onEdit(),
    },
  ];

  if (item.canDelete && onDelete) {
    actions.push({
      label: "Delete",
      variant: "danger",
      icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => onDelete(),
    });
  }

  return actions;
}

export function StatusGridCard({
  item,
  onEdit,
  onDelete,
}: StatusGridCardProps) {
  const actions = buildStatusActions(item, onEdit, onDelete);
  const hasOrder = item.order !== undefined && item.order !== " ";

  return (
    <TableGridCard
      actions={
        <TableActions
          actions={actions}
          item={item}
          {...INLINE_TABLE_ROW_ACTIONS_PROPS}
        />
      }
      className="h-auto"
      headerContent={
        <span className="text-text-muted text-xs">{item.subtitle}</span>
      }
      title={
        <div className="flex min-w-0 items-center gap-2.5">
          {hasOrder ? (
            <span
              aria-hidden
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: item.color || "#18181B" }}
            >
              {item.order}
            </span>
          ) : (
            <span
              aria-hidden
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: item.color || "#18181B" }}
            />
          )}
          <span className="truncate">{item.title}</span>
        </div>
      }
    >
      <span className="sr-only">{item.subtitle}</span>
    </TableGridCard>
  );
}
