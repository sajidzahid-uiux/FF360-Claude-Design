"use client";

import { useCallback, useMemo, useState } from "react";

import { DeleteDialog, Dialog } from "@fieldflow360/org-ui";

export interface SimpleConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  variant?: "default" | "destructive";
  confirmationType?: "simple" | "delete";
  itemTitle?: string;
  trash?: boolean;
  isProcessing?: boolean;
  progress?: number;
  currentItem?: string;
}

function appendProgressDetails(
  description: string | undefined,
  isProcessing: boolean,
  progress: number,
  currentItem: string
): string | undefined {
  if (!isProcessing || progress <= 0) {
    return description;
  }

  const progressLines = [
    description,
    `Processing… ${progress}%`,
    currentItem ? `Currently processing: ${currentItem}` : undefined,
  ].filter(Boolean);

  return progressLines.join(" ");
}

function buildItemDeleteDescription(itemTitle: string, trash: boolean): string {
  const action = trash ? "move" : "permanently delete";
  const suffix = trash ? " to trash" : "";
  return `Are you sure you want to ${action} "${itemTitle}"${suffix}?`;
}

export function SimpleConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  variant = "default",
  confirmationType = "simple",
  itemTitle,
  trash = false,
  isProcessing = false,
  progress = 0,
  currentItem = "",
}: SimpleConfirmationDialogProps) {
  const [processing, setProcessing] = useState(false);

  const isLoading = processing || isProcessing;

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onOpenChange(false);
    }
  }, [isLoading, onOpenChange]);

  const handleConfirm = useCallback(async () => {
    setProcessing(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setProcessing(false);
    }
  }, [onConfirm, onOpenChange]);

  const resolvedDescription = useMemo(() => {
    const baseDescription =
      confirmationType === "delete" && itemTitle
        ? buildItemDeleteDescription(itemTitle, trash)
        : description;

    return appendProgressDetails(
      baseDescription,
      isProcessing,
      progress,
      currentItem
    );
  }, [
    confirmationType,
    currentItem,
    description,
    isProcessing,
    itemTitle,
    progress,
    trash,
  ]);

  const resolvedTitle =
    confirmationType === "delete" && itemTitle && trash
      ? "Move to Trash"
      : title;

  const resolvedConfirmLabel =
    confirmationType === "delete" && itemTitle && trash
      ? "Move to Trash"
      : confirmButtonText;

  const isDanger = variant === "destructive" || confirmationType === "delete";

  if (confirmationType === "delete") {
    return (
      <DeleteDialog
        cancelLabel={cancelButtonText}
        confirmLabel={resolvedConfirmLabel}
        description={resolvedDescription}
        isLoading={isLoading}
        isOpen={open}
        title={resolvedTitle}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <Dialog
      cancelLabel={cancelButtonText}
      confirmLabel={resolvedConfirmLabel}
      description={resolvedDescription}
      isLoading={isLoading}
      isOpen={open}
      title={resolvedTitle}
      variant={isDanger ? "danger" : "default"}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );
}
