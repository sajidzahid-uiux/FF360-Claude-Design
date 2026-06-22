"use client";

import { DownloadedFile, FileUpload, Input } from "@fieldflow360/org-ui";
import { AlignLeft, Mail, Phone, User } from "lucide-react";

import type { QuickActionFile } from "@/api/types";
import {
  DEFAULT_QUICK_ACTION_FORM_VALUES,
  QUICK_ACTION_FIELD_LIMITS,
  type QuickActionFormValues,
} from "@/features/quick-actions/model/quickActionForm";

function CharCount({ current, max }: { current: number; max: number }) {
  return (
    <p className="text-text-muted text-xs">
      {current}/{max}
    </p>
  );
}

export interface QuickActionFormFieldsProps {
  value: QuickActionFormValues;
  onChange: (value: QuickActionFormValues) => void;
  fieldErrors: Record<string, string>;
  onFieldChange?: (field: keyof QuickActionFormValues) => void;
  existingFiles?: QuickActionFile[];
  removedExistingFileIds?: number[];
  onRemoveExistingFile?: (fileId: number) => void;
  newFilesLabel?: string;
}

export function QuickActionFormFields({
  value,
  onChange,
  fieldErrors,
  onFieldChange,
  existingFiles = [],
  removedExistingFileIds = [],
  onRemoveExistingFile,
  newFilesLabel = "Upload Files",
}: QuickActionFormFieldsProps) {
  const formData = value ?? DEFAULT_QUICK_ACTION_FORM_VALUES;
  const removedIds = new Set(removedExistingFileIds);
  const visibleExistingFiles = existingFiles.filter(
    (file) => !removedIds.has(file.id)
  );

  const updateField = (
    field: keyof Omit<QuickActionFormValues, "files">,
    nextValue: string
  ) => {
    const limit = QUICK_ACTION_FIELD_LIMITS[field];
    if (nextValue.length > limit) return;

    onChange({ ...formData, [field]: nextValue });
    onFieldChange?.(field);
  };

  const appendFiles = (added: File[]) => {
    if (added.length === 0) return;
    onChange({ ...formData, files: [...formData.files, ...added] });
    onFieldChange?.("files");
  };

  const removeNewFile = (fileToRemove: File) => {
    onChange({
      ...formData,
      files: formData.files.filter((file) => file !== fileToRemove),
    });
    onFieldChange?.("files");
  };

  return (
    <div className="space-y-4">
      <p className="text-text-muted text-xs leading-snug">
        <span className="text-feedback-error">*</span> At least one of name,
        phone, email, or description is required. You may also attach files.
      </p>
      <Input
        error={fieldErrors.name}
        label="Name *"
        leftIcon={<User aria-hidden className="h-4 w-4" strokeWidth={2} />}
        maxLength={QUICK_ACTION_FIELD_LIMITS.name}
        placeholder="Enter name"
        value={formData.name}
        onChange={(event) => updateField("name", event.target.value)}
      />
      <Input
        error={fieldErrors.phone_number}
        label="Phone Number *"
        leftIcon={<Phone aria-hidden className="h-4 w-4" strokeWidth={2} />}
        maxLength={QUICK_ACTION_FIELD_LIMITS.phone_number}
        placeholder="Enter phone number"
        type="tel"
        value={formData.phone_number}
        onChange={(event) => updateField("phone_number", event.target.value)}
      />
      <Input
        error={fieldErrors.email}
        label="Email *"
        leftIcon={<Mail aria-hidden className="h-4 w-4" strokeWidth={2} />}
        maxLength={QUICK_ACTION_FIELD_LIMITS.email}
        placeholder="Enter email"
        type="email"
        value={formData.email}
        onChange={(event) => updateField("email", event.target.value)}
      />
      <div className="space-y-1.5">
        <label
          className="text-text-primary block text-sm font-medium"
          htmlFor="quick-action-description"
        >
          <span className="inline-flex items-center gap-2">
            <AlignLeft aria-hidden className="h-4 w-4" strokeWidth={2} />
            Description *
          </span>
        </label>
        <textarea
          className="border-border-subtle bg-bg-surface-elevated text-text-primary focus:ring-accent/35 min-h-[88px] w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
          id="quick-action-description"
          maxLength={QUICK_ACTION_FIELD_LIMITS.description}
          placeholder="Enter description"
          value={formData.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
        <CharCount
          current={formData.description.length}
          max={QUICK_ACTION_FIELD_LIMITS.description}
        />
      </div>

      {visibleExistingFiles.length > 0 ? (
        <div className="space-y-2">
          <p className="text-text-primary text-sm font-medium">
            Attached files
          </p>
          <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
            {visibleExistingFiles.map((file) => (
              <DownloadedFile
                key={file.id}
                className="w-full max-w-none"
                fileName={file.title || "File"}
                uploadedDate={file.uploaded_at}
                onDelete={
                  onRemoveExistingFile
                    ? () => onRemoveExistingFile(file.id)
                    : undefined
                }
                onView={() =>
                  window.open(file.url, "_blank", "noopener,noreferrer")
                }
              />
            ))}
          </div>
        </div>
      ) : null}

      <FileUpload
        multiple
        accept="*/*"
        disableDragDrop={false}
        files={formData.files}
        label={newFilesLabel}
        uploadSubtitle="Click to browse or drag and drop"
        uploadTitle={newFilesLabel}
        onFileChange={() => {}}
        onFilesChange={appendFiles}
        onRemoveFile={removeNewFile}
      />
    </div>
  );
}
