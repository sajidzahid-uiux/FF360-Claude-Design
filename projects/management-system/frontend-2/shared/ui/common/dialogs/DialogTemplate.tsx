"use client";

import { FormEvent, ReactNode } from "react";

import {
  AppFormModal,
  Button,
  ButtonVariantEnum,
  Modal,
  type ModalSize,
} from "@fieldflow360/org-ui";

interface DialogTemplateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  showDefaultFooter?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";
  maxWidth?: string;
  description?: string;
  size?: ModalSize;
}

export function DialogTemplate({
  open,
  onOpenChange,
  title,
  children,
  footer,
  showDefaultFooter = false,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  maxWidth,
  description,
  size = "lg",
}: DialogTemplateProps) {
  const handleClose = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    onOpenChange(false);
  };

  if (!open) {
    return null;
  }

  if (showDefaultFooter) {
    return (
      <AppFormModal
        showCancel
        cancelLabel={cancelText}
        isOpen={open}
        submitLabel={confirmText}
        title={title}
        onClose={handleClose}
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          onConfirm?.();
        }}
      >
        {description ? (
          <p className="text-text-muted text-sm">{description}</p>
        ) : null}
        <div className="space-y-4">{children}</div>
      </AppFormModal>
    );
  }

  return (
    <Modal
      className={maxWidth ? undefined : "max-w-lg"}
      isOpen={open}
      size={size}
      title={title}
      onClose={handleClose}
    >
      {description ? (
        <p className="text-text-muted mb-4 text-sm">{description}</p>
      ) : null}
      <div className="space-y-4">{children}</div>
      {footer ? (
        <div className="border-border-subtle mt-6 border-t pt-4">{footer}</div>
      ) : null}
      {!footer && onConfirm ? (
        <div className="mt-6 flex justify-end gap-3">
          <Button
            aria-label={cancelText}
            title={cancelText}
            variant={ButtonVariantEnum.SURFACE}
            onClick={handleClose}
          />
          <Button
            aria-label={confirmText}
            title={confirmText}
            variant={
              confirmVariant === "destructive"
                ? ButtonVariantEnum.DELETE
                : ButtonVariantEnum.DEFAULT
            }
            onClick={onConfirm}
          />
        </div>
      ) : null}
    </Modal>
  );
}
