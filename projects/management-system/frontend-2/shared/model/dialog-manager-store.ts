"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export interface DialogConfig<T extends object = Record<string, unknown>> {
  type: string;
  component: React.ComponentType<T>;
  props?: T;
  onClose?: () => void;
}

export interface ConfirmationDialogConfig {
  type: "confirmation";
  title: string;
  description?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  variant?: "default" | "destructive";
  confirmationType?: "simple" | "delete";
  itemTitle?: string;
  trash?: boolean;
  onConfirm: () => void | Promise<void>;
  isProcessing?: boolean;
  progress?: number;
  currentItem?: string;
}

export interface DialogState {
  isOpen: boolean;
  config: DialogConfig | ConfirmationDialogConfig | null;
}

interface DialogManagerStore extends DialogState {
  openDialog: <T extends object = Record<string, unknown>>(
    config: DialogConfig<T>
  ) => void;
  openConfirmationDialog: (
    config: Omit<ConfirmationDialogConfig, "type">
  ) => void;
  closeDialog: () => void;
  updateDialogProps: <T extends object = Record<string, unknown>>(
    props: Partial<T>
  ) => void;
  setConfirmationProcessing: (processing: boolean) => void;
  setConfirmationProgress: (progress: number, currentItem?: string) => void;
  reset: () => void;
}

export const useDialogManagerStore = create<DialogManagerStore>((set) => ({
  isOpen: false,
  config: null,

  openDialog: (config) => {
    set({ isOpen: true, config: config as DialogConfig });
  },

  openConfirmationDialog: (config) => {
    set({
      isOpen: true,
      config: { ...config, type: "confirmation" } as ConfirmationDialogConfig,
    });
  },

  closeDialog: () => {
    set((prev) => {
      if (prev.config && "onClose" in prev.config && prev.config.onClose) {
        prev.config.onClose();
      }
      return { isOpen: false, config: null };
    });
  },

  updateDialogProps: (props) => {
    set((prev) => {
      if (!prev.config || prev.config.type === "confirmation") return prev;
      const currentConfig = prev.config as DialogConfig;
      const currentProps = (currentConfig.props ?? {}) as Record<
        string,
        unknown
      >;
      return {
        ...prev,
        config: {
          ...currentConfig,
          props: { ...currentProps, ...props },
        } as DialogConfig,
      };
    });
  },

  setConfirmationProcessing: (processing) => {
    set((prev) => {
      if (!prev.config || prev.config.type !== "confirmation") return prev;
      return {
        ...prev,
        config: { ...prev.config, isProcessing: processing },
      };
    });
  },

  setConfirmationProgress: (progress, currentItem) => {
    set((prev) => {
      if (!prev.config || prev.config.type !== "confirmation") return prev;
      const config = prev.config as ConfirmationDialogConfig;
      return {
        ...prev,
        config: {
          ...config,
          progress,
          currentItem: currentItem ?? config.currentItem,
        },
      };
    });
  },

  reset: () => {
    set({ isOpen: false, config: null });
  },
}));

export function useDialogManagerState() {
  return useDialogManagerStore(useShallow((state) => state));
}

export function useDialogManagerActions() {
  return useDialogManagerStore(
    useShallow((state) => ({
      openDialog: state.openDialog,
      openConfirmationDialog: state.openConfirmationDialog,
      closeDialog: state.closeDialog,
      updateDialogProps: state.updateDialogProps,
      setConfirmationProcessing: state.setConfirmationProcessing,
      setConfirmationProgress: state.setConfirmationProgress,
      reset: state.reset,
    }))
  );
}
