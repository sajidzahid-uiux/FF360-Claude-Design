"use client";

import { useCallback, useId, useRef, useState } from "react";

import { cn } from "@fieldflow360/org-ui";
import { Upload } from "lucide-react";

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface FilesDragDropZoneProps {
  disabled?: boolean;
  uploading?: boolean;
  onFileSelect: (file: File) => void;
}

export function FilesDragDropZone({
  disabled = false,
  uploading = false,
  onFileSelect,
}: FilesDragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validateAndSelect = useCallback(
    (file: File | undefined) => {
      if (!file || disabled || uploading) return;
      setError("");
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
        return;
      }
      onFileSelect(file);
    },
    [disabled, onFileSelect, uploading]
  );

  const openFilePicker = () => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (disabled || uploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;
    validateAndSelect(event.dataTransfer.files?.[0]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSelect(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <div className="w-full space-y-2">
      <div
        className={cn(
          "relative flex min-h-[9.5rem] w-full flex-col items-center justify-center gap-2 border-2 border-dashed px-6 py-8 text-center transition-colors",
          isDragging
            ? "border-accent bg-accent-light"
            : error
              ? "border-[var(--color-feedback-error)] bg-[var(--color-feedback-error-soft)]"
              : "border-border-subtle bg-bg-surface-elevated"
        )}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className="hidden"
          disabled={disabled || uploading}
          id={inputId}
          type="file"
          onChange={handleInputChange}
        />

        {uploading ? (
          <div className="text-text-secondary text-sm font-medium">
            Uploading…
          </div>
        ) : (
          <>
            <button
              aria-label="Select file"
              className="border-border-subtle bg-bg-surface text-text-primary rounded-lg border p-3 transition-colors"
              disabled={disabled}
              type="button"
              onClick={openFilePicker}
            >
              <Upload aria-hidden className="h-7 w-7" strokeWidth={2} />
            </button>
            <p className="text-text-primary text-lg font-semibold">
              Drag &amp; Drop Files Here
            </p>
            <p className="text-text-muted text-sm">
              or click{" "}
              <button
                className="text-accent font-medium hover:underline"
                disabled={disabled}
                type="button"
                onClick={openFilePicker}
              >
                Upload File
              </button>{" "}
              to browse your device
            </p>
          </>
        )}
      </div>
      {error ? (
        <p className="text-sm text-[var(--color-feedback-error)]">{error}</p>
      ) : null}
    </div>
  );
}
