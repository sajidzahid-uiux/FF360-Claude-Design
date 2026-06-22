"use client";

import { useCallback } from "react";

import { DeleteDialog as OrgUiDeleteDialog } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { useDeleteDialog } from "@/shared/model/delete-dialog-store";
import { getErrorMessage } from "@/utils/apiError";

export function DeleteDialog() {
  const { isOpen, isLoading, config, closeDialog, setLoading } =
    useDeleteDialog();

  const handleConfirm = useCallback(async () => {
    if (!config) return;

    setLoading(true);
    try {
      await config.onConfirm();
      config.onSuccess?.();
      setLoading(false);
      closeDialog();
    } catch (error: unknown) {
      setLoading(false);
      toast.error(
        getErrorMessage(error, "Failed to delete. Please try again.")
      );
    }
  }, [config, closeDialog, setLoading]);

  if (!config) return null;

  return (
    <OrgUiDeleteDialog
      cancelLabel={config.cancelLabel ?? "Cancel"}
      confirmLabel={config.confirmLabel ?? "Delete"}
      description={config.description}
      icon={config.icon}
      isLoading={isLoading}
      isOpen={isOpen}
      title={config.title}
      onClose={closeDialog}
      onConfirm={handleConfirm}
    />
  );
}
