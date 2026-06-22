"use client";

import { useMemo } from "react";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { SortOrder } from "@/api/types";
import { LeadType, ViewMode } from "@/constants";
import type { JobLeadArchiveTab, NotKanbanView } from "@/constants";
import type { FilterState } from "@/shared/ui/common";

export type LeadsPageTab = JobLeadArchiveTab;

export interface LeadPageState {
  currentTab: LeadsPageTab;
  searchTerm: string;
  filters: FilterState;
  currentPage: number;
  sortBy?: string;
  sortOrder: SortOrder | null;
  selectedIds: (string | number)[];
  view: NotKanbanView;
}

interface LeadsPageStore {
  pages: Record<LeadType, LeadPageState>;
  setCurrentTab: (leadType: LeadType, currentTab: LeadsPageTab) => void;
  setSearchTerm: (leadType: LeadType, searchTerm: string) => void;
  setFilters: (leadType: LeadType, filters: FilterState) => void;
  setCurrentPage: (leadType: LeadType, currentPage: number) => void;
  setSort: (
    leadType: LeadType,
    sortBy: string | undefined,
    sortOrder: SortOrder | null
  ) => void;
  setSelectedIds: (
    leadType: LeadType,
    selectedIds: (string | number)[]
  ) => void;
  setView: (leadType: LeadType, view: NotKanbanView) => void;
  resetPage: (leadType: LeadType) => void;
  resetPageState: (leadType: LeadType) => void;
}

const DEFAULT_LEAD_PAGE_STATE: LeadPageState = {
  currentTab: "active",
  searchTerm: "",
  filters: {},
  currentPage: 1,
  sortBy: undefined,
  sortOrder: null,
  selectedIds: [],
  view: ViewMode.LIST,
};

function resolvePage(
  pages: Record<LeadType, LeadPageState>,
  leadType: LeadType
): LeadPageState {
  return pages[leadType] ?? DEFAULT_LEAD_PAGE_STATE;
}

function patchPage(
  pages: Record<LeadType, LeadPageState>,
  leadType: LeadType,
  patch: Partial<LeadPageState>
): Record<LeadType, LeadPageState> {
  return {
    ...pages,
    [leadType]: {
      ...resolvePage(pages, leadType),
      ...patch,
    },
  };
}

export const useLeadsPageStore = create<LeadsPageStore>((set) => ({
  pages: {
    [LeadType.TILING]: { ...DEFAULT_LEAD_PAGE_STATE },
    [LeadType.EXCAVATION]: { ...DEFAULT_LEAD_PAGE_STATE },
    [LeadType.REPAIR]: { ...DEFAULT_LEAD_PAGE_STATE },
  },

  setCurrentTab: (leadType, currentTab) => {
    set((state) => ({
      pages: patchPage(state.pages, leadType, {
        currentTab,
        currentPage: 1,
      }),
    }));
  },

  setSearchTerm: (leadType, searchTerm) => {
    set((state) => ({
      pages: patchPage(state.pages, leadType, {
        searchTerm,
        currentPage: 1,
      }),
    }));
  },

  setFilters: (leadType, filters) => {
    set((state) => ({
      pages: patchPage(state.pages, leadType, {
        filters,
        currentPage: 1,
      }),
    }));
  },

  setCurrentPage: (leadType, currentPage) => {
    set((state) => ({
      pages: patchPage(state.pages, leadType, { currentPage }),
    }));
  },

  setSort: (leadType, sortBy, sortOrder) => {
    set((state) => ({
      pages: patchPage(state.pages, leadType, {
        sortBy,
        sortOrder,
        currentPage: 1,
      }),
    }));
  },

  setSelectedIds: (leadType, selectedIds) => {
    set((state) => ({
      pages: patchPage(state.pages, leadType, { selectedIds }),
    }));
  },

  setView: (leadType, view) => {
    set((state) => ({
      pages: patchPage(state.pages, leadType, { view }),
    }));
  },

  resetPage: (leadType) => {
    set((state) => ({
      pages: patchPage(state.pages, leadType, { currentPage: 1 }),
    }));
  },

  resetPageState: (leadType) => {
    set((state) => ({
      pages: patchPage(state.pages, leadType, DEFAULT_LEAD_PAGE_STATE),
    }));
  },
}));

export function useLeadPageState(leadType: LeadType) {
  const page = useLeadsPageStore(
    useShallow((state) => resolvePage(state.pages, leadType))
  );

  return useMemo(
    () => ({
      ...page,
      setCurrentTab: (currentTab: LeadsPageTab) =>
        useLeadsPageStore.getState().setCurrentTab(leadType, currentTab),
      setSearchTerm: (searchTerm: string) =>
        useLeadsPageStore.getState().setSearchTerm(leadType, searchTerm),
      setFilters: (filters: FilterState) =>
        useLeadsPageStore.getState().setFilters(leadType, filters),
      setCurrentPage: (currentPage: number) =>
        useLeadsPageStore.getState().setCurrentPage(leadType, currentPage),
      setSort: (sortBy: string | undefined, sortOrder: SortOrder | null) =>
        useLeadsPageStore.getState().setSort(leadType, sortBy, sortOrder),
      setSelectedIds: (selectedIds: (string | number)[]) =>
        useLeadsPageStore.getState().setSelectedIds(leadType, selectedIds),
      setView: (view: NotKanbanView) =>
        useLeadsPageStore.getState().setView(leadType, view),
      resetPage: () => useLeadsPageStore.getState().resetPage(leadType),
      resetPageState: () =>
        useLeadsPageStore.getState().resetPageState(leadType),
    }),
    [page, leadType]
  );
}
