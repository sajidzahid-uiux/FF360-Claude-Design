"use client";

import {
  ConfirmationDialogConfig,
  DialogConfig,
  useDialogManagerActions,
  useDialogManagerState,
} from "@/shared/model/dialog-manager-store";

import { SimpleConfirmationDialog } from "./SimpleConfirmationDialog";

interface DialogManagerProps {
  manager?: {
    state: {
      isOpen: boolean;
      config: DialogConfig | ConfirmationDialogConfig | null;
    };
    closeDialog: () => void;
  };
}

interface DialogComponentProps extends Record<string, unknown> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCancel?: () => void;
  onSubmit?: (values: unknown) => void;
  onClose?: () => void;
}

export function DialogManager({ manager: managerProp }: DialogManagerProps) {
  const storeState = useDialogManagerState();
  const { closeDialog: storeCloseDialog } = useDialogManagerActions();
  const state = managerProp?.state ?? {
    isOpen: storeState.isOpen,
    config: storeState.config,
  };
  const closeDialog = managerProp?.closeDialog ?? storeCloseDialog;

  if (!state.isOpen || !state.config) {
    return null;
  }

  // Handle confirmation dialogs
  if (state.config.type === "confirmation") {
    const config = state.config as ConfirmationDialogConfig;
    return (
      <SimpleConfirmationDialog
        cancelButtonText={config.cancelButtonText}
        confirmationType={config.confirmationType}
        confirmButtonText={config.confirmButtonText}
        currentItem={config.currentItem}
        description={config.description}
        isProcessing={config.isProcessing}
        itemTitle={config.itemTitle}
        open={state.isOpen}
        progress={config.progress}
        title={config.title}
        trash={config.trash}
        variant={config.variant}
        onConfirm={config.onConfirm}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      />
    );
  }

  // Handle component dialogs
  const { component: Component, props = {} } = state.config as DialogConfig;
  const dialogProps = props as DialogComponentProps;

  const isDialogType =
    state.config.type === "statusModal" ||
    state.config.type === "component" ||
    state.config.type?.includes("Dialog") ||
    state.config.type?.includes("Modal") ||
    state.config.type?.includes("dialog") ||
    state.config.type?.includes("modal");

  // Strategy 1: Components with open/onOpenChange pattern (Radix UI Dialog pattern)
  // Examples: StatusModal, Dialog components from shadcn/ui
  // Priority: Check this first for Dialog components, even if they have onSubmit
  if (
    isDialogType ||
    dialogProps.open !== undefined ||
    dialogProps.onOpenChange
  ) {
    return (
      <Component
        {...dialogProps}
        open={state.isOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            closeDialog();
          }
          if (dialogProps.onOpenChange) {
            dialogProps.onOpenChange(open);
          }
        }}
      />
    );
  }

  // Strategy 2: Components with onCancel/onSubmit pattern (Form dialogs)
  // Examples: NewTilingJobForm, FormDialog-based components
  // Only apply if they don't have open/onOpenChange (already handled above)
  if (dialogProps.onCancel || dialogProps.onSubmit) {
    return (
      <Component
        {...dialogProps}
        onCancel={
          dialogProps.onCancel
            ? () => {
                closeDialog();
                dialogProps.onCancel?.();
              }
            : undefined
        }
        onSubmit={
          dialogProps.onSubmit
            ? (values: unknown) => {
                dialogProps.onSubmit?.(values);
                // Don't auto-close on submit - let the handler manage it
              }
            : undefined
        }
      />
    );
  }

  // Strategy 3: Default fallback — still control open state; many dialog components only
  // implement onOpenChange (not onClose), so wire both for Cancel / X / overlay dismiss.
  return (
    <Component
      {...dialogProps}
      open={state.isOpen}
      onClose={closeDialog}
      onOpenChange={(open: boolean) => {
        if (!open) {
          closeDialog();
        }
        dialogProps.onOpenChange?.(open);
      }}
    />
  );
}

// Legacy export for backwards compatibility
export const ModalManager = DialogManager;
