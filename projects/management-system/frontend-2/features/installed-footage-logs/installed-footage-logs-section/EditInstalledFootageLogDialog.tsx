"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { AppFormModal, Dropdown, Input } from "@fieldflow360/org-ui";

import type {
  InstalledFootageLogEntry,
  UpdateInstalledFootageLogBody,
} from "@/api/types/installedFootageLogs";
import { WALL_TYPE_LABELS, WallType } from "@/constants";
import { useMainPipeSizes } from "@/hooks";

function toDateInputValue(isoOrDate: string): string {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return isoOrDate.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export interface EditInstalledFootageLogDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  entry: InstalledFootageLogEntry;
  disabled?: boolean;
  onSave: (body: UpdateInstalledFootageLogBody) => void | Promise<void>;
}

export function EditInstalledFootageLogDialog({
  open = true,
  onOpenChange,
  entry,
  disabled = false,
  onSave,
}: EditInstalledFootageLogDialogProps) {
  const [date, setDate] = useState("");
  const [installed, setInstalled] = useState("");
  const [size, setSize] = useState("");
  const [wallType, setWallType] = useState<string>(WallType.SINGLE_WALL);
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: mainPipeSizes } = useMainPipeSizes(wallType as WallType);

  useEffect(() => {
    if (open && entry) {
      setDate(toDateInputValue(entry.date));
      if (entry.log_type === "main") {
        setInstalled(String(entry.installed ?? ""));
        setSize(
          entry.size != null && entry.size !== "" ? String(entry.size) : ""
        );
        setWallType(
          entry.pipe_wall_type === WallType.DUAL_WALL
            ? WallType.DUAL_WALL
            : WallType.SINGLE_WALL
        );
      } else if (entry.log_type === "lateral") {
        setInstalled(String(entry.installed ?? ""));
      } else {
        setQuantity(String(entry.quantity ?? ""));
      }
    }
  }, [open, entry]);

  const title =
    entry.log_type === "main"
      ? "Edit main line entry"
      : entry.log_type === "lateral"
        ? "Edit lateral line entry"
        : "Edit raisers entry";

  const canSubmit = useMemo(() => {
    if (disabled || submitting) return false;
    if (entry.log_type === "main" || entry.log_type === "lateral") {
      const ins = parseFloat(installed);
      return !isNaN(ins) && ins > 0;
    }
    const q = parseInt(quantity, 10);
    return !isNaN(q) && q >= 0;
  }, [disabled, entry.log_type, installed, quantity, submitting]);

  async function handleSave() {
    const base: UpdateInstalledFootageLogBody = {
      date: date ? new Date(date).toISOString().slice(0, 10) : undefined,
    };
    if (entry.log_type === "main") {
      const ins = parseFloat(installed);
      if (isNaN(ins) || ins <= 0) return;
      setSubmitting(true);
      try {
        await onSave({
          ...base,
          installed: ins,
          size: size.trim() || null,
          pipe_wall_type: wallType,
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (entry.log_type === "lateral") {
      const ins = parseFloat(installed);
      if (isNaN(ins) || ins <= 0) return;
      setSubmitting(true);
      try {
        await onSave({
          ...base,
          installed: ins,
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }
    const q = parseInt(quantity, 10);
    if (isNaN(q) || q < 0) return;
    setSubmitting(true);
    try {
      await onSave({
        ...base,
        quantity: q,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await handleSave();
  };

  const handleClose = () => {
    if (!submitting) {
      onOpenChange?.(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={open}
      isSubmitting={submitting}
      submitDisabled={!canSubmit}
      submitLabel="Save"
      title={title}
      width={448}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4">
        <Input
          disabled={disabled || submitting}
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {entry.log_type === "main" ? (
          <>
            <Input
              disabled={disabled || submitting}
              label="Installed (ft)"
              min="0"
              step="0.01"
              type="number"
              value={installed}
              onChange={(e) => setInstalled(e.target.value)}
            />
            <Dropdown
              fullWidth
              disabled={disabled || submitting}
              label="Pipe wall type"
              options={Object.values(WallType).map((wallTypeValue) => ({
                value: wallTypeValue,
                label: WALL_TYPE_LABELS[wallTypeValue],
              }))}
              placeholder="Select wall type"
              value={wallType}
              onChange={(val) => {
                setWallType(val);
                setSize("");
              }}
            />
            <Dropdown
              fullWidth
              disabled={disabled || submitting || !mainPipeSizes?.length}
              label="Size"
              options={(mainPipeSizes ?? []).map(
                ([value, label]: [string, string]) => ({
                  value,
                  label,
                })
              )}
              placeholder="Select size"
              value={size || undefined}
              onChange={setSize}
            />
          </>
        ) : entry.log_type === "lateral" ? (
          <Input
            disabled={disabled || submitting}
            label="Installed (ft)"
            min="0"
            step="0.01"
            type="number"
            value={installed}
            onChange={(e) => setInstalled(e.target.value)}
          />
        ) : (
          <Input
            disabled={disabled || submitting}
            label="Quantity"
            min="0"
            step="1"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        )}
      </div>
    </AppFormModal>
  );
}
