"use client";

import { FormEvent, ReactNode } from "react";

import { AppFormModal } from "@fieldflow360/org-ui";

interface FormDialogProps {
  title: string;
  children: ReactNode;
  onCancel: () => void;
  onSubmit?: (event: FormEvent) => void;
  footer?: ReactNode;
  width?: number;
  maxWidth?: string;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
}

export function FormDialog({
  title,
  children,
  onCancel,
  onSubmit,
  footer,
  width = 740,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isSubmitting = false,
  submitDisabled = false,
}: FormDialogProps) {
  return (
    <AppFormModal
      isOpen
      showCancel
      cancelLabel={cancelLabel}
      isSubmitting={isSubmitting}
      submitDisabled={submitDisabled}
      submitLabel={submitLabel}
      title={title}
      width={width}
      onClose={onCancel}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(event);
      }}
    >
      {children}
      {footer}
    </AppFormModal>
  );
}
