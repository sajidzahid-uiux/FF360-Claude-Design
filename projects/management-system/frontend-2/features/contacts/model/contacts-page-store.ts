"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { ContactPageTab } from "@/features/contacts";

type AddContactMode = null | "standard" | "farm_management";

interface ContactsPageStore {
  tab: ContactPageTab;
  addMode: AddContactMode;
  showAddContact: boolean;
  expandedParentIds: Set<number>;
  selectedContactIds: number[];
  setTab: (tab: ContactPageTab) => void;
  setAddMode: (mode: AddContactMode) => void;
  setShowAddContact: (show: boolean) => void;
  toggleExpandedParentId: (id: number) => void;
  setExpandedParentIds: (ids: Set<number>) => void;
  setSelectedContactIds: (ids: number[]) => void;
  clearSelectedContactIds: () => void;
}

export const useContactsPageStore = create<ContactsPageStore>((set, get) => ({
  tab: "Contacts",
  addMode: null,
  showAddContact: false,
  expandedParentIds: new Set<number>(),
  selectedContactIds: [],

  setTab: (tab) => {
    set({ tab });
  },

  setAddMode: (addMode) => {
    set({ addMode });
  },

  setShowAddContact: (showAddContact) => {
    set({ showAddContact });
  },

  toggleExpandedParentId: (id) => {
    const next = new Set(get().expandedParentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ expandedParentIds: next });
  },

  setExpandedParentIds: (expandedParentIds) => {
    set({ expandedParentIds });
  },

  setSelectedContactIds: (selectedContactIds) => {
    set({ selectedContactIds });
  },

  clearSelectedContactIds: () => {
    set({ selectedContactIds: [] });
  },
}));

export function useContactsPageUi() {
  return useContactsPageStore(
    useShallow((state) => ({
      tab: state.tab,
      addMode: state.addMode,
      showAddContact: state.showAddContact,
      expandedParentIds: state.expandedParentIds,
      selectedContactIds: state.selectedContactIds,
      setTab: state.setTab,
      setAddMode: state.setAddMode,
      setShowAddContact: state.setShowAddContact,
      toggleExpandedParentId: state.toggleExpandedParentId,
      setExpandedParentIds: state.setExpandedParentIds,
      setSelectedContactIds: state.setSelectedContactIds,
      clearSelectedContactIds: state.clearSelectedContactIds,
    }))
  );
}
