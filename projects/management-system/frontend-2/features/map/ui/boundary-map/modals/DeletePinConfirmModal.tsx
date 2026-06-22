"use client";

import type { FormEvent } from "react";

import { AppFormModal } from "@fieldflow360/org-ui";

import type { MapPinItem } from "@/features/map/model/mapPinItem";

export interface DeletePinConfirmModalProps {
  open: boolean;
  pin: MapPinItem | null;
  onClose: () => void;
  onConfirm: (pinId: number) => void;
}

export function DeletePinConfirmModal({
  open,
  pin,
  onClose,
  onConfirm,
}: DeletePinConfirmModalProps) {
  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (pin?.id != null) {
      onConfirm(pin.id);
    }
    onClose();
  };

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      submitLabel="Delete"
      title="Delete Pin"
      width={480}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <p className="text-text-muted text-sm">
        Are you sure you want to delete &quot;{pin?.name}&quot;? This action
        cannot be undone.
      </p>
    </AppFormModal>
  );
}
