"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { AppFormModal, Input } from "@fieldflow360/org-ui";

import {
  DEFAULT_PIN_CATEGORY_COLOR,
  isValidPinCategoryColor,
} from "../lib/pinCategoryColors";
import { PinCategoryColorSwatches } from "./PinCategoryColorSwatches";

const MAX_NAME_LENGTH = 50;

export interface PinCategoryEditorDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialName?: string;
  initialColor?: string;
  disabled?: boolean;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, color: string) => Promise<void>;
}

export function PinCategoryEditorDialog({
  open,
  mode,
  initialName = "",
  initialColor = DEFAULT_PIN_CATEGORY_COLOR,
  disabled = false,
  isSaving = false,
  onOpenChange,
  onSave,
}: PinCategoryEditorDialogProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setColor(initialColor);
    setNameError("");
  }, [initialColor, initialName, open]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      onOpenChange(false);
    }
  }, [isSaving, onOpenChange]);

  const handleNameChange = useCallback((value: string) => {
    if (value.length > MAX_NAME_LENGTH) {
      setNameError(
        `Category name must be ${MAX_NAME_LENGTH} characters or less`
      );
      return;
    }
    setName(value);
    setNameError("");
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const trimmedName = name.trim();
      if (!trimmedName) {
        setNameError("Category name is required");
        return;
      }
      if (!isValidPinCategoryColor(color)) {
        return;
      }
      await onSave(trimmedName, color);
    },
    [color, name, onSave]
  );

  const title = mode === "create" ? "Create Category" : "Edit Category";
  const submitLabel = mode === "create" ? "Create" : "Save Changes";

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      isSubmitting={isSaving}
      submitDisabled={disabled || !!nameError || !name.trim()}
      submitLabel={isSaving ? "Saving..." : submitLabel}
      title={title}
      width={480}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <div className="space-y-5">
        <Input
          disabled={disabled || isSaving}
          error={nameError}
          label="Category name"
          maxLength={MAX_NAME_LENGTH}
          placeholder="Category name"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
        />

        <div className="space-y-3">
          <p className="text-text-primary text-sm font-medium">Color</p>
          <PinCategoryColorSwatches
            disabled={disabled || isSaving}
            value={color}
            variant="grid"
            onChange={setColor}
          />
        </div>
      </div>
    </AppFormModal>
  );
}
