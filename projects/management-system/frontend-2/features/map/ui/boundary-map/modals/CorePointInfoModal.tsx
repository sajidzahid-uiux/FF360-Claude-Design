"use client";

import { Button, ButtonVariantEnum, Modal } from "@fieldflow360/org-ui";

import type { CorePoint } from "../lib/types";

export interface CorePointInfoModalProps {
  open: boolean;
  corePoint: CorePoint | null;
  canEdit?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CorePointInfoModal({
  open,
  corePoint,
  canEdit = false,
  onClose,
  onEdit,
  onDelete,
}: CorePointInfoModalProps) {
  if (!open || !corePoint) {
    return null;
  }

  return (
    <Modal
      isOpen={open}
      size="md"
      title={corePoint.name ?? "Core point"}
      onClose={onClose}
    >
      <p className="text-text-muted text-sm">
        {corePoint.description || "No description"}
      </p>
      {canEdit ? (
        <div className="mt-6 flex justify-end gap-2">
          <Button
            aria-label="Edit"
            title="Edit"
            onClick={() => {
              onEdit?.();
              onClose();
            }}
          />
          <Button
            aria-label="Delete"
            disabled={!onDelete}
            title="Delete"
            variant={ButtonVariantEnum.DELETE}
            onClick={onDelete}
          />
        </div>
      ) : null}
    </Modal>
  );
}
