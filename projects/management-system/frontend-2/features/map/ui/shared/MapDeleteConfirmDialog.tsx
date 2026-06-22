"use client";

import { Button, ButtonVariantEnum, Overlay } from "@fieldflow360/org-ui";

export interface MapDeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  itemName: string | undefined;
  onConfirm: () => void;
}

export function MapDeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  itemName,
  onConfirm,
}: MapDeleteConfirmDialogProps) {
  return (
    <Overlay isOpen={open} onClose={() => onOpenChange(false)}>
      <div className="bg-bg-surface-elevated border-border-subtle w-full max-w-md rounded-lg border p-6 shadow-xl">
        <h2 className="text-text-primary text-lg font-semibold">{title}</h2>
        <p className="text-text-muted mt-2 text-sm">
          Are you sure you want to delete &quot;{itemName}&quot;?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            aria-label="Cancel"
            title="Cancel"
            variant={ButtonVariantEnum.GHOST}
            onClick={() => onOpenChange(false)}
          />
          <Button
            aria-label="Delete"
            title="Delete"
            variant={ButtonVariantEnum.DELETE}
            onClick={onConfirm}
          />
        </div>
      </div>
    </Overlay>
  );
}
