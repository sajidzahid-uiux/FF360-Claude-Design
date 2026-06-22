"use client";

import { useCallback, useRef, useState } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Trash2, Upload } from "lucide-react";

import { DesignRequestService } from "@/api/services";
import type {
  DesignRequestThreadItem,
  SharedDesignOutput,
} from "@/api/types/designRequest";
import { QUERY_KEYS } from "@/constants";

import { useDesignRequestPanelRequestId } from "../../../hooks/useDesignRequestPanelRequestId";
import {
  DESIGN_REQUEST_NOTE_ALLOWED_EXTENSIONS,
  DESIGN_REQUEST_NOTE_FILE_MAX_BYTES,
} from "../../../lib/constants";
import { isDesignRequestThreadReadOnly } from "../../../lib/design-request-status";
import { formatMaxFileSize } from "../../../lib/format-max-file-size";
import {
  validateNoteInput,
  validateSubmitFiles,
} from "../../../lib/validate-design-request-form";
import { useDesignRequestPanelScope } from "../../../model/design-request-panel-store";
import { SharedDesignOutputSection } from "./SharedDesignOutputSection";

function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null) return "";
  return formatMaxFileSize(bytes);
}

export interface DesignRequestFilesTabProps {
  notes: DesignRequestThreadItem[];
  canUpload: boolean;
  requestStatus: string;
  sharedOutput: SharedDesignOutput | null | undefined;
  sharedOutputLoading: boolean;
  sharedOutputError: boolean;
  sharedOutputForbidden: boolean;
}

export function DesignRequestFilesTab({
  notes,
  canUpload,
  requestStatus,
  sharedOutput,
  sharedOutputLoading,
  sharedOutputError,
  sharedOutputForbidden,
}: DesignRequestFilesTabProps) {
  const scope = useDesignRequestPanelScope();
  const queryClient = useQueryClient();
  const organizationId = scope?.organizationId;
  const requestId = useDesignRequestPanelRequestId();

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const readOnly = isDesignRequestThreadReadOnly(requestStatus);
  const notesWithFiles = notes.filter(
    (note) => note.file != null || note.extra_files.length > 0
  );

  const refreshThread = useCallback(() => {
    if (!organizationId || requestId == null) return;
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.DESIGN_REQUEST_NOTES, organizationId, requestId],
    });
    void queryClient.invalidateQueries({
      queryKey: [
        QUERY_KEYS.DESIGN_REQUEST_SHARED_OUTPUT,
        organizationId,
        requestId,
      ],
    });
  }, [organizationId, queryClient, requestId]);

  const handleUpload = useCallback(
    async (fileList: FileList | null) => {
      if (!organizationId || requestId == null) return;
      const file = fileList?.[0];
      if (!file) return;
      const validationError =
        validateNoteInput("", file) ??
        validateSubmitFiles(
          [file],
          DESIGN_REQUEST_NOTE_ALLOWED_EXTENSIONS,
          DESIGN_REQUEST_NOTE_FILE_MAX_BYTES
        );
      if (validationError) {
        setError(validationError);
        return;
      }
      setUploading(true);
      setError(null);
      try {
        await DesignRequestService.createNote(organizationId, requestId, {
          file,
        });
        refreshThread();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [organizationId, refreshThread, requestId]
  );

  const handleDeleteNote = useCallback(
    async (noteId: number) => {
      if (!organizationId || requestId == null) return;
      setDeletingNoteId(noteId);
      setError(null);
      try {
        await DesignRequestService.deleteNote(
          organizationId,
          requestId,
          noteId
        );
        refreshThread();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Delete failed.");
      } finally {
        setDeletingNoteId(null);
      }
    },
    [organizationId, refreshThread, requestId]
  );

  const hasThreadFiles = notesWithFiles.length > 0;
  const hasSharedSection =
    sharedOutputLoading ||
    sharedOutputForbidden ||
    sharedOutputError ||
    sharedOutput != null;

  return (
    <div className="space-y-5">
      {canUpload ? (
        <button
          className="border-border-subtle hover:bg-bg-hover flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors"
          disabled={uploading}
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          <Upload aria-hidden className="text-text-muted h-8 w-8" />
          <span className="text-text-primary text-sm font-medium">
            Upload File
          </span>
          <span className="text-text-muted text-xs">
            Click to choose a file · max{" "}
            {formatMaxFileSize(DESIGN_REQUEST_NOTE_FILE_MAX_BYTES)}
          </span>
          <input
            ref={inputRef}
            accept={DESIGN_REQUEST_NOTE_ALLOWED_EXTENSIONS.join(",")}
            className="hidden"
            type="file"
            onChange={(e) => void handleUpload(e.target.files)}
          />
        </button>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {hasSharedSection ? (
        <SharedDesignOutputSection
          isError={sharedOutputError}
          isForbidden={sharedOutputForbidden}
          isLoading={sharedOutputLoading}
          sharedOutput={sharedOutput}
        />
      ) : null}

      {hasThreadFiles ? (
        <section>
          <h4 className="text-text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
            Thread Files
          </h4>
          <ul className="space-y-2">
            {notesWithFiles.map((note, index) => {
              const files = [
                ...(note.file ? [note.file] : []),
                ...note.extra_files,
              ];
              const key = note.id ?? `initial-files-${index}`;
              return files.map((file) => (
                <li
                  key={`${key}-${file.original_filename}`}
                  className="bg-bg-hover flex items-center gap-3 rounded-lg px-3 py-2"
                >
                  <FileText
                    aria-hidden
                    className="text-text-muted h-5 w-5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    {file.download_url ? (
                      <a
                        className="text-text-primary truncate text-sm font-medium hover:underline"
                        href={file.download_url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {file.original_filename}
                      </a>
                    ) : (
                      <span className="text-text-primary truncate text-sm font-medium">
                        {file.original_filename}
                      </span>
                    )}
                    <p className="text-text-muted text-xs">
                      {note.posted_by_name}
                      {note.is_initial ? " · initial request" : ""}
                      {file.file_size_bytes != null
                        ? ` · ${formatFileSize(file.file_size_bytes)}`
                        : ""}
                    </p>
                  </div>
                  {note.can_delete && note.id != null ? (
                    <button
                      aria-label={`Delete ${file.original_filename}`}
                      className="text-text-muted hover:text-text-primary shrink-0 rounded p-1 disabled:opacity-40"
                      disabled={deletingNoteId === note.id}
                      type="button"
                      onClick={() => void handleDeleteNote(note.id!)}
                    >
                      <Trash2 aria-hidden className="h-4 w-4" />
                    </button>
                  ) : null}
                </li>
              ));
            })}
          </ul>
        </section>
      ) : null}

      {!hasThreadFiles && !hasSharedSection ? (
        <p className="text-text-muted text-sm">No files uploaded yet.</p>
      ) : null}

      {readOnly && !canUpload ? (
        <p className="text-text-muted text-sm">
          This request is read-only. Uploaded files remain available for
          download.
        </p>
      ) : null}

      {uploading ? (
        <Button
          disabled
          loading
          aria-label="Uploading..."
          title="Uploading..."
          variant={ButtonVariantEnum.GHOST}
        />
      ) : null}
    </div>
  );
}
