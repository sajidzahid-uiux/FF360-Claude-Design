"use client";

import { Table, type TableProps, cn } from "@fieldflow360/org-ui";

import { ViewMode } from "@/constants";

const CMS_ORG_UI_TABLE_VIEWPORT_CLASS =
  "flex min-h-0 h-[calc(100dvh-14rem)] w-full flex-col";

const CMS_ORG_UI_TABLE_KANBAN_VIEWPORT_CLASS =
  "cms-table-kanban-scroll flex min-h-0 w-full max-h-[calc(100dvh-14rem)] flex-col";

export function CmsOrgUiTable<T extends { id: string | number }>({
  className,
  compact = false,
  view,
  ...props
}: TableProps<T> & { compact?: boolean }) {
  const isKanbanView = view === ViewMode.KANBAN;

  return (
    <div
      className={cn(
        compact
          ? "flex min-h-0 w-full flex-col"
          : isKanbanView
            ? CMS_ORG_UI_TABLE_KANBAN_VIEWPORT_CLASS
            : CMS_ORG_UI_TABLE_VIEWPORT_CLASS
      )}
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
