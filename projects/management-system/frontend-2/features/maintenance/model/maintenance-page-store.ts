"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface MaintenancePageStore {
  selectedIds: (string | number)[];
  showDetailsId: number | null;
  setSelectedIds: (ids: (string | number)[]) => void;
  setShowDetailsId: (id: number | null) => void;
  clearSelection: () => void;
}

export const useMaintenancePageStore = create<MaintenancePageStore>((set) => ({
  selectedIds: [],
  showDetailsId: null,

  setSelectedIds: (selectedIds) => {
    set({ selectedIds });
  },

  setShowDetailsId: (showDetailsId) => {
    set({ showDetailsId });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },
}));

export function useMaintenancePageUi() {
  return useMaintenancePageStore(
    useShallow((state) => ({
      selectedIds: state.selectedIds,
      showDetailsId: state.showDetailsId,
      setSelectedIds: state.setSelectedIds,
      setShowDetailsId: state.setShowDetailsId,
      clearSelection: state.clearSelection,
    }))
  );
}
