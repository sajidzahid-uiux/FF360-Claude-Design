"use client";

import { Button, ButtonVariantEnum, Textarea } from "@fieldflow360/org-ui";
import { X } from "lucide-react";

export interface DeckCorePointFormPanelProps {
  open: boolean;
  isEditing: boolean;
  description: string;
  onDescriptionChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function DeckCorePointFormPanel({
  open,
  isEditing,
  description,
  onDescriptionChange,
  onCancel,
  onSave,
}: DeckCorePointFormPanelProps) {
  if (!open) return null;

  return (
    <div className="bg-bg-surface-elevated border-border-subtle absolute top-1/2 left-1/2 z-[100] max-w-[400px] min-w-[300px] -translate-x-1/2 -translate-y-1/2 transform rounded-lg border p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-text-primary text-lg font-semibold">
          {isEditing ? "Edit Core Point" : "Add Core Point"}
        </h3>
        <Button
          iconOnly
          aria-label="Close"
          leftIcon={<X aria-hidden className="h-4 w-4" />}
          variant={ButtonVariantEnum.GHOST}
          onClick={onCancel}
        />
      </div>
      <div className="space-y-3">
        <Textarea
          autoFocus
          label="Description"
          placeholder="Enter core point description (optional)"
          rows={3}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
        <div className="flex gap-2 pt-2">
          <Button
            aria-label="Cancel"
            className="flex-1"
            title="Cancel"
            variant={ButtonVariantEnum.SURFACE}
            onClick={onCancel}
          />
          <Button
            aria-label="Save"
            className="flex-1"
            title="Save"
            onClick={onSave}
          />
        </div>
      </div>
    </div>
  );
}
