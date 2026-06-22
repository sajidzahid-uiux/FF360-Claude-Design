"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export type CompletedPageTab = "active" | "archived";

interface CompletedPageStore {
  currentTab: CompletedPageTab;
  selectedIds: (string | number)[];
  setCurrentTab: (tab: CompletedPageTab) => void;
  setSelectedIds: (ids: (string | number)[]) => void;
  clearSelection: () => void;
}

export const useCompletedPageStore = create<CompletedPageStore>((set) => ({
  currentTab: "active",
  selectedIds: [],

  setCurrentTab: (currentTab) => {
    set({ currentTab, selectedIds: [] });
  },

  setSelectedIds: (selectedIds) => {
    set({ selectedIds });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },
}));

export function useCompletedPageUi() {
  return useCompletedPageStore(
    useShallow((state) => ({
      currentTab: state.currentTab,
      selectedIds: state.selectedIds,
      setCurrentTab: state.setCurrentTab,
      setSelectedIds: state.setSelectedIds,
      clearSelection: state.clearSelection,
    }))
  );
}
