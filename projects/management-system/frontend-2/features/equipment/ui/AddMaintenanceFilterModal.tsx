"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { AppFormModal, Input } from "@fieldflow360/org-ui";

import type { AddMaintenanceFilterFormData } from "@/features/maintenance-filter";
import { useIsMobile } from "@/hooks";

export type { AddMaintenanceFilterFormData };

export interface AddMaintenanceFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  maxLastChanged?: number;
  onAdd: (data: AddMaintenanceFilterFormData) => void | Promise<void>;
  error?: string | null;
}

function validateFilterForm(
  lastChanged: string,
  threshold: string
): string | null {
  const hasLastChanged = lastChanged.trim() !== "";
  const hasThreshold = threshold.trim() !== "";

  if (hasLastChanged !== hasThreshold) {
    return "Last changed and threshold must both be filled or both be left empty.";
  }
  if (!hasLastChanged && !hasThreshold) {
    return "At least one value (Last Changed or Threshold) must be provided.";
  }
  return null;
}

export function AddMaintenanceFilterModal({
  open,
  onOpenChange,
  title,
  maxLastChanged,
  onAdd,
  error: parentError,
}: AddMaintenanceFilterModalProps) {
  const isMobile = useIsMobile();
  const [lastChanged, setLastChanged] = useState("");
  const [threshold, setThreshold] = useState("");
  const [filterNumber, setFilterNumber] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const displayError = localError ?? parentError ?? null;

  const resetForm = () => {
    setLastChanged("");
    setThreshold("");
    setFilterNumber("");
    setLocalError(null);
  };

  const handleClose = () => {
    if (!isPending) {
      resetForm();
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateFilterForm(lastChanged, threshold);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);
    setIsPending(true);
    try {
      await onAdd({
        lastChanged: lastChanged.trim(),
        threshold: threshold.trim(),
        filterNumber: filterNumber.trim(),
      });
      resetForm();
      onOpenChange(false);
    } catch {
      setLocalError("Failed to add filter.");
    } finally {
      setIsPending(false);
    }
  };

  const focusField = (element: HTMLInputElement | null) => {
    if (isMobile && element) {
      element.focus();
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelDisabled={isPending}
      isOpen={open}
      isSubmitting={isPending}
      submitLabel={isPending ? "Adding..." : "Add"}
      title={title}
      width={480}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <Input
        inputMode="numeric"
        label="Last Changed"
        max={maxLastChanged}
        min={0}
        placeholder="e.g. 1200"
        type="number"
        value={lastChanged}
        onChange={(event) => {
          setLastChanged(event.target.value);
          setLocalError(null);
        }}
        onFocus={(event) => focusField(event.currentTarget)}
      />
      <Input
        inputMode="numeric"
        label="Threshold"
        min={0}
        placeholder="e.g. 250"
        type="number"
        value={threshold}
        onChange={(event) => {
          setThreshold(event.target.value);
          setLocalError(null);
        }}
        onFocus={(event) => focusField(event.currentTarget)}
      />
      <Input
        helperText="Optional"
        label="Filter Number"
        placeholder="e.g. FF-3289R"
        value={filterNumber}
        onChange={(event) => setFilterNumber(event.target.value)}
        onFocus={(event) => focusField(event.currentTarget)}
      />
      {displayError ? (
        <p className="text-feedback-error text-sm">{displayError}</p>
      ) : null}
    </AppFormModal>
  );
}
