"use client";

import { Modal } from "@fieldflow360/org-ui";

export interface FileDescriptionModalProps {
  open: boolean;
  description?: string | null;
  onOpenChange: (open: boolean) => void;
}

export function FileDescriptionModal({
  open,
  description,
  onOpenChange,
}: FileDescriptionModalProps) {
  if (!open) {
    return null;
  }

  return (
    <Modal
      isOpen={open}
      size="md"
      title="Description"
      onClose={() => onOpenChange(false)}
    >
      <div className="max-w-[400px] text-base break-all whitespace-pre-line">
        {description || "No description provided."}
      </div>
    </Modal>
  );
}
