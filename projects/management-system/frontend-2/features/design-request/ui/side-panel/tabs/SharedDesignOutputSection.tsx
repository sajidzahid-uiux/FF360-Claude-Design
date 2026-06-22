"use client";

import { useCallback, useState } from "react";

import { formatDate } from "date-fns";
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

import type {
  SharedDesignFile,
  SharedDesignOutput,
} from "@/api/types/designRequest";
import { MediaViewer } from "@/features/equipment/ui";

import { formatMaxFileSize } from "../../../lib/format-max-file-size";
import {
  canPreviewSharedDesignPdf,
  getSharedDesignFileErrorMessage,
  getSharedDesignFileTypeLabel,
  getSharedDesignOutputEmptyMessage,
  isSharedDesignFileFailed,
  isSharedDesignFileReady,
} from "../../../lib/shared-design-output";

export interface SharedDesignOutputSectionProps {
  sharedOutput: SharedDesignOutput | null | undefined;
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
}

function SharedDesignFileIcon({
  fileType,
}: {
  fileType: SharedDesignFile["file_type"];
}) {
  const className = "h-5 w-5 shrink-0";
  switch (fileType) {
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

function SharedDesignOutputFileRow({ file }: { file: SharedDesignFile }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const isReady = isSharedDesignFileReady(file);
  const isFailed = isSharedDesignFileFailed(file);
  const isProcessing = file.ingest_status === "pending";
  const canPreview = canPreviewSharedDesignPdf(file);

  const handleDownload = useCallback(async () => {
    if (!file.download_url) return;
    try {
      const response = await fetch(file.download_url);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const blob = await response.blob();
      saveAs(blob, file.original_filename || `design.${file.file_type}`);
    } catch {
      window.open(file.download_url, "_blank", "noopener,noreferrer");
    }
  }, [file.download_url, file.file_type, file.original_filename]);

  return (
    <>
      <li className="bg-bg-hover flex items-center gap-3 rounded-lg px-3 py-2">
        <SharedDesignFileIcon fileType={file.file_type} />
        <div className="min-w-0 flex-1">
          <p className="text-text-primary truncate text-sm font-medium">
            {file.original_filename ||
              getSharedDesignFileTypeLabel(file.file_type)}
          </p>
          <p className="text-text-muted text-xs">
            {getSharedDesignFileTypeLabel(file.file_type)}
            {file.file_size_bytes != null
              ? ` · ${formatMaxFileSize(file.file_size_bytes)}`
              : ""}
            {isProcessing ? " · processing" : ""}
          </p>
          {isFailed ? (
            <p className="mt-1 flex items-start gap-1 text-xs text-red-600">
              <AlertCircle
                aria-hidden
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
              />
              <span>{getSharedDesignFileErrorMessage(file)}</span>
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isProcessing ? (
            <Loader2
              aria-label="Processing file"
              className="text-text-muted h-4 w-4 animate-spin"
            />
          ) : null}
          {canPreview ? (
            <button
              aria-label={`View ${file.original_filename}`}
              className="text-text-muted hover:text-text-primary rounded p-1"
              type="button"
              onClick={() => setViewerOpen(true)}
            >
              <Eye aria-hidden className="h-4 w-4" />
            </button>
          ) : null}
          {isReady ? (
            <button
              aria-label={`Download ${file.original_filename}`}
              className="text-text-muted hover:text-text-primary rounded p-1"
              type="button"
              onClick={() => void handleDownload()}
            >
              <Download aria-hidden className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </li>
      {canPreview && file.download_url ? (
        <MediaViewer
          open={viewerOpen}
          title={file.original_filename}
          type="pdf"
          url={file.download_url}
          onOpenChange={setViewerOpen}
        />
      ) : null}
    </>
  );
}

export function SharedDesignOutputSection({
  sharedOutput,
  isLoading,
  isError,
  isForbidden,
}: SharedDesignOutputSectionProps) {
  const emptyMessage = getSharedDesignOutputEmptyMessage(sharedOutput, {
    isLoading,
    isError,
    isForbidden,
  });

  if (isLoading) {
    return (
      <section>
        <h4 className="text-text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
          Shared Design Files
        </h4>
        <p className="text-text-muted flex items-center gap-2 text-sm">
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          Loading shared design files…
        </p>
      </section>
    );
  }

  if (emptyMessage && !sharedOutput?.files?.length) {
    return (
      <section>
        <h4 className="text-text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
          Shared Design Files
        </h4>
        <p className="text-text-muted text-sm">{emptyMessage}</p>
      </section>
    );
  }

  if (!sharedOutput?.files?.length) {
    return null;
  }

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-text-muted text-xs font-semibold tracking-wide uppercase">
          Shared Design Files
        </h4>
        <p className="text-text-muted text-xs">
          Shared by {sharedOutput.shared_by_name || "FieldFlow360"}
          {sharedOutput.shared_at
            ? ` · ${formatDate(new Date(sharedOutput.shared_at), "MMM d, yyyy")}`
            : ""}
        </p>
      </div>
      {sharedOutput.ingest_status === "processing" ? (
        <p className="text-text-muted mb-2 text-xs">
          Files are still processing. Map overlays and downloads will appear
          when ready.
        </p>
      ) : null}
      {sharedOutput.ingest_status === "partial" ? (
        <p className="mb-2 text-xs text-amber-700">
          Some shared files could not be processed. Ready files remain available
          below.
        </p>
      ) : null}
      <ul className="space-y-2">
        {sharedOutput.files.map((file) => (
          <SharedDesignOutputFileRow
            key={`${file.file_type}-${file.original_filename}`}
            file={file}
          />
        ))}
      </ul>
      {emptyMessage ? (
        <p className="text-text-muted mt-2 text-xs">{emptyMessage}</p>
      ) : null}
    </section>
  );
}
