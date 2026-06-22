"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppFormModal, ColorPicker, Input } from "@fieldflow360/org-ui";
import { Hash, Tags } from "lucide-react";

import type { StatusFormValues } from "@/features/jobs";

const MAX_TITLE_LENGTH = 150;
const MAX_ORDER_LENGTH = 150;
const DEFAULT_COLOR = "#A855F7";

export interface JobStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "add" | "edit";
  initialData?: Partial<StatusFormValues>;
  isSubmitting?: boolean;
  onSubmit: (values: StatusFormValues) => void | Promise<void>;
}

export function JobStatusModal({
  open,
  onOpenChange,
  mode = "add",
  initialData,
  isSubmitting = false,
  onSubmit,
}: JobStatusModalProps) {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [titleError, setTitleError] = useState("");
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initialData?.title ?? "");
    setOrder(initialData?.number != null ? String(initialData.number) : "");
    setColor(initialData?.color ?? DEFAULT_COLOR);
    setTitleError("");
    setOrderError("");
  }, [initialData?.color, initialData?.number, initialData?.title, open]);

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const validate = (): boolean => {
    let valid = true;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Status name is required");
      valid = false;
    } else if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      setTitleError(`Maximum ${MAX_TITLE_LENGTH} characters allowed`);
      valid = false;
    } else {
      setTitleError("");
    }

    const trimmedOrder = order.trim();
    if (!trimmedOrder) {
      setOrderError("Order is required");
      valid = false;
    } else if (trimmedOrder.length > MAX_ORDER_LENGTH) {
      setOrderError(`Maximum ${MAX_ORDER_LENGTH} characters allowed`);
      valid = false;
    } else if (!/^\d+$/.test(trimmedOrder)) {
      setOrderError("Order must be a whole number");
      valid = false;
    } else {
      setOrderError("");
    }

    return valid;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      id: initialData?.id,
      title: title.trim(),
      color,
      number: order.trim(),
    });
  };

  const previewTitle = title.trim() || "Job status";
  const titleLabel = mode === "add" ? "Add Job Status" : "Edit Job Status";

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      isSubmitting={isSubmitting}
      maxHeight="calc(100dvh - 1rem)"
      submitDisabled={
        !title.trim() || !order.trim() || Boolean(titleError || orderError)
      }
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
          label="Status name"
          leftIcon={<Tags aria-hidden className="h-4 w-4" strokeWidth={2} />}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="e.g. Scheduled, In progress"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (titleError) setTitleError("");
          }}
        />

        <Input
          required
          error={orderError}
          label="Display order"
          leftIcon={<Hash aria-hidden className="h-4 w-4" strokeWidth={2} />}
          maxLength={MAX_ORDER_LENGTH}
          placeholder="e.g. 1"
          value={order}
          onChange={(event) => {
            setOrder(event.target.value);
            if (orderError) setOrderError("");
          }}
        />

        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-1.5">
            <div>
              <p className="text-text-primary text-sm font-medium">Color</p>
              <p className="text-text-muted mt-0.5 text-xs">
                Used on job cards and filters.
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
