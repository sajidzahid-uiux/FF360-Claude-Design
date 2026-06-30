"use client";

import { type ReactNode, useCallback } from "react";

import {
  type Column,
  type TableBulkAction,
  TableDataModeEnum,
  type TableFilterDefinition,
  type TableFilterValue,
  type TableGridViewConfig,
  type TableKanbanViewConfig,
  type TablePaginationConfig,
  type TableSearchConfig,
  type TableSortRule,
  TableToolbar,
  TableVariantEnum,
  type TableViewMode,
  type UseTablePreferencesResult,
  useTablePreferences,
} from "@fieldflow360/org-ui";

import { CmsOrgUiTable } from "@/shared/ui";

import { useTableRefinementMemory } from "@/features/job-lead/lib/useTableRefinementMemory";

export interface JobLeadTableProps<T extends { id: string | number }> {
  bulkActions: TableBulkAction[];
  columns: Column<T>[];
  /**
   * Externally-managed column preferences (visibility / order / variant). When
   * provided, the table uses it instead of its own auto-saving localStorage
   * preferences — e.g. the leads tables persist per lead type with user/org scope.
   */
  columnPreferences?: UseTablePreferencesResult<T>;
  data: T[];
  /**
   * Adds the "Remember filters/sort/columns for this list" toggles to the
   * toolbar panels and restores saved refinements on mount. Off by default —
   * lead/job listings intentionally omit these; other lists (e.g. team members)
   * opt in.
   */
  enableRefinementMemory?: boolean;
  emptyState: {
    title: string;
    description: string;
  };
  filterDefinitions: TableFilterDefinition[];
  filterValues: TableFilterValue[];
  isLoading?: boolean;
  onFilterValuesChange: (values: TableFilterValue[]) => void;
  onSelectChange: (ids: (string | number)[]) => void;
  onSortRulesChange: (rules: TableSortRule[]) => void;
  onViewChange: (view: TableViewMode) => void;
  organizationId?: string | number | null;
  pagination?: TablePaginationConfig;
  search: TableSearchConfig;
  selectable: boolean;
  selectedIds: (string | number)[];
  showKanbanView?: boolean;
  sortableColumns: { key: string; label: string }[];
  sortRules: TableSortRule[];
  storageKeyPrefix: string;
  toolbarActions: ReactNode;
  view: TableViewMode;
  grid?: TableGridViewConfig<T>;
  kanban?: TableKanbanViewConfig<T>;
  onRowActivate?: (id: T["id"], item: T) => void;
}

export function tableValuesToFilterState<
  TFilterState extends Record<string, unknown>,
>(values: TableFilterValue[]): TFilterState {
  return values.reduce<TFilterState>((next, value) => {
    next[value.filterId as keyof TFilterState] =
      value.values as TFilterState[keyof TFilterState];
    return next;
  }, {} as TFilterState);
}

export function filterStateToTableValues(
  filters: Record<string, unknown>
): TableFilterValue[] {
  return Object.entries(filters)
    .filter(([, value]) => Array.isArray(value) && value.length > 0)
    .map(([filterId, value]) => ({
      filterId,
      values: Array.isArray(value) ? value.map(String) : [],
    }));
}

export function toNumericIds(ids: (string | number)[]): number[] {
  return ids
    .map((id) => Number(id))
    .filter((id): id is number => Number.isFinite(id));
}

export function JobLeadTable<T extends { id: string | number }>({
  bulkActions,
  columns: allColumns,
  columnPreferences,
  data,
  enableRefinementMemory = false,
  emptyState,
  filterDefinitions,
  filterValues,
  grid,
  kanban,
  isLoading,
  onFilterValuesChange,
  onSelectChange,
  onSortRulesChange,
  onViewChange,
  organizationId,
  pagination,
  search,
  selectable,
  selectedIds,
  showKanbanView = false,
  sortableColumns,
  sortRules,
  storageKeyPrefix,
  toolbarActions,
  view,
  onRowActivate,
}: JobLeadTableProps<T>) {
  const internalPreferences = useTablePreferences(allColumns, {
    defaultVariant: TableVariantEnum.PLAIN,
  });
  const tablePreferences = columnPreferences ?? internalPreferences;
  const columns = tablePreferences.applyColumns(allColumns);

  // The "Remember … for this list" toggles are opt-in (off for lead/job
  // listings). When disabled the hook is inert — no toggles, no restore.
  const { filterPersistence, sortPersistence, settingsPersistence } =
    useTableRefinementMemory({
      enabled: enableRefinementMemory,
      storageKeyPrefix,
      organizationId,
      filterValues,
      onFilterValuesChange,
      sortRules,
      onSortRulesChange,
      // Only manage column persistence when we own the preferences (not an
      // externally-supplied columnPreferences, which handles its own saving).
      columnTarget: columnPreferences ? null : internalPreferences,
    });

  const handleViewChange = useCallback(
    (nextView: TableViewMode) => onViewChange(nextView),
    [onViewChange]
  );

  return (
    <CmsOrgUiTable
      showHeaderWhenEmpty
      bulkActions={bulkActions}
      columns={columns}
      data={data}
      dataMode={TableDataModeEnum.SERVER}
      emptyState={emptyState}
      grid={grid}
      isLoading={isLoading}
      kanban={kanban}
      pagination={pagination}
      selectable={selectable}
      onRowActivate={onRowActivate}
      selectedIds={selectedIds}
      sortRules={sortRules}
      toolbar={
        <TableToolbar
          actions={toolbarActions}
          filterPersistence={filterPersistence}
          filters={filterDefinitions}
          filterValues={filterValues}
          search={search}
          settingsPersistence={settingsPersistence}
          showKanbanView={showKanbanView}
          sortableColumns={sortableColumns}
          sortPersistence={sortPersistence}
          sortRules={sortRules}
          tableSettings={tablePreferences.tableSettings}
          variant={tablePreferences.variant}
          view={view}
          onFilterValuesChange={onFilterValuesChange}
          onSortRulesChange={onSortRulesChange}
          onViewChange={handleViewChange}
        />
      }
      variant={tablePreferences.variant}
      view={view as TableViewMode}
      onSelectChange={onSelectChange}
      onSortRulesChange={onSortRulesChange}
    />
  );
}
