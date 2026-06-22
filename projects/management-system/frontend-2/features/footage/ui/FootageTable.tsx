"use client";

import { useCallback, useMemo } from "react";

import {
  TableDataModeEnum,
  type TableFilterValue,
  type TablePaginationConfig,
  type TableSearchConfig,
  type TableSortRule,
  TableToolbar,
  TableVariantEnum,
  useTablePreferences,
} from "@fieldflow360/org-ui";

import type { FormattedFootageData } from "@/api/types";
import type { CrewFilterOption } from "@/features/footage";
import {
  buildFootageTableFilterDefinitions,
  footageFilterStateToTableValues,
  mergeFootageTableFilterValues,
} from "@/features/footage";
import { getFootageOrgUiColumns } from "@/features/footage/lib/columns";
import { useRouteIds } from "@/hooks/useRouteIds";
import { CmsOrgUiTable } from "@/shared/ui";
import type { FilterState } from "@/shared/ui/common";

const FOOTAGE_SORTABLE_COLUMNS = [
  { key: "last_updated", label: "Last Updated" },
  { key: "first_recorded", label: "First Recorded" },
  { key: "name", label: "Name" },
] as const;

export interface FootageTableProps {
  data: FormattedFootageData[];
  filters: FilterState;
  crewOptions: CrewFilterOption[];
  isLoading?: boolean;
  pagination?: TablePaginationConfig;
  search: TableSearchConfig;
  sortRules: TableSortRule[];
  onFiltersChange: (filters: FilterState) => void;
  onSortRulesChange: (rules: TableSortRule[]) => void;
  onView: (row: FormattedFootageData) => void;
  onDownloadExcel: (jobId: number, jobTitle: string) => void;
  onAddNote: (row: FormattedFootageData) => void;
  isAdmin: boolean;
}

export function FootageTable({
  data,
  filters,
  crewOptions,
  isLoading,
  pagination,
  search,
  sortRules,
  onFiltersChange,
  onSortRulesChange,
  onView,
  onDownloadExcel,
  onAddNote,
  isAdmin,
}: FootageTableProps) {
  const { orgId } = useRouteIds();

  const columns = useMemo(
    () =>
      getFootageOrgUiColumns({
        onView,
        onDownloadExcel,
        onAddNote,
        isAdmin,
      }),
    [isAdmin, onAddNote, onDownloadExcel, onView]
  );

  const tablePreferences = useTablePreferences(columns, {
    storageKey: orgId ? `footage-table:${orgId}` : undefined,
    defaultVariant: TableVariantEnum.PLAIN,
  });
  const visibleColumns = tablePreferences.applyColumns(columns);

  const filterDefinitions = useMemo(
    () => buildFootageTableFilterDefinitions(crewOptions),
    [crewOptions]
  );

  const filterValues = useMemo(
    () => footageFilterStateToTableValues(filters),
    [filters]
  );

  const handleFilterValuesChange = useCallback(
    (values: TableFilterValue[]) => {
      onFiltersChange(mergeFootageTableFilterValues(filters, values));
    },
    [filters, onFiltersChange]
  );

  return (
    <CmsOrgUiTable
      showHeaderWhenEmpty
      columns={visibleColumns}
      data={data}
      dataMode={TableDataModeEnum.CLIENT}
      emptyState={{
        title: "No footage records found",
        description:
          "There are no installed footage records available at this time.",
      }}
      isLoading={isLoading}
      pagination={pagination}
      sortRules={sortRules}
      toolbar={
        <TableToolbar
          showRefinements
          filters={filterDefinitions}
          filterValues={filterValues}
          hideRefinementsWhenEmpty={false}
          isLoading={isLoading}
          rowCount={data.length}
          search={{
            ...search,
            placeholder: search.placeholder ?? "Search by job name…",
          }}
          showViewSwitcher={false}
          sortableColumns={[...FOOTAGE_SORTABLE_COLUMNS]}
          sortRules={sortRules}
          tableSettings={tablePreferences.tableSettings}
          totalCount={pagination?.totalCount}
          variant={tablePreferences.variant}
          onFilterValuesChange={handleFilterValuesChange}
          onSortRulesChange={onSortRulesChange}
        />
      }
      variant={tablePreferences.variant}
      onSortRulesChange={onSortRulesChange}
    />
  );
}
