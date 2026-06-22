"use client";

import type { TableFilterValue, TableSortRule } from "@fieldflow360/org-ui";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export interface CmsTableQuerySlice {
  currentPage: number;
  search: string;
  filterValues: TableFilterValue[];
  sortRules: TableSortRule[];
}

export const CMS_TABLE_QUERY_DEFAULT_SLICE: CmsTableQuerySlice = {
  currentPage: 1,
  search: "",
  filterValues: [],
  sortRules: [],
};

function resolveSlice(
  slices: Record<string, CmsTableQuerySlice>,
  tableKey: string
): CmsTableQuerySlice {
  return slices[tableKey] ?? CMS_TABLE_QUERY_DEFAULT_SLICE;
}

interface CmsTableQueryStore {
  slices: Record<string, CmsTableQuerySlice>;
  getSlice: (tableKey: string) => CmsTableQuerySlice;
  setCurrentPage: (tableKey: string, currentPage: number) => void;
  setSearch: (tableKey: string, search: string) => void;
  setFilterValues: (tableKey: string, filterValues: TableFilterValue[]) => void;
  setSortRules: (tableKey: string, sortRules: TableSortRule[]) => void;
  resetPage: (tableKey: string) => void;
  resetSlice: (tableKey: string) => void;
}

export const useCmsTableQueryStore = create<CmsTableQueryStore>((set, get) => ({
  slices: {},

  getSlice: (tableKey) => resolveSlice(get().slices, tableKey),

  setCurrentPage: (tableKey, currentPage) => {
    set((state) => ({
      slices: {
        ...state.slices,
        [tableKey]: {
          ...resolveSlice(state.slices, tableKey),
          currentPage,
        },
      },
    }));
  },

  setSearch: (tableKey, search) => {
    set((state) => ({
      slices: {
        ...state.slices,
        [tableKey]: {
          ...resolveSlice(state.slices, tableKey),
          search,
          currentPage: 1,
        },
      },
    }));
  },

  setFilterValues: (tableKey, filterValues) => {
    set((state) => ({
      slices: {
        ...state.slices,
        [tableKey]: {
          ...resolveSlice(state.slices, tableKey),
          filterValues,
          currentPage: 1,
        },
      },
    }));
  },

  setSortRules: (tableKey, sortRules) => {
    set((state) => ({
      slices: {
        ...state.slices,
        [tableKey]: {
          ...resolveSlice(state.slices, tableKey),
          sortRules,
          currentPage: 1,
        },
      },
    }));
  },

  resetPage: (tableKey) => {
    get().setCurrentPage(tableKey, 1);
  },

  resetSlice: (tableKey) => {
    set((state) => ({
      slices: {
        ...state.slices,
        [tableKey]: { ...CMS_TABLE_QUERY_DEFAULT_SLICE },
      },
    }));
  },
}));

export function useCmsTableQuerySlice(tableKey: string) {
  return useCmsTableQueryStore(
    (state) => state.slices[tableKey] ?? CMS_TABLE_QUERY_DEFAULT_SLICE
  );
}

export function useCmsTableQueryActions() {
  return useCmsTableQueryStore(
    useShallow((state) => ({
      setCurrentPage: state.setCurrentPage,
      setSearch: state.setSearch,
      setFilterValues: state.setFilterValues,
      setSortRules: state.setSortRules,
      resetPage: state.resetPage,
      resetSlice: state.resetSlice,
    }))
  );
}
