import type { TableFilterValue, TableSortRule } from './tableTypes';

/**
 * How the table list is loaded.
 * - `client`: parent may slice/filter/sort locally (e.g. tile design).
 * - `server`: parent fetches `data` for the current page; totals come from the API.
 */
export const TableDataModeEnum = {
  CLIENT: 'client',
  SERVER: 'server',
} as const;

export type TableDataMode =
  (typeof TableDataModeEnum)[keyof typeof TableDataModeEnum];

/** Snapshot passed to fetchers when toolbar or pagination changes. */
export interface TableServerQuery {
  page: number;
  pageSize: number;
  search: string;
  filterValues: TableFilterValue[];
  sortRules: TableSortRule[];
}

/** Pagination totals returned by the backend (current slice is passed as `data`). */
export interface TableServerPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

export interface TableServerQueryParamNames {
  page?: string;
  pageSize?: string;
  search?: string;
  ordering?: string;
}

export interface SerializeTableServerQueryOptions {
  paramNames?: TableServerQueryParamNames;
  /**
   * Maps filter ids to API query param names.
   * Values are sent as-is (string or string[] when multiple values).
   */
  filterParamMap?: Record<string, string>;
}
