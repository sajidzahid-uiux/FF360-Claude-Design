'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_TABLE_PAGE_SIZE } from './tableConstants';
import type { TablePaginationConfig } from './TablePagination';
import type { TableFilterValue, TableSearchConfig, TableSortRule } from './tableTypes';
import type { TableServerPaginationMeta, TableServerQuery } from './tableServerTypes';

export interface UseServerTableQueryOptions {
  /** Rows per page sent to the API. Default {@link DEFAULT_TABLE_PAGE_SIZE}. */
  pageSize?: number;
  /** Invoked when page, debounced search, filters, or sort change. */
  onQueryChange: (query: TableServerQuery) => void;
  /** Debounce delay for search before `onQueryChange`. Default 300ms. Use 0 to disable. */
  searchDebounceMs?: number;
  initialPage?: number;
  initialSearch?: string;
  initialFilterValues?: TableFilterValue[];
  initialSortRules?: TableSortRule[];
}

export interface BuildServerPaginationOptions {
  itemLabel?: string;
  isLoading?: boolean;
}

export function useServerTableQuery({
  pageSize = DEFAULT_TABLE_PAGE_SIZE,
  onQueryChange,
  searchDebounceMs = 300,
  initialPage = 1,
  initialSearch = '',
  initialFilterValues = [],
  initialSortRules = [],
}: UseServerTableQueryOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [search, setSearchState] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch.trim());
  const [filterValues, setFilterValuesState] =
    useState<TableFilterValue[]>(initialFilterValues);
  const [sortRules, setSortRulesState] = useState<TableSortRule[]>(initialSortRules);

  useEffect(() => {
    if (searchDebounceMs <= 0) {
      setDebouncedSearch(search.trim());
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, searchDebounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search, searchDebounceMs]);

  const query = useMemo(
    (): TableServerQuery => ({
      page: currentPage,
      pageSize,
      search: debouncedSearch,
      filterValues,
      sortRules,
    }),
    [currentPage, pageSize, debouncedSearch, filterValues, sortRules]
  );

  useEffect(() => {
    onQueryChange(query);
  }, [onQueryChange, query]);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setCurrentPage(1);
  }, []);

  const setFilterValues = useCallback((values: TableFilterValue[]) => {
    setFilterValuesState(values);
    setCurrentPage(1);
  }, []);

  const setSortRules = useCallback((rules: TableSortRule[]) => {
    setSortRulesState(rules);
    setCurrentPage(1);
  }, []);

  const searchConfig: TableSearchConfig = useMemo(
    () => ({
      value: search,
      onChange: setSearch,
    }),
    [search, setSearch]
  );

  const buildPaginationConfig = useCallback(
    (
      meta: Pick<TableServerPaginationMeta, 'totalCount' | 'totalPages'> &
        Partial<Pick<TableServerPaginationMeta, 'currentPage' | 'pageSize'>>,
      options?: BuildServerPaginationOptions
    ): TablePaginationConfig => ({
      currentPage: meta.currentPage ?? currentPage,
      totalPages: meta.totalPages,
      totalCount: meta.totalCount,
      pageSize: meta.pageSize ?? pageSize,
      itemLabel: options?.itemLabel ?? 'items',
      isLoading: options?.isLoading,
      onPageChange: setCurrentPage,
    }),
    [currentPage, pageSize]
  );

  return {
    query,
    currentPage,
    pageSize,
    search,
    debouncedSearch,
    filterValues,
    sortRules,
    searchConfig,
    setSearch,
    setFilterValues,
    setSortRules,
    setCurrentPage,
    resetPage,
    buildPaginationConfig,
  };
}
