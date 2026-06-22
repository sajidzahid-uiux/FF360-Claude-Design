"use client";

import { useCallback, useState } from "react";

import { saveAs } from "file-saver";
import {
  AlertCircle,
  Download,
  Eye,
  FileArchive,
  FileText,
  Loader2,
  Map,
} from "lucide-react";

import { MediaViewer } from "@/features/equipment/ui";

import type { Ff360DesignFileItem } from "../../hooks/useJobLeadFf360DesignFiles";
import { formatMaxFileSize } from "../../lib/format-max-file-size";
import {
  canPreviewSharedDesignPdf,
  getSharedDesignFileErrorMessage,
  getSharedDesignFileTypeLabel,
  isSharedDesignFileFailed,
  isSharedDesignFileReady,
} from "../../lib/shared-design-output";

function FileTypeIcon({ file }: { file: Ff360DesignFileItem }) {
  const className = "h-4 w-4 shrink-0";
  if (file.source === "thread") {
    return <FileText aria-hidden className={`${className} text-text-muted`} />;
  }
  switch (file.fileType) {
    case "pdf":
      return <FileText aria-hidden className={`${className} text-red-500`} />;
    case "xml":
      return <Map aria-hidden className={`${className} text-sky-600`} />;
    case "shp":
      return (
        <FileArchive aria-hidden className={`${className} text-violet-600`} />
      );
    default:
      return (
        <FileText aria-hidden className={`${className} text-text-muted`} />
      );
  }
}

export function Ff360DesignFileRow({ file }: { file: Ff360DesignFileItem }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const isShared = file.source === "shared";
  const isReady = isShared
    ? isSharedDesignFileReady({
        file_type: file.fileType === "attachment" ? "pdf" : file.fileType,
        original_filename: file.originalFilename,
        file_size_bytes: file.fileSizeBytes,
        ingest_status: file.ingestStatus ?? "ready",
        error_message: file.errorMessage ?? null,
        download_url: file.downloadUrl,
      })
    : Boolean(file.downloadUrl);
  const isFailed =
    isShared &&
    isSharedDesignFileFailed({
      file_type: file.fileType === "attachment" ? "pdf" : file.fileType,
      original_filename: file.originalFilename,
      file_size_bytes: file.fileSizeBytes,
      ingest_status: file.ingestStatus ?? "pending",
      error_message: file.errorMessage ?? null,
      download_url: file.downloadUrl,
    });
  const isProcessing = isShared && file.ingestStatus === "pending";
  const canPreview =
    isShared &&
    file.fileType === "pdf" &&
    canPreviewSharedDesignPdf({
      file_type: "pdf",
      original_filename: file.originalFilename,
      file_size_bytes: file.fileSizeBytes,
      ingest_status: file.ingestStatus ?? "pending",
      error_message: file.errorMessage ?? null,
      download_url: file.downloadUrl,
    });

  const handleDownload = useCallback(async () => {
    if (!file.downloadUrl) return;
    try {
      const response = await fetch(file.downloadUrl);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const blob = await response.blob();
      saveAs(blob, file.originalFilename);
    } catch {
      window.open(file.downloadUrl, "_blank", "noopener,noreferrer");
    }
  }, [file.downloadUrl, file.originalFilename]);

  const typeLabel =
    file.source === "thread"
      ? "Request attachment"
      : getSharedDesignFileTypeLabel(
          file.fileType === "attachment" ? "pdf" : file.fileType
        );

  return (
    <>
      <div className="bg-bg-app border-border-subtle flex items-center gap-2 rounded-lg border px-3 py-2">
        <FileTypeIcon file={file} />
        <div className="min-w-0 flex-1">
          {file.downloadUrl ? (
            <a
              className="text-text-primary block truncate text-sm font-medium hover:underline"
              href={file.downloadUrl}
              rel="noreferrer"
              target="_blank"
            >
              {file.originalFilename}
            </a>
          ) : (
            <p className="text-text-primary truncate text-sm font-medium">
              {file.originalFilename}
            </p>
          )}
          <p className="text-text-muted truncate text-xs">
            {typeLabel}
            {file.fileSizeBytes != null
              ? ` · ${formatMaxFileSize(file.fileSizeBytes)}`
              : ""}
            {file.postedByName ? ` · ${file.postedByName}` : ""}
            {isProcessing ? " · processing" : ""}
          </p>
          {isFailed ? (
            <p className="mt-1 flex items-start gap-1 text-xs text-red-600">
              <AlertCircle
                aria-hidden
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
              />
              <span>
                {getSharedDesignFileErrorMessage({
                  file_type:
                    file.fileType === "attachment" ? "pdf" : file.fileType,
                  original_filename: file.originalFilename,
                  file_size_bytes: file.fileSizeBytes,
                  ingest_status: file.ingestStatus ?? "failed",
                  error_message: file.errorMessage ?? null,
                  download_url: file.downloadUrl,
                })}
              </span>
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {isProcessing ? (
            <Loader2
              aria-label="Processing file"
              className="text-text-muted h-4 w-4 animate-spin"
            />
          ) : null}
          {canPreview ? (
            <button
              aria-label={`View ${file.originalFilename}`}
              className="text-text-muted hover:text-text-primary rounded p-1"
              type="button"
              onClick={() => setViewerOpen(true)}
            >
              <Eye aria-hidden className="h-4 w-4" />
            </button>
          ) : null}
          {isReady ? (
            <button
              aria-label={`Download ${file.originalFilename}`}
              className="text-text-muted hover:text-text-primary rounded p-1"
              type="button"
              onClick={() => void handleDownload()}
            >
              <Download aria-hidden className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
      {canPreview && file.downloadUrl ? (
        <MediaViewer
          open={viewerOpen}
          title={file.originalFilename}
          type="pdf"
          url={file.downloadUrl}
          onOpenChange={setViewerOpen}
        />
      ) : null}
    </>
  );
}
