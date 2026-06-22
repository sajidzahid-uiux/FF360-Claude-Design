"use client";

import { type ReactNode, useMemo } from "react";

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
  useTablePreferences,
} from "@fieldflow360/org-ui";

import { CmsOrgUiTable } from "../cms-org-ui-table/CmsOrgUiTable";

export type OrgUiDataTableColumn<T extends { id: string | number }> = Omit<
  Column<T>,
  "header"
> &
  Partial<Pick<Column<T>, "header">>;

export interface OrgUiDataTableProps<T extends { id: string | number }> {
  bulkActions?: TableBulkAction[];
  columns: OrgUiDataTableColumn<T>[];
  data: T[];
  emptyState: {
    title: string;
    description: string;
  };
  filterDefinitions?: TableFilterDefinition[];
  filterValues?: TableFilterValue[];
  grid?: TableGridViewConfig<T>;
  kanban?: TableKanbanViewConfig<T>;
  isLoading?: boolean;
  onFilterValuesChange?: (values: TableFilterValue[]) => void;
  onRowDoubleClick?: (row: T) => void;
  onSelectChange?: (ids: (string | number)[]) => void;
  onSortRulesChange?: (rules: TableSortRule[]) => void;
  onViewChange?: (view: TableViewMode) => void;
  pagination?: TablePaginationConfig;
  search?: TableSearchConfig;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  showKanbanView?: boolean;
  sortableColumns?: { key: string; label: string }[];
  sortRules?: TableSortRule[];
  storageKey?: string;
  toolbarActions?: ReactNode;
  view?: TableViewMode;
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

export function OrgUiDataTable<T extends { id: string | number }>({
  bulkActions = [],
  columns: allColumns,
  data,
  emptyState,
  filterDefinitions = [],
  filterValues = [],
  grid,
  kanban,
  isLoading,
  onFilterValuesChange,
  onSelectChange,
  onSortRulesChange,
  onViewChange,
  pagination,
  search,
  selectable = false,
  selectedIds = [],
  showKanbanView = false,
  sortableColumns = [],
  sortRules = [],
  storageKey,
  toolbarActions,
  view = "list",
}: OrgUiDataTableProps<T>) {
  const normalizedColumns = useMemo(
    () =>
      allColumns.map((column) => ({
        ...column,
        header: column.header ?? column.label,
      })) as Column<T>[],
    [allColumns]
  );

  const tablePreferences = useTablePreferences(normalizedColumns, {
    storageKey,
    defaultVariant: TableVariantEnum.PLAIN,
  });
  const columns = tablePreferences.applyColumns(normalizedColumns);

  return (
    <div className="flex min-h-0 flex-col gap-4">
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
        selectedIds={selectedIds}
        sortRules={sortRules}
        toolbar={
          <TableToolbar
            actions={toolbarActions}
            filters={filterDefinitions}
            filterValues={filterValues}
            search={search}
            showKanbanView={showKanbanView}
            sortableColumns={sortableColumns}
            sortRules={sortRules}
            tableSettings={tablePreferences.tableSettings}
            variant={tablePreferences.variant}
            view={view}
            onFilterValuesChange={onFilterValuesChange}
            onSortRulesChange={onSortRulesChange}
            onViewChange={onViewChange}
          />
        }
        variant={tablePreferences.variant}
        view={view}
        // onRowDoubleClick={onRowDoubleClick}
        onSelectChange={onSelectChange}
        onSortRulesChange={onSortRulesChange}
      />
    </div>
  );
}
