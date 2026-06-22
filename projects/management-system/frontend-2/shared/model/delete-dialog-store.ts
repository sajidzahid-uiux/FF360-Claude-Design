"use client";

import { ReactNode } from "react";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export interface DeleteDialogConfig {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  icon?: ReactNode;
  onConfirm: () => Promise<void> | void;
  onSuccess?: () => void;
  onClose?: () => void;
}

interface DeleteDialogState {
  isOpen: boolean;
  isLoading: boolean;
  config: DeleteDialogConfig | null;

  openDialog: (config: DeleteDialogConfig) => void;
  closeDialog: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useDeleteDialogStore = create<DeleteDialogState>((set) => ({
  isOpen: false,
  isLoading: false,
  config: null,

  openDialog: (config: DeleteDialogConfig) => {
    set({ isOpen: true, config, isLoading: false });
  },

  closeDialog: () => {
    set((state) => {
      if (!state.isLoading) {
        state.config?.onClose?.();
        return { isOpen: false, config: null, isLoading: false };
      }
      return state;
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  reset: () => {
    set({ isOpen: false, isLoading: false, config: null });
  },
}));

export function useDeleteDialog() {
  return useDeleteDialogStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      isLoading: state.isLoading,
      config: state.config,
      closeDialog: state.closeDialog,
      setLoading: state.setLoading,
    }))
  );
}

export function useDeleteDialogOpen() {
  return useDeleteDialogStore(
    useShallow((state) => ({ openDialog: state.openDialog }))
  );
}
