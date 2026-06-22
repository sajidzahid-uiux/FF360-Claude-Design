"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { AppFormModal, ColorPicker, Input } from "@fieldflow360/org-ui";
import { Tags } from "lucide-react";

import type { ProjectTypeCategory } from "@/api/types";
import { JobOrLeadType } from "@/constants";

import type { ProjectTypeFormValues } from "../model/types";

const MAX_NAME_LENGTH = 150;
const DEFAULT_COLOR = "#A855F7";

export interface ProjectTypeModalProps {
  open: boolean;
  mode: "add" | "edit";
  initialData?: Partial<ProjectTypeFormValues> & { is_default?: boolean };
  defaultCategory?: ProjectTypeCategory;
  canEdit?: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ProjectTypeFormValues) => void | Promise<void>;
}

export function ProjectTypeModal({
  open,
  mode,
  initialData,
  defaultCategory,
  canEdit = true,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: ProjectTypeModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [nameError, setNameError] = useState("");

  const category =
    initialData?.category ?? defaultCategory ?? JobOrLeadType.REPAIR;
  const isDefault = Boolean(initialData?.is_default);
  const nameDisabled = !canEdit || (mode === "edit" && isDefault);

  useEffect(() => {
    if (!open) return;
    setName(initialData?.name ?? "");
    setColor(initialData?.color ?? DEFAULT_COLOR);
    setNameError("");
  }, [initialData?.color, initialData?.name, open]);

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const validate = (): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required");
      return false;
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      setNameError(`Maximum ${MAX_NAME_LENGTH} characters`);
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({
      id: initialData?.id,
      name: name.trim(),
      color,
      category,
    });
  };

  const canSubmit = useMemo(() => {
    if (!canEdit || nameDisabled) return false;
    return Boolean(name.trim()) && !nameError;
  }, [canEdit, name, nameDisabled, nameError]);

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={open}
      isSubmitting={isSubmitting}
      maxHeight="calc(100vh - 4rem)"
      submitDisabled={!canSubmit}
      submitLabel={mode === "add" ? "Add" : "Save"}
      title={mode === "add" ? "Add project type" : "Edit project type"}
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
              {name.trim() || "Project type"}
            </span>
          </div>
        </div>

        <Input
          required
          disabled={nameDisabled}
          error={nameError}
          helperText={`${name.length}/${MAX_NAME_LENGTH} characters`}
          label="Name"
          leftIcon={<Tags aria-hidden className="h-4 w-4" strokeWidth={2} />}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Project type name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (nameError) setNameError("");
          }}
        />

        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-1.5">
            <div>
              <p className="text-text-primary text-sm font-medium">Color</p>
              <p className="text-text-muted mt-0.5 text-xs">
                Shown on cards and filters.
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
            <ColorPicker
              disabled={!canEdit}
              showHeader={false}
              value={color}
              onChange={setColor}
            />
          </div>
        </div>
      </div>
    </AppFormModal>
  );
}
