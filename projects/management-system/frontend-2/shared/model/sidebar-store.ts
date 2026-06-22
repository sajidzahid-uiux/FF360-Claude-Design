"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface SidebarStore {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  registerToggle: (controller: (collapsed: boolean) => void) => void;
  toggleViaController: () => void;
}

let collapseController: ((collapsed: boolean) => void) | null = null;

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  collapsed: false,

  setCollapsed: (collapsed) => {
    set({ collapsed });
  },

  toggle: () => {
    const next = !get().collapsed;
    collapseController?.(next);
    set({ collapsed: next });
  },

  registerToggle: (controller) => {
    collapseController = controller;
  },

  toggleViaController: () => {
    get().toggle();
  },
}));

export function useSidebarCollapsed() {
  return useSidebarStore((state) => state.collapsed);
}

export function useSidebarActions() {
  return useSidebarStore(
    useShallow((state) => ({
      setCollapsed: state.setCollapsed,
      toggle: state.toggle,
      registerToggle: state.registerToggle,
    }))
  );
}
