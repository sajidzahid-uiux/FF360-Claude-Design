"use client";

import type { FormEvent, ReactNode } from "react";

import { AppFormModal } from "@fieldflow360/org-ui";

export interface QuickActionConvertModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit: (event: FormEvent) => void;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  submitLabel?: string;
  showCancel?: boolean;
  cancelLabel?: string;
  width?: number;
}

export function QuickActionConvertModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  isSubmitting = false,
  submitDisabled = false,
  submitLabel = "Convert",
  showCancel = true,
  cancelLabel = "Cancel",
  width = 720,
}: QuickActionConvertModalProps) {
  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      cancelLabel={cancelLabel}
      isOpen={open}
      isSubmitting={isSubmitting}
      maxHeight="calc(100vh - 4rem)"
      showCancel={showCancel}
      submitDisabled={submitDisabled}
      submitLabel={submitLabel}
      title={title}
      width={width}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {subtitle ? (
        <p className="text-text-muted mb-6 text-sm">{subtitle}</p>
      ) : null}
      {children}
    </AppFormModal>
  );
}
