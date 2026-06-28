"use client";

import { TableActions, TableGridCard } from "@fieldflow360/org-ui";
import type { TableAction } from "@fieldflow360/org-ui";
import { Lock, Pencil, Trash2 } from "lucide-react";

import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";

export interface StatusItemRow {
  id: number | string;
  title: string;
  subtitle: string;
  color: string;
  order?: string | number;
  canDelete: boolean;
  isDefault?: boolean;
  locked?: boolean;
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
  const accent = item.color || "#18181B";

  return (
    <TableGridCard
      actions={
        <TableActions
          actions={actions}
          item={item}
          {...INLINE_TABLE_ROW_ACTIONS_PROPS}
        />
      }
      className="relative h-auto overflow-hidden pl-5 transition-shadow hover:shadow-sm"
      headerContent={
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-text-muted text-xs">{item.subtitle}</span>
          {item.isDefault ? (
            <span className="bg-accent-light text-accent inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
              Default
            </span>
          ) : null}
        </div>
      }
      title={
        <div className="flex min-w-0 items-center gap-2.5">
          {hasOrder ? (
            <span
              aria-hidden
              className="ring-border-subtle flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ring-1"
              style={{ backgroundColor: accent }}
            >
              {item.order}
            </span>
          ) : (
            <span
              aria-hidden
              className="ring-border-subtle h-3 w-3 shrink-0 rounded-full ring-1"
              style={{ backgroundColor: accent }}
            />
          )}
          <span className="truncate">{item.title}</span>
          {item.locked ? (
            <Lock
              aria-label="Locked status"
              className="text-text-muted h-3.5 w-3.5 shrink-0"
              strokeWidth={2}
            />
          ) : null}
        </div>
      }
    >
      {/* Color accent rail keyed to the status color. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: accent }}
      />
      <span className="sr-only">{item.subtitle}</span>
    </TableGridCard>
  );
}
