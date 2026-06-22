"use client";

import { useCallback, useEffect, useMemo } from "react";

import {
  type BuildServerPaginationOptions,
  type SerializeTableServerQueryOptions,
  type TablePaginationConfig,
  type TableSearchConfig,
  type TableServerQuery,
} from "@fieldflow360/org-ui";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCmsTableQueryActions, useCmsTableQuerySlice } from "@/shared/model";

import type { CmsPaginationSource } from "./cms-pagination-types";
import { cmsTableQueryToApiParams } from "./cms-server-table-params";
import { CMS_DEFAULT_PAGE_SIZE } from "./constants";
import { mapCmsPaginationMeta } from "./map-cms-pagination-meta";

export interface UseCmsServerTableQueryOptions {
  /** Per-list key — use {@link createCmsTableStateKey}. */
  tableKey: string;
  pageSize?: number;
  searchDebounceMs?: number;
  onQueryChange: (query: TableServerQuery) => void;
  serializeOptions?: SerializeTableServerQueryOptions;
  /** When API reports fewer pages, clamp or reset current page. */
  totalPages?: number;
}

export interface BuildCmsTablePaginationOptions extends BuildServerPaginationOptions {
  /** Pagination block from API or query hook; when null, footer is omitted upstream. */
  source?: CmsPaginationSource;
}

export function useCmsServerTableQuery({
  tableKey,
  pageSize = CMS_DEFAULT_PAGE_SIZE,
  searchDebounceMs = 300,
  onQueryChange,
  serializeOptions,
  totalPages,
}: UseCmsServerTableQueryOptions) {
  const slice = useCmsTableQuerySlice(tableKey);
  const {
    setCurrentPage: setCurrentPageInStore,
    setSearch: setSearchInStore,
    setFilterValues: setFilterValuesInStore,
    setSortRules: setSortRulesInStore,
    resetPage: resetPageInStore,
  } = useCmsTableQueryActions();

  const { currentPage, search, filterValues, sortRules } = slice;

  const debouncedSearch = useDebouncedValue(search.trim(), searchDebounceMs);

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

  useEffect(() => {
    if (totalPages == null || totalPages <= 0) return;
    if (currentPage <= totalPages) return;
    resetPageInStore(tableKey);
  }, [currentPage, resetPageInStore, tableKey, totalPages]);

  const setCurrentPage = useCallback(
    (page: number) => {
      setCurrentPageInStore(tableKey, page);
    },
    [setCurrentPageInStore, tableKey]
  );

  const setSearch = useCallback(
    (value: string) => {
      setSearchInStore(tableKey, value);
    },
    [setSearchInStore, tableKey]
  );

  const setFilterValues = useCallback(
    (values: typeof filterValues) => {
      setFilterValuesInStore(tableKey, values);
    },
    [setFilterValuesInStore, tableKey]
  );

  const setSortRules = useCallback(
    (rules: typeof sortRules) => {
      setSortRulesInStore(tableKey, rules);
    },
    [setSortRulesInStore, tableKey]
  );

  const resetPage = useCallback(() => {
    resetPageInStore(tableKey);
  }, [resetPageInStore, tableKey]);

  const searchConfig: TableSearchConfig = useMemo(
    () => ({
      value: search,
      onChange: setSearch,
    }),
    [search, setSearch]
  );

  const buildPaginationConfig = useCallback(
    (
      meta: {
        totalCount: number;
        totalPages: number;
        currentPage?: number;
        pageSize?: number;
      },
      options?: BuildServerPaginationOptions
    ): TablePaginationConfig => ({
      currentPage: meta.currentPage ?? currentPage,
      totalPages: meta.totalPages,
      totalCount: meta.totalCount,
      pageSize: meta.pageSize ?? pageSize,
      itemLabel: options?.itemLabel ?? "items",
      isLoading: options?.isLoading,
      onPageChange: setCurrentPage,
    }),
    [currentPage, pageSize, setCurrentPage]
  );

  const toApiParams = useCallback(
    (nextQuery: TableServerQuery = query) =>
      cmsTableQueryToApiParams(nextQuery, serializeOptions),
    [query, serializeOptions]
  );

  const buildPagination = useCallback(
    ({ source, itemLabel, isLoading }: BuildCmsTablePaginationOptions = {}):
      | TablePaginationConfig
      | undefined => {
      const meta = mapCmsPaginationMeta(source);
      if (!meta) return undefined;

      return buildPaginationConfig(meta, { itemLabel, isLoading });
    },
    [buildPaginationConfig]
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
    toApiParams,
    buildPagination,
    serializeQuery: toApiParams,
  };
}
