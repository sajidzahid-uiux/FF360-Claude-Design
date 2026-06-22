import type { TableFilterValue, TableSortRule } from './tableTypes';

export function applyTableSearch<T>(
  rows: T[],
  query: string,
  getSearchableText: (row: T) => string
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;
  return rows.filter((row) => getSearchableText(row).toLowerCase().includes(normalized));
}

export function applyTableFilters<T>(
  rows: T[],
  filterValues: TableFilterValue[],
  matchers: Record<string, (row: T, values: string[]) => boolean>
): T[] {
  const activeFilters = filterValues.filter((entry) => entry.values.length > 0);
  if (activeFilters.length === 0) return rows;

  return rows.filter((row) =>
    activeFilters.every((entry) => {
      const matcher = matchers[entry.filterId];
      return matcher ? matcher(row, entry.values) : true;
    })
  );
}

export function applyTableSort<T>(
  rows: T[],
  sortRules: TableSortRule[],
  getSortValue: (row: T, columnKey: string) => string | number
): T[] {
  if (sortRules.length === 0) return rows;

  return [...rows].sort((left, right) => {
    for (const rule of sortRules) {
      const leftValue = getSortValue(left, rule.columnKey);
      const rightValue = getSortValue(right, rule.columnKey);
      const comparison =
        typeof leftValue === 'number' && typeof rightValue === 'number'
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue), undefined, {
              sensitivity: 'base',
              numeric: true,
            });

      if (comparison !== 0) {
        return rule.direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
}

export function getTableFilterValue(
  filterValues: TableFilterValue[],
  filterId: string
): string[] {
  return filterValues.find((entry) => entry.filterId === filterId)?.values ?? [];
}

export function setTableFilterValue(
  filterValues: TableFilterValue[],
  filterId: string,
  values: string[]
): TableFilterValue[] {
  const without = filterValues.filter((entry) => entry.filterId !== filterId);
  if (values.length === 0) return without;
  return [...without, { filterId, values }];
}

export function toggleTableFilterOption(
  filterValues: TableFilterValue[],
  filterId: string,
  optionValue: string,
  multiple = true
): TableFilterValue[] {
  const current = getTableFilterValue(filterValues, filterId);
  if (!multiple) {
    const next = current.includes(optionValue) ? [] : [optionValue];
    return setTableFilterValue(filterValues, filterId, next);
  }

  const next = current.includes(optionValue)
    ? current.filter((value) => value !== optionValue)
    : [...current, optionValue];
  return setTableFilterValue(filterValues, filterId, next);
}

export function cycleTableColumnSort(
  sortRules: TableSortRule[],
  columnKey: string
): TableSortRule[] {
  const existing = sortRules.find((rule) => rule.columnKey === columnKey);
  if (!existing) {
    return [{ columnKey, direction: 'asc' }, ...sortRules];
  }
  if (existing.direction === 'asc') {
    return sortRules.map((rule) =>
      rule.columnKey === columnKey ? { ...rule, direction: 'desc' } : rule
    );
  }
  return sortRules.filter((rule) => rule.columnKey !== columnKey);
}

export function countActiveTableFilters(filterValues: TableFilterValue[]): number {
  return filterValues.reduce((count, entry) => count + entry.values.length, 0);
}

/** Clears all active table toolbar filters. */
export function clearTableFilters(): TableFilterValue[] {
  return [];
}

/** Clears all active table toolbar sort rules. */
export function clearTableSortRules(): TableSortRule[] {
  return [];
}
