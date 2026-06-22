import type { TableSortRule } from "@fieldflow360/org-ui";

import type { SortOrder } from "@/api/types";

export const NAME_LAST_UPDATED_SORT_COLUMNS = [
  { key: "customer_name", label: "Name" },
  { key: "last_updated", label: "Last Updated" },
] as const;

const SORT_COLUMN_TO_API: Record<string, "name" | "last_updated"> = {
  customer_name: "name",
  last_updated: "last_updated",
};

export function tableSortRulesToNameLastUpdatedSort(
  sortRules: TableSortRule[]
): {
  sort_by?: "name" | "last_updated";
  sort_order?: SortOrder;
} {
  const rule = sortRules[0];
  if (!rule?.direction) {
    return {};
  }

  const sort_by = SORT_COLUMN_TO_API[rule.columnKey];
  if (!sort_by) {
    return {};
  }

  return {
    sort_by,
    sort_order: rule.direction as SortOrder,
  };
}

export function nameLastUpdatedSortToTableSortRules(
  sortBy?: string,
  sortOrder?: SortOrder | null
): TableSortRule[] {
  if (!sortBy || !sortOrder) {
    return [];
  }

  const columnKey =
    sortBy === "name"
      ? "customer_name"
      : sortBy === "last_updated"
        ? "last_updated"
        : sortBy;

  return [{ columnKey, direction: sortOrder }];
}
