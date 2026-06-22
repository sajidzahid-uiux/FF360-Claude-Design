"use client";

import { type ReactNode } from "react";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export interface CmsBreadcrumbToolbarState {
  toolbarContent: ReactNode | null;
  setBreadcrumbToolbar: (content: ReactNode | null) => void;
}

export const useCmsBreadcrumbToolbarStore = create<CmsBreadcrumbToolbarState>(
  (set) => ({
    toolbarContent: null,
    setBreadcrumbToolbar: (content) => set({ toolbarContent: content }),
  })
);

export function useCmsBreadcrumbToolbarContent() {
  return useCmsBreadcrumbToolbarStore((state) => state.toolbarContent);
}

export function useSetCmsBreadcrumbToolbar() {
  return useCmsBreadcrumbToolbarStore(
    useShallow((state) => ({
      setBreadcrumbToolbar: state.setBreadcrumbToolbar,
    }))
  );
}
