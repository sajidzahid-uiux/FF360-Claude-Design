"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface OnlineMembersStore {
  onlineMembers: number[];
  setOnlineMembers: (members: number[]) => void;
  reset: () => void;
}

export const useOnlineMembersStore = create<OnlineMembersStore>((set) => ({
  onlineMembers: [],
  setOnlineMembers: (onlineMembers) => set({ onlineMembers }),
  reset: () => set({ onlineMembers: [] }),
}));

export function useOnlineMembers() {
  return useOnlineMembersStore(
    useShallow((state) => ({
      onlineMembers: state.onlineMembers,
    }))
  );
}
