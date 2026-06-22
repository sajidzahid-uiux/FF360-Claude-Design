"use client";

import type { FormEvent } from "react";

import { AppFormModal } from "@fieldflow360/org-ui";

export interface ConfirmPlanChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  planName: string;
  isLoading?: boolean;
}

export default function ConfirmPlanChangeDialog({
  open,
  onOpenChange,
  onConfirm,
  planName,
  isLoading = false,
}: ConfirmPlanChangeDialogProps) {
  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onConfirm();
  };

  return (
    <AppFormModal
      showCancel
      cancelDisabled={isLoading}
      isOpen={open}
      isSubmitting={isLoading}
      submitLabel={isLoading ? "Processing..." : "Confirm Change"}
      title="Change Subscription Plan"
      width={480}
      onClose={() => onOpenChange(false)}
      onSubmit={handleSubmit}
    >
      <p className="text-text-muted text-sm">
        Are you sure you want to change your plan to {planName}? This will
        update your subscription immediately.
      </p>
    </AppFormModal>
  );
}
