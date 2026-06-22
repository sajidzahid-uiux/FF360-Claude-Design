"use client";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { Pencil } from "lucide-react";

export interface DetailViewEditActionsProps {
  canEdit: boolean;
  isEditing: boolean;
  isSaving?: boolean;
  canSave?: boolean;
  editAriaLabel: string;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  savingLabel?: string;
}

export function DetailViewEditActions({
  canEdit,
  isEditing,
  isSaving = false,
  canSave = true,
  editAriaLabel,
  onEdit,
  onCancel,
  onSave,
  saveLabel = "Save changes",
  savingLabel = "Saving...",
}: DetailViewEditActionsProps) {
  if (!canEdit) {
    return null;
  }

  if (!isEditing) {
    return (
      <Button
        iconOnly
        aria-label={editAriaLabel}
        leftIcon={<Pencil aria-hidden className="h-4 w-4" strokeWidth={2} />}
        variant={ButtonVariantEnum.SURFACE}
        onClick={onEdit}
      />
    );
  }

  return (
    <>
      <Button
        aria-label="Cancel"
        disabled={isSaving}
        title="Cancel"
        variant={ButtonVariantEnum.SURFACE}
        onClick={onCancel}
      />
      <Button
        aria-label={isSaving ? savingLabel : saveLabel}
        disabled={!canSave || isSaving}
        loading={isSaving}
        title={isSaving ? savingLabel : saveLabel}
        onClick={onSave}
      />
    </>
  );
}
