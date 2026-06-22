import type { TableSortRule } from './tableTypes';
import type {
  SerializeTableServerQueryOptions,
  TableServerQuery,
} from './tableServerTypes';

export function formatTableSortOrderingParam(rule: TableSortRule): string {
  return rule.direction === 'desc' ? `-${rule.columnKey}` : rule.columnKey;
}

/**
 * Converts table query state into common REST query params (`page`, `page_size`, `search`, `ordering`, filters).
 */
export function serializeTableServerQuery(
  query: TableServerQuery,
  options: SerializeTableServerQueryOptions = {}
): Record<string, string | number | string[]> {
  const {
    page: pageKey = 'page',
    pageSize: pageSizeKey = 'page_size',
    search: searchKey = 'search',
    ordering: orderingKey = 'ordering',
  } = options.paramNames ?? {};

  const params: Record<string, string | number | string[]> = {
    [pageKey]: query.page,
    [pageSizeKey]: query.pageSize,
  };

  const trimmedSearch = query.search.trim();
  if (trimmedSearch) {
    params[searchKey] = trimmedSearch;
  }

  if (query.sortRules.length > 0) {
    params[orderingKey] = query.sortRules.map(formatTableSortOrderingParam);
  }

  const filterParamMap = options.filterParamMap ?? {};
  for (const entry of query.filterValues) {
    if (entry.values.length === 0) continue;
    const paramName = filterParamMap[entry.filterId] ?? entry.filterId;
    params[paramName] =
      entry.values.length === 1 ? entry.values[0] : [...entry.values];
  }

  return params;
}
