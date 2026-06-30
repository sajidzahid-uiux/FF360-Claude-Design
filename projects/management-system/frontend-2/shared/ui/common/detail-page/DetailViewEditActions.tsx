"use client";

import { Button, ButtonVariantEnum, ComponentSizeEnum } from "@fieldflow360/org-ui";
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
  /**
   * When set, the Edit button renders as a text button with this label (plus a
   * pencil icon) instead of the default icon-only button. Used by the job/lead
   * detail tabs so the action reads "Edit" consistently.
   */
  editLabel?: string;
  /** Button size for the whole group. Defaults to MD (matches contacts/equipment). */
  size?: ComponentSizeEnum;
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
  editLabel,
  size,
}: DetailViewEditActionsProps) {
  if (!canEdit) {
    return null;
  }

  if (!isEditing) {
    return (
      <Button
        aria-label={editAriaLabel}
        iconOnly={!editLabel}
        leftIcon={<Pencil aria-hidden className="h-4 w-4" strokeWidth={2} />}
        size={size}
        title={editLabel}
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
        size={size}
        title="Cancel"
        variant={ButtonVariantEnum.SURFACE}
        onClick={onCancel}
      />
      <Button
        aria-label={isSaving ? savingLabel : saveLabel}
        disabled={!canSave || isSaving}
        loading={isSaving}
        size={size}
        title={isSaving ? savingLabel : saveLabel}
        onClick={onSave}
      />
    </>
  );
}
