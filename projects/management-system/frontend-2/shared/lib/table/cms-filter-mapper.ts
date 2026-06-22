import type { TableFilterValue } from "@fieldflow360/org-ui";

import type { FilterState } from "@/shared/ui/common/filter";

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

/**
 * Maps CMS `FilterState` entries to org-ui `TableFilterValue[]`.
 * Skips date-range objects and empty arrays.
 */
export function cmsFilterStateToTableFilterValues(
  filterState: FilterState,
  filterIdMap?: Record<string, string>
): TableFilterValue[] {
  const values: TableFilterValue[] = [];

  for (const [filterKey, rawValue] of Object.entries(filterState)) {
    if (!isStringArray(rawValue) || rawValue.length === 0) continue;

    values.push({
      filterId: filterIdMap?.[filterKey] ?? filterKey,
      values: rawValue,
    });
  }

  return values;
}

/** Maps org-ui filter values back to a CMS `FilterState` fragment. */
export function tableFilterValuesToCmsFilterState(
  filterValues: TableFilterValue[],
  filterIdMap?: Record<string, string>
): FilterState {
  const reverseMap = filterIdMap
    ? Object.fromEntries(
        Object.entries(filterIdMap).map(([cmsKey, tableId]) => [
          tableId,
          cmsKey,
        ])
      )
    : undefined;

  const state: FilterState = {};

  for (const entry of filterValues) {
    const cmsKey = reverseMap?.[entry.filterId] ?? entry.filterId;
    if (entry.values.length === 0) continue;
    state[cmsKey] = entry.values;
  }

  return state;
}
