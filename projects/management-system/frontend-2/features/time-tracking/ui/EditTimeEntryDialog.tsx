"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { AppFormModal, Input } from "@fieldflow360/org-ui";

import type { UpdateTimeEntryPayload } from "@/api/types/jobTimeEntries";
import type { InstalledHoursLogRow } from "@/features/jobs";

export interface EditTimeEntryDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialRow: InstalledHoursLogRow;
  disabled?: boolean;
  onSave: (payload: UpdateTimeEntryPayload) => void | Promise<void>;
}

export function EditTimeEntryDialog({
  open = true,
  onOpenChange,
  initialRow,
  disabled = false,
  onSave,
}: EditTimeEntryDialogProps) {
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setHours(String(initialRow.hours));
      setDescription(initialRow.description ?? "");
    }
  }, [open, initialRow]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0) return;
    const id = parseInt(initialRow.id, 10);
    if (Number.isNaN(id)) return;

    setSubmitting(true);
    try {
      await onSave({
        id,
        hours: h,
        description: description.trim() || null,
      });
      onOpenChange?.(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelDisabled={submitting}
      isOpen={open}
      isSubmitting={submitting}
      submitDisabled={disabled || !hours || parseFloat(hours) <= 0}
      submitLabel="Save"
      title="Edit time entry"
      width={480}
      onClose={() => onOpenChange?.(false)}
      onSubmit={handleSubmit}
    >
      <Input
        disabled={disabled || submitting}
        inputMode="decimal"
        label="Hours"
        min="0"
        step="0.01"
        type="number"
        value={hours}
        onChange={(event) => setHours(event.target.value)}
      />
      <Input
        disabled={disabled || submitting}
        label="Description"
        placeholder="Optional"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
    </AppFormModal>
  );
}
