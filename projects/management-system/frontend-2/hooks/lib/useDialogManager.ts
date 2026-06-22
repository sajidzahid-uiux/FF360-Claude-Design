import { useMemo } from "react";

import {
  useDialogManagerActions,
  useDialogManagerState,
} from "@/shared/model/dialog-manager-store";

export type {
  ConfirmationDialogConfig,
  DialogConfig,
  DialogState,
} from "@/shared/model/dialog-manager-store";

export function useDialogManager() {
  const state = useDialogManagerState();
  const actions = useDialogManagerActions();

  return useMemo(
    () => ({
      state: {
        isOpen: state.isOpen,
        config: state.config,
      },
      openDialog: actions.openDialog,
      openConfirmationDialog: actions.openConfirmationDialog,
      closeDialog: actions.closeDialog,
      updateDialogProps: actions.updateDialogProps,
      setConfirmationProcessing: actions.setConfirmationProcessing,
      setConfirmationProgress: actions.setConfirmationProgress,
      reset: actions.reset,
      openModal: actions.openDialog,
      closeModal: actions.closeDialog,
      updateModalProps: actions.updateDialogProps,
    }),
    [actions, state.config, state.isOpen]
  );
}

export const useModalManager = useDialogManager;
