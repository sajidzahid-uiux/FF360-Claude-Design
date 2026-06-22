"use client";

import { useMemo } from "react";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { SortOrder } from "@/api/types";
import {
  type JobLeadArchiveTab,
  JobType,
  ViewMode,
  type ViewMode as ViewModeType,
  isJobLeadArchiveTab,
} from "@/constants";
import type { FilterState } from "@/shared/ui/common";

export type JobsPageTab = JobLeadArchiveTab | "on_hold";

export function isJobsPageTab(value: string): value is JobsPageTab {
  return isJobLeadArchiveTab(value) || value === "on_hold";
}

export interface JobPageState {
  currentTab: JobsPageTab;
  searchTerm: string;
  filters: FilterState;
  currentPage: number;
  sortBy?: string;
  sortOrder: SortOrder | null;
  selectedIds: (string | number)[];
  view: ViewModeType;
}

interface JobsPageStore {
  pages: Record<JobType, JobPageState>;
  setCurrentTab: (jobType: JobType, currentTab: JobsPageTab) => void;
  setSearchTerm: (jobType: JobType, searchTerm: string) => void;
  setFilters: (jobType: JobType, filters: FilterState) => void;
  setCurrentPage: (jobType: JobType, currentPage: number) => void;
  setSort: (
    jobType: JobType,
    sortBy: string | undefined,
    sortOrder: SortOrder | null
  ) => void;
  setSelectedIds: (jobType: JobType, selectedIds: (string | number)[]) => void;
  setView: (jobType: JobType, view: ViewModeType) => void;
  resetPage: (jobType: JobType) => void;
  resetPageState: (jobType: JobType) => void;
}

const DEFAULT_JOB_PAGE_STATE: JobPageState = {
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
  pages: Record<JobType, JobPageState>,
  jobType: JobType
): JobPageState {
  return pages[jobType] ?? DEFAULT_JOB_PAGE_STATE;
}

function patchPage(
  pages: Record<JobType, JobPageState>,
  jobType: JobType,
  patch: Partial<JobPageState>
): Record<JobType, JobPageState> {
  return {
    ...pages,
    [jobType]: {
      ...resolvePage(pages, jobType),
      ...patch,
    },
  };
}

export const useJobsPageStore = create<JobsPageStore>((set) => ({
  pages: {
    [JobType.TILING]: { ...DEFAULT_JOB_PAGE_STATE },
    [JobType.EXCAVATION]: { ...DEFAULT_JOB_PAGE_STATE },
    [JobType.REPAIR]: { ...DEFAULT_JOB_PAGE_STATE },
  },

  setCurrentTab: (jobType, currentTab) => {
    set((state) => ({
      pages: patchPage(state.pages, jobType, {
        currentTab,
        currentPage: 1,
      }),
    }));
  },

  setSearchTerm: (jobType, searchTerm) => {
    set((state) => ({
      pages: patchPage(state.pages, jobType, {
        searchTerm,
        currentPage: 1,
      }),
    }));
  },

  setFilters: (jobType, filters) => {
    set((state) => ({
      pages: patchPage(state.pages, jobType, {
        filters,
        currentPage: 1,
      }),
    }));
  },

  setCurrentPage: (jobType, currentPage) => {
    set((state) => ({
      pages: patchPage(state.pages, jobType, { currentPage }),
    }));
  },

  setSort: (jobType, sortBy, sortOrder) => {
    set((state) => ({
      pages: patchPage(state.pages, jobType, {
        sortBy,
        sortOrder,
        currentPage: 1,
      }),
    }));
  },

  setSelectedIds: (jobType, selectedIds) => {
    set((state) => ({
      pages: patchPage(state.pages, jobType, { selectedIds }),
    }));
  },

  setView: (jobType, view) => {
    set((state) => ({
      pages: patchPage(state.pages, jobType, { view }),
    }));
  },

  resetPage: (jobType) => {
    set((state) => ({
      pages: patchPage(state.pages, jobType, { currentPage: 1 }),
    }));
  },

  resetPageState: (jobType) => {
    set((state) => ({
      pages: patchPage(state.pages, jobType, DEFAULT_JOB_PAGE_STATE),
    }));
  },
}));

export function useJobPageState(jobType: JobType) {
  const page = useJobsPageStore(
    useShallow((state) => resolvePage(state.pages, jobType))
  );

  return useMemo(
    () => ({
      ...page,
      setCurrentTab: (currentTab: JobsPageTab) =>
        useJobsPageStore.getState().setCurrentTab(jobType, currentTab),
      setSearchTerm: (searchTerm: string) =>
        useJobsPageStore.getState().setSearchTerm(jobType, searchTerm),
      setFilters: (filters: FilterState) =>
        useJobsPageStore.getState().setFilters(jobType, filters),
      setCurrentPage: (currentPage: number) =>
        useJobsPageStore.getState().setCurrentPage(jobType, currentPage),
      setSort: (sortBy: string | undefined, sortOrder: SortOrder | null) =>
        useJobsPageStore.getState().setSort(jobType, sortBy, sortOrder),
      setSelectedIds: (selectedIds: (string | number)[]) =>
        useJobsPageStore.getState().setSelectedIds(jobType, selectedIds),
      setView: (view: ViewModeType) =>
        useJobsPageStore.getState().setView(jobType, view),
      resetPage: () => useJobsPageStore.getState().resetPage(jobType),
      resetPageState: () => useJobsPageStore.getState().resetPageState(jobType),
    }),
    [page, jobType]
  );
}
