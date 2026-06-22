"use client";

import type { FormEvent } from "react";

import { AppFormModal } from "@fieldflow360/org-ui";

import type { CorePoint } from "../lib/types";

export interface DeleteCorePointConfirmModalProps {
  open: boolean;
  corePoint: CorePoint | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteCorePointConfirmModal({
  open,
  corePoint,
  onClose,
  onConfirm,
}: DeleteCorePointConfirmModalProps) {
  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onConfirm();
    onClose();
  };

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      submitLabel="Delete"
      title="Delete Core Point"
      width={480}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <p className="text-text-muted text-sm">
        Are you sure you want to delete &quot;{corePoint?.name}&quot;? This
        action cannot be undone.
      </p>
    </AppFormModal>
  );
}
