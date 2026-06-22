"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface MessagesPageStore {
  tab: string;
  selectedId: number | null;
  selectedDirectMemberId: number | null;
  addGroupOpen: boolean;
  page: number;
  hasMore: boolean;
  setTab: (tab: string) => void;
  setSelectedId: (id: number | null) => void;
  setSelectedDirectMemberId: (id: number | null) => void;
  setAddGroupOpen: (open: boolean) => void;
  setPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  resetPagination: () => void;
}

export const useMessagesPageStore = create<MessagesPageStore>((set) => ({
  tab: "groups",
  selectedId: null,
  selectedDirectMemberId: null,
  addGroupOpen: false,
  page: 1,
  hasMore: true,

  setTab: (tab) => {
    set({ tab });
  },

  setSelectedId: (selectedId) => {
    set({ selectedId });
  },

  setSelectedDirectMemberId: (selectedDirectMemberId) => {
    set({ selectedDirectMemberId });
  },

  setAddGroupOpen: (addGroupOpen) => {
    set({ addGroupOpen });
  },

  setPage: (page) => {
    set({ page });
  },

  setHasMore: (hasMore) => {
    set({ hasMore });
  },

  resetPagination: () => {
    set({ page: 1, hasMore: true });
  },
}));

export function useMessagesPageUi() {
  return useMessagesPageStore(
    useShallow((state) => ({
      tab: state.tab,
      selectedId: state.selectedId,
      selectedDirectMemberId: state.selectedDirectMemberId,
      addGroupOpen: state.addGroupOpen,
      page: state.page,
      hasMore: state.hasMore,
      setTab: state.setTab,
      setSelectedId: state.setSelectedId,
      setSelectedDirectMemberId: state.setSelectedDirectMemberId,
      setAddGroupOpen: state.setAddGroupOpen,
      setPage: state.setPage,
      setHasMore: state.setHasMore,
      resetPagination: state.resetPagination,
    }))
  );
}
