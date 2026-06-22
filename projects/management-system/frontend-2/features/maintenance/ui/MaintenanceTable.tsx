"use client";

import { useCallback, useMemo } from "react";

import {
  type TableBulkAction,
  TableDataModeEnum,
  type TableGridViewConfig,
  type TablePaginationConfig,
  type TableSearchConfig,
  type TableSortRule,
  TableToolbar,
  TableVariantEnum,
  type TableViewMode,
  useTablePreferences,
} from "@fieldflow360/org-ui";
import { Trash2 } from "lucide-react";

import type { TeamMember } from "@/api/types/team";
import type { EnrichedMaintenanceItem } from "@/features/maintenance";
import {
  MAINTENANCE_EQUIPMENT_SORT_COLUMN_KEY,
  MaintenanceGridCard,
} from "@/features/maintenance";
import {
  type MaintenanceOrgUiColumnsOptions,
  getMaintenanceOrgUiColumns,
} from "@/features/maintenance/lib/columns";
import { useRouteIds } from "@/hooks";
import { CmsOrgUiTable } from "@/shared/ui";

export interface MaintenanceTableProps {
  data: EnrichedMaintenanceItem[];
  isLoading?: boolean;
  pagination?: TablePaginationConfig;
  search: TableSearchConfig;
  sortRules: TableSortRule[];
  onSortRulesChange: (rules: TableSortRule[]) => void;
  view: TableViewMode;
  onViewChange: (view: TableViewMode) => void;
  selectable?: boolean;
  selectedIds: (string | number)[];
  onSelectChange: (ids: (string | number)[]) => void;
  isAdmin: boolean;
  userMap: Record<string | number, TeamMember["user"]>;
  onAction: (row: EnrichedMaintenanceItem, action: string) => void;
  onBulkDelete: (selectedIds: (string | number)[]) => void;
}

const MAINTENANCE_SORTABLE_COLUMNS = [
  { key: MAINTENANCE_EQUIPMENT_SORT_COLUMN_KEY, label: "Equipment" },
] as const;

export function MaintenanceTable({
  data,
  isLoading,
  pagination,
  search,
  sortRules,
  onSortRulesChange,
  view,
  onViewChange,
  selectable = false,
  selectedIds,
  onSelectChange,
  isAdmin,
  userMap,
  onAction,
  onBulkDelete,
}: MaintenanceTableProps) {
  const { orgId } = useRouteIds();

  const columnHandlers = useMemo(
    (): MaintenanceOrgUiColumnsOptions => ({
      userMap,
      isAdmin,
      onAction,
    }),
    [userMap, isAdmin, onAction]
  );

  const allColumns = useMemo(
    () => getMaintenanceOrgUiColumns(columnHandlers),
    [columnHandlers]
  );

  const tablePreferences = useTablePreferences(allColumns, {
    storageKey: orgId ? `maintenance-table-columns:${orgId}` : undefined,
    defaultVariant: TableVariantEnum.PLAIN,
  });
  const columns = tablePreferences.applyColumns(allColumns);

  const bulkActions = useMemo((): TableBulkAction[] => {
    if (!isAdmin) return [];

    return [
      {
        id: "delete-selected",
        label: "Delete Selected",
        icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
        variant: "danger",
        onClick: onBulkDelete,
      },
    ];
  }, [isAdmin, onBulkDelete]);

  const renderGridCard = useCallback(
    (
      item: EnrichedMaintenanceItem,
      context: {
        selected: boolean;
        onSelectedChange: (selected: boolean) => void;
      }
    ) => (
      <MaintenanceGridCard
        handlers={columnHandlers}
        item={item}
        selectable={selectable}
        selected={context.selected}
        userMap={userMap}
        onDoubleClick={() => onAction(item, "view")}
        onSelectedChange={context.onSelectedChange}
      />
    ),
    [columnHandlers, onAction, selectable, userMap]
  );

  const grid = useMemo(
    (): TableGridViewConfig<EnrichedMaintenanceItem> => ({
      renderCard: renderGridCard,
      minColumnWidth: "minmax(18rem, 1fr)",
    }),
    [renderGridCard]
  );

  return (
    <CmsOrgUiTable
      bulkActions={bulkActions}
      columns={columns}
      data={data}
      dataMode={TableDataModeEnum.SERVER}
      emptyState={{
        title: "No maintenance found",
        description:
          "Try adjusting your search or filters to find maintenance items.",
      }}
      grid={grid}
      isLoading={isLoading}
      pagination={pagination}
      selectable={selectable}
      selectedIds={selectedIds}
      showHeaderWhenEmpty={true}
      sortRules={sortRules}
      toolbar={
        <TableToolbar
          search={{
            ...search,
            placeholder: search.placeholder ?? "Search maintenance…",
          }}
          showKanbanView={false}
          sortableColumns={[...MAINTENANCE_SORTABLE_COLUMNS]}
          sortRules={sortRules}
          tableSettings={tablePreferences.tableSettings}
          variant={tablePreferences.variant}
          view={view}
          onSortRulesChange={onSortRulesChange}
          onViewChange={onViewChange}
        />
      }
      variant={tablePreferences.variant}
      view={view}
      onSelectChange={onSelectChange}
      onSortRulesChange={onSortRulesChange}
    />
  );
}
