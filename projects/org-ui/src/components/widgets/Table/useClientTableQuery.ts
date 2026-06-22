'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_TABLE_PAGE_SIZE } from './tableConstants';
import type { TablePaginationConfig } from './TablePagination';
import type { TableSortableColumn } from './TableToolbar';
import type {
  TableFilterDefinition,
  TableFilterValue,
  TableSearchConfig,
  TableSortRule,
} from './tableTypes';

export interface ClientTableQueryState {
  search: string;
  filterValues: TableFilterValue[];
  sortRules: TableSortRule[];
}

export interface UseClientTableQueryOptions<T> {
  rows: T[];
  pageSize?: number;
  itemLabel?: string;
  searchDebounceMs?: number;
  initialPage?: number;
  initialSearch?: string;
  initialFilterValues?: TableFilterValue[];
  initialSortRules?: TableSortRule[];
  processRows?: (rows: T[], query: ClientTableQueryState) => T[];
}

export interface ClientTableToolbarDefinition {
  searchPlaceholder: string;
  filters?: TableFilterDefinition[];
  sortableColumns?: TableSortableColumn[];
  hideToolbar?: boolean;
}

export interface ClientTableListControls {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchPlaceholder: string;
  filters?: TableFilterDefinition[];
  filterValues: TableFilterValue[];
  onFilterValuesChange: (values: TableFilterValue[]) => void;
  sortRules: TableSortRule[];
  onSortRulesChange: (rules: TableSortRule[]) => void;
  sortableColumns?: TableSortableColumn[];
  hideToolbar?: boolean;
}

export interface ClientTableController<T> {
  currentPage: number;
  pageRows: T[];
  processedRows: T[];
  pagination: TablePaginationConfig;
  sortRules: TableSortRule[];
  onSortRulesChange: (rules: TableSortRule[]) => void;
  buildListControls: (
    definition: ClientTableToolbarDefinition
  ) => ClientTableListControls | undefined;
  search: string;
  debouncedSearch: string;
  filterValues: TableFilterValue[];
  searchConfig: TableSearchConfig;
  setSearch: (value: string) => void;
  setFilterValues: (values: TableFilterValue[]) => void;
  setCurrentPage: (page: number) => void;
  resetPage: () => void;
}

export function useClientTableQuery<T>({
  rows,
  pageSize = DEFAULT_TABLE_PAGE_SIZE,
  itemLabel = 'items',
  searchDebounceMs = 0,
  initialPage = 1,
  initialSearch = '',
  initialFilterValues = [],
  initialSortRules = [],
  processRows,
}: UseClientTableQueryOptions<T>): ClientTableController<T> {
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

  const queryState = useMemo(
    (): ClientTableQueryState => ({
      search: debouncedSearch,
      filterValues,
      sortRules,
    }),
    [debouncedSearch, filterValues, sortRules]
  );

  const processedRows = useMemo(() => {
    if (processRows) {
      return processRows(rows, queryState);
    }
    return rows;
  }, [rows, processRows, queryState]);

  const totalCount = processedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const pageRows = useMemo(
    () => processedRows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [processedRows, safePage, pageSize]
  );

  const pagination = useMemo(
    (): TablePaginationConfig => ({
      currentPage: safePage,
      totalPages,
      totalCount,
      pageSize,
      itemLabel,
      onPageChange: setCurrentPage,
    }),
    [itemLabel, pageSize, safePage, totalCount, totalPages]
  );

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

  const searchConfig = useMemo(
    (): TableSearchConfig => ({
      value: search,
      onChange: setSearch,
    }),
    [search, setSearch]
  );

  const buildListControls = useCallback(
    (
      definition: ClientTableToolbarDefinition
    ): ClientTableListControls | undefined => {
      if (definition.hideToolbar) {
        return undefined;
      }

      return {
        searchQuery: search,
        onSearchQueryChange: setSearch,
        searchPlaceholder: definition.searchPlaceholder,
        filters: definition.filters,
        filterValues,
        onFilterValuesChange: setFilterValues,
        sortRules,
        onSortRulesChange: setSortRules,
        sortableColumns: definition.sortableColumns,
      };
    },
    [filterValues, search, setFilterValues, setSearch, setSortRules, sortRules]
  );

  return {
    currentPage,
    pageRows,
    processedRows,
    pagination,
    sortRules,
    onSortRulesChange: setSortRules,
    buildListControls,
    search,
    debouncedSearch,
    filterValues,
    searchConfig,
    setSearch,
    setFilterValues,
    setCurrentPage,
    resetPage,
  };
}
