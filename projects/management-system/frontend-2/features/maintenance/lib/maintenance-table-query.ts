import type { TableSortRule } from "@fieldflow360/org-ui";

import { SortOrder } from "@/api/types";

/** Server list page size for the maintenance index (matches legacy table layout default). */
export const MAINTENANCE_LIST_PAGE_SIZE = 100;

export const MAINTENANCE_EQUIPMENT_SORT_COLUMN_KEY = "equipment_name";

/** Maps org-ui equipment sort to the maintenance API `sort_order` param. */
export function tableSortRulesToMaintenanceSortOrder(
  sortRules: TableSortRule[]
): SortOrder | undefined {
  const equipmentRule = sortRules.find(
    (rule) => rule.columnKey === MAINTENANCE_EQUIPMENT_SORT_COLUMN_KEY
  );
  if (!equipmentRule) return undefined;

  return equipmentRule.direction === "asc" ? SortOrder.ASC : SortOrder.DESC;
}

export function maintenanceSortOrderToTableSortRules(
  sortOrder?: SortOrder
): TableSortRule[] {
  if (sortOrder === SortOrder.ASC) {
    return [
      {
        columnKey: MAINTENANCE_EQUIPMENT_SORT_COLUMN_KEY,
        direction: "asc",
      },
    ];
  }
  if (sortOrder === SortOrder.DESC) {
    return [
      {
        columnKey: MAINTENANCE_EQUIPMENT_SORT_COLUMN_KEY,
        direction: "desc",
      },
    ];
  }
  return [];
}
