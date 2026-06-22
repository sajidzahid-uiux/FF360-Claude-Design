"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { TrashItem } from "@/features/org-trash/lib/columns";
import type { FilterState } from "@/shared/ui/common";

interface OrgTrashPageStore {
  filters: FilterState;
  selectedIds: (string | number)[];
  card: TrashItem | undefined;
  setFilters: (filters: FilterState) => void;
  setSelectedIds: (selectedIds: (string | number)[]) => void;
  setCard: (card: TrashItem | undefined) => void;
  closeCard: () => void;
  resetSelection: () => void;
}

export const useOrgTrashPageStore = create<OrgTrashPageStore>((set) => ({
  filters: {},
  selectedIds: [],
  card: undefined,

  setFilters: (filters) => {
    set({ filters, selectedIds: [] });
  },

  setSelectedIds: (selectedIds) => {
    set({ selectedIds });
  },

  setCard: (card) => {
    set({ card });
  },

  closeCard: () => {
    set({ card: undefined });
  },

  resetSelection: () => {
    set({ selectedIds: [] });
  },
}));

export function useOrgTrashPageUi() {
  return useOrgTrashPageStore(
    useShallow((state) => ({
      filters: state.filters,
      selectedIds: state.selectedIds,
      card: state.card,
      setFilters: state.setFilters,
      setSelectedIds: state.setSelectedIds,
      setCard: state.setCard,
      closeCard: state.closeCard,
      resetSelection: state.resetSelection,
    }))
  );
}
