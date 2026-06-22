"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppFormModal, ColorPicker, Input } from "@fieldflow360/org-ui";
import { Tags } from "lucide-react";

import type { LeadTypeFormValues } from "@/features/leads/model/types";

const MAX_TITLE_LENGTH = 150;
const DEFAULT_COLOR = "#A855F7";

export interface LeadSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "add" | "edit";
  initialData?: Partial<LeadTypeFormValues>;
  isSubmitting?: boolean;
  onSubmit: (values: LeadTypeFormValues) => void | Promise<void>;
}

export function LeadSourceModal({
  open,
  onOpenChange,
  mode = "add",
  initialData,
  isSubmitting = false,
  onSubmit,
}: LeadSourceModalProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initialData?.title ?? "");
    setColor(initialData?.color ?? DEFAULT_COLOR);
    setTitleError("");
  }, [initialData?.color, initialData?.title, open]);

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const validate = (): boolean => {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError("Lead source name is required");
      return false;
    }
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setTitleError(`Maximum ${MAX_TITLE_LENGTH} characters allowed`);
      return false;
    }
    setTitleError("");
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      id: initialData?.id,
      title: title.trim(),
      color,
    });
  };

  const previewTitle = title.trim() || "Lead source";
  const titleLabel = mode === "add" ? "Add Lead Source" : "Edit Lead Source";

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      isSubmitting={isSubmitting}
      maxHeight="calc(100dvh - 1rem)"
      submitDisabled={!title.trim() || Boolean(titleError)}
      submitLabel={mode === "add" ? "Add" : "Save"}
      title={titleLabel}
      width={560}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="border-border-subtle bg-bg-surface/40 flex items-center gap-3 rounded-lg border px-3 py-2.5">
          <span
            aria-hidden
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0">
            <p className="text-text-muted text-[10px] font-medium tracking-wide uppercase">
              Preview
            </p>
            <span className="text-text-primary block truncate text-sm font-semibold">
              {previewTitle}
            </span>
          </div>
        </div>

        <Input
          required
          error={titleError}
          helperText={`${title.length}/${MAX_TITLE_LENGTH} characters`}
          label="Source name"
          leftIcon={<Tags aria-hidden className="h-4 w-4" strokeWidth={2} />}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="e.g. Referral, Website, Cold call"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (titleError) setTitleError("");
          }}
        />

        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-1.5">
            <div>
              <p className="text-text-primary text-sm font-medium">Color</p>
              <p className="text-text-muted mt-0.5 text-xs">
                Choose a color for this lead source.
              </p>
            </div>
            <span className="text-text-muted font-mono text-xs uppercase">
              {color}
            </span>
          </div>
          <div className="bg-bg-surface/20 overflow-hidden rounded-lg p-3">
            <div
              aria-hidden
              className="mb-3 h-3 w-full rounded-full"
              style={{ backgroundColor: color }}
            />
            <ColorPicker showHeader={false} value={color} onChange={setColor} />
          </div>
        </div>
      </div>
    </AppFormModal>
  );
}
