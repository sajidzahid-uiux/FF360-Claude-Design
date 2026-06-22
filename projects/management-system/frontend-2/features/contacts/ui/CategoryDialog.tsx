"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppFormModal, Input } from "@fieldflow360/org-ui";
import { Tags } from "lucide-react";
import { toast } from "sonner";

import { ColorPicker } from "@/shared/ui/common";
import { getErrorMessage } from "@/utils/apiError";

const MAX_NAME_LENGTH = 50;
const DEFAULT_SWATCH_COLOR = "#e5e7eb";

export interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  categoryName?: string;
  categoryColor?: string;
  isDefault?: boolean;
  onSave?: (name: string, color: string) => void | Promise<void>;
  onCancel?: (name: string, color: string) => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  title = "Edit Category",
  categoryName = "",
  categoryColor = "",
  isDefault = false,
  onSave,
  onCancel,
}: CategoryDialogProps) {
  const [name, setName] = useState(categoryName);
  const [color, setColor] = useState(categoryColor);
  const [nameError, setNameError] = useState("");
  const [colorError, setColorError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(categoryName);
      setColor(categoryColor);
      setNameError("");
      setColorError("");
    }
  }, [open, categoryName, categoryColor]);

  const handleNameChange = (value: string) => {
    if (value.length > MAX_NAME_LENGTH) {
      setNameError(
        `Category name must be ${MAX_NAME_LENGTH} characters or less`
      );
      return;
    }
    setName(value);
    setNameError("");
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setColorError("");
  };

  const validateForm = (): boolean => {
    let hasError = false;

    if (!name.trim()) {
      setNameError("Category name is required");
      hasError = true;
    } else if (name.length > MAX_NAME_LENGTH) {
      setNameError(
        `Category name must be ${MAX_NAME_LENGTH} characters or less`
      );
      hasError = true;
    }

    if (!color) {
      setColorError("Please select a color");
      hasError = true;
    }

    return !hasError;
  };

  const handleClose = () => {
    if (isSubmitting) return;

    onCancel?.(name, color);
    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      if (onSave) {
        await onSave(name.trim(), color);
      }
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, "An error occurred while saving the category")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSaveDisabled =
    Boolean(nameError) || Boolean(colorError) || !name.trim() || !color;

  const previewName = name.trim() || "Category name";
  const previewColor = color || DEFAULT_SWATCH_COLOR;
  const shouldRandomizeColor =
    !categoryColor ||
    categoryColor === "#FFFFFF" ||
    categoryColor === "#ffffff";

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      isSubmitting={isSubmitting}
      maxHeight="calc(100dvh - 1rem)"
      submitDisabled={isSaveDisabled}
      submitLabel="Save"
      title={title}
      width={680}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="border-border-subtle bg-bg-surface/40 flex items-center gap-3 rounded-lg border px-3 py-2.5">
          <span
            aria-hidden
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: previewColor }}
          />
          <div className="min-w-0">
            <p className="text-text-muted text-[10px] font-medium tracking-wide uppercase">
              Preview
            </p>
            <span className="text-text-primary block truncate text-sm font-semibold">
              {isDefault ? `${previewName} (default)` : previewName}
            </span>
          </div>
        </div>

        <Input
          disabled={isDefault}
          error={nameError}
          helperText={
            isDefault
              ? "Default category names cannot be changed."
              : `${name.length}/${MAX_NAME_LENGTH} characters`
          }
          label={isDefault ? "Category name (default)" : "Category name"}
          leftIcon={<Tags aria-hidden className="h-4 w-4" strokeWidth={2} />}
          maxLength={MAX_NAME_LENGTH}
          placeholder="e.g. Client Contact, Vendor, Partner"
          value={isDefault ? `${name} (default)` : name}
          onChange={(event) => {
            if (!isDefault) {
              handleNameChange(event.target.value);
            }
          }}
        />

        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-1.5">
            <div>
              <p className="text-text-primary text-sm font-medium">
                Category color
              </p>
              <p className="text-text-muted mt-0.5 text-xs">
                Tap a swatch below to choose a color.
              </p>
            </div>
            {color ? (
              <span className="text-text-muted font-mono text-xs uppercase">
                {color}
              </span>
            ) : null}
          </div>

          <div
            className={`bg-bg-surface/20 overflow-hidden rounded-lg p-3 ${
              colorError ? "ring-1 ring-[var(--color-feedback-error)]" : ""
            }`}
          >
            <div
              aria-hidden
              className="mb-3 h-3 w-full rounded-full"
              style={{ backgroundColor: previewColor }}
            />
            <div className="h-56 w-full sm:h-64">
              <ColorPicker
                color={color}
                random={shouldRandomizeColor}
                setColor={handleColorChange}
                size="medium"
              />
            </div>
          </div>

          {colorError ? (
            <p className="text-xs text-[var(--color-feedback-error)]">
              {colorError}
            </p>
          ) : null}
        </div>
      </div>
    </AppFormModal>
  );
}
