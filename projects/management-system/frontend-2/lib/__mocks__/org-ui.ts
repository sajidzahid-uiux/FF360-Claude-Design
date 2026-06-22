import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Mirrors org-ui — kept local to avoid vitest alias circular import via theme-enums. */
export enum ThemeModeEnum {
  LIGHT = "light",
  DARK = "dark",
  NIGHT = "night",
  SYSTEM = "system",
}

export type ThemeMode = ThemeModeEnum;

export type ResolvedThemeMode =
  | ThemeModeEnum.LIGHT
  | ThemeModeEnum.DARK
  | ThemeModeEnum.NIGHT;

export type ThemeTransitionOptions = {
  origin?: { clientX: number; clientY: number };
};

export enum ComponentSizeEnum {
  SM = "sm",
  MD = "md",
  LG = "lg",
}

export type ComponentSize = ComponentSizeEnum;

export enum TabsSwitcherViewEnum {
  PILL = "pill",
  UNDERLINED = "underlined",
}

export type TabsSwitcherView = TabsSwitcherViewEnum;

export function Loader({
  text,
}: {
  text?: string;
  size?: ComponentSizeEnum;
  centerInContainer?: boolean;
}) {
  return text ?? null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useTheme() {
  return {
    mode: ThemeModeEnum.LIGHT,
    resolvedMode: ThemeModeEnum.LIGHT,
    accentColor: "#14b8a6",
    setMode: () => undefined,
    toggleMode: () => undefined,
    setAccentColor: () => undefined,
    theme: {},
  };
}

export interface TableFilterValue {
  filterId: string;
  values: string[];
}

export interface TableSortRule {
  columnKey: string;
  direction: "asc" | "desc";
}

export interface TableServerQuery {
  page: number;
  pageSize: number;
  search: string;
  filterValues: TableFilterValue[];
  sortRules: TableSortRule[];
}

export interface TableServerPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

export interface BuildServerPaginationOptions {
  itemLabel?: string;
  isLoading?: boolean;
}

export interface TableSearchConfig {
  value: string;
  onChange: (value: string) => void;
}

export interface TablePaginationConfig {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
  itemLabel?: string;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export interface SerializeTableServerQueryOptions {
  paramNames?: {
    page?: string;
    pageSize?: string;
    search?: string;
    ordering?: string;
  };
  filterParamMap?: Record<string, string>;
}

export function serializeTableServerQuery(
  query: TableServerQuery,
  options: SerializeTableServerQueryOptions = {}
): Record<string, string | number | string[]> {
  const {
    page: pageKey = "page",
    pageSize: pageSizeKey = "page_size",
    search: searchKey = "search",
    ordering: orderingKey = "ordering",
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
    params[orderingKey] = query.sortRules.map((rule) =>
      rule.direction === "desc" ? `-${rule.columnKey}` : rule.columnKey
    );
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

export function useServerTableQuery({
  pageSize = 10,
  onQueryChange,
  searchDebounceMs = 0,
  initialPage = 1,
  initialSearch = "",
  initialFilterValues = [],
  initialSortRules = [],
}: {
  pageSize?: number;
  onQueryChange: (query: TableServerQuery) => void;
  searchDebounceMs?: number;
  initialPage?: number;
  initialSearch?: string;
  initialFilterValues?: TableFilterValue[];
  initialSortRules?: TableSortRule[];
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [search, setSearchState] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch.trim());
  const [filterValues, setFilterValuesState] =
    useState<TableFilterValue[]>(initialFilterValues);
  const [sortRules, setSortRulesState] =
    useState<TableSortRule[]>(initialSortRules);

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

  const buildPaginationConfig = useCallback(
    (
      meta: Pick<TableServerPaginationMeta, "totalCount" | "totalPages"> &
        Partial<Pick<TableServerPaginationMeta, "currentPage" | "pageSize">>,
      options?: { itemLabel?: string; isLoading?: boolean }
    ): TablePaginationConfig => ({
      currentPage: meta.currentPage ?? currentPage,
      totalPages: meta.totalPages,
      totalCount: meta.totalCount,
      pageSize: meta.pageSize ?? pageSize,
      itemLabel: options?.itemLabel ?? "items",
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
    searchConfig: { value: search, onChange: setSearch },
    setSearch,
    setFilterValues,
    setSortRules,
    setCurrentPage,
    resetPage,
    buildPaginationConfig,
  };
}
