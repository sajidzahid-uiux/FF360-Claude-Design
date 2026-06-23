"use client";

import type { MouseEvent } from "react";

import { Table, type TableProps, cn } from "@fieldflow360/org-ui";

import { ViewMode } from "@/constants";
import { isInteractiveRowTarget } from "@/shared/lib/table/row-activation";

const CMS_ORG_UI_TABLE_VIEWPORT_CLASS =
  "flex min-h-0 h-[calc(100dvh-14rem)] w-full flex-col";

const CMS_ORG_UI_TABLE_KANBAN_VIEWPORT_CLASS =
  "cms-table-kanban-scroll flex min-h-0 w-full max-h-[calc(100dvh-14rem)] flex-col";

export function CmsOrgUiTable<T extends { id: string | number }>({
  className,
  compact = false,
  view,
  onRowActivate,
  ...props
}: TableProps<T> & {
  compact?: boolean;
  /**
   * Whole-row click navigation for the list view. org-ui's `Table` has no
   * row-click prop, so we delegate at the wrapper: a click anywhere on a body
   * row (except interactive cells) resolves the row index and activates the
   * matching record. Clicks on action menus, status selectors and checkboxes
   * are ignored via {@link isInteractiveRowTarget}.
   */
  onRowActivate?: (id: T["id"], item: T) => void;
}) {
  const isKanbanView = view === ViewMode.KANBAN;
  const rowActivationEnabled = Boolean(onRowActivate) && !isKanbanView;

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onRowActivate || isInteractiveRowTarget(event.target)) return;
    const target = event.target as Element;
    const row = target.closest("tbody tr");
    if (!row || !row.parentElement) return;
    const index = Array.prototype.indexOf.call(row.parentElement.children, row);
    const item = props.data?.[index];
    if (item) onRowActivate(item.id, item);
  };

  return (
    <div
      className={cn(
        compact
          ? "flex min-h-0 w-full flex-col"
          : isKanbanView
            ? CMS_ORG_UI_TABLE_KANBAN_VIEWPORT_CLASS
            : CMS_ORG_UI_TABLE_VIEWPORT_CLASS,
        rowActivationEnabled && "[&_tbody_tr]:cursor-pointer"
      )}
      onClick={rowActivationEnabled ? handleClick : undefined}
    >
      <Table
        {...props}
        className={cn(
          compact ? "h-auto w-full" : "min-h-0 flex-1",
          !compact && (isKanbanView ? "h-auto" : "h-full"),
          className
        )}
        fillHeight={!compact}
        view={view}
      />
    </div>
  );
}
