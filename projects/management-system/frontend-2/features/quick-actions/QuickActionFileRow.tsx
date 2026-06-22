"use client";

import { useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import { Download, Eye, FileText, Trash2 } from "lucide-react";

import type { QuickActionFile } from "@/api/types";
import { MediaViewer } from "@/features/equipment/ui";

/**
 * "compact"  — used inside convert forms (muted bg, smaller padding, filename as link).
 * "card"     — used inside the detail view card (card bg, larger padding).
 */
export function QuickActionFileRow({
  file,
  variant = "compact",
  jobTitle,
  onView,
  onDownload,
  onDelete,
}: {
  file: QuickActionFile;
  variant?: "compact" | "card";
  /** Optional job/context title to prefix the downloaded filename (same as FileCard). */
  jobTitle?: string;
  onView?: () => void;
  onDownload?: () => void;
  /** When provided, a delete button is shown. */
  onDelete?: (fileId: number) => void;
}) {
  const [viewerOpen, setViewerOpen] = useState(false);

  const dateStr = file.uploaded_at
    ? format(new Date(file.uploaded_at), "MMM d, yyyy")
    : "—";

  const previewType = useMemo<"image" | "pdf" | null>(() => {
    const fileUrl = (file as { file?: string; url: string }).file || file.url;
    const urlParts = fileUrl.split("/");
    const filename = urlParts[urlParts.length - 1] || "";
    const extension =
      filename
        .split("?")[0]
        .toLowerCase()
        .match(/\.[^.]*$/)?.[0] || "";

    if (extension === ".pdf") return "pdf";
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extension)) {
      return "image";
    }
    return null;
  }, [file]);

  const handleView = () =>
    onView
      ? onView()
      : previewType
        ? setViewerOpen(true)
        : window.open(file.url, "_blank");

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }
    try {
      // Use file.file or file.url for the download URL (same as FileCard)
      const fileUrl = (file as { file?: string; url: string }).file || file.url;
      // Fetch the file as a blob
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Use file title as filename, but preserve file extension from URL
      const urlParts = fileUrl.split("/");
      let urlFilename = urlParts[urlParts.length - 1] || "download";

      // Remove query parameters from filename (e.g., AWS S3 signed URL parameters)
      urlFilename = urlFilename.split("?")[0];

      // Extract file extension from URL (stop at first ? or & to avoid AWS parameters)
      const extensionMatch = urlFilename.match(/\.[^.]*$/);
      const extension = extensionMatch ? extensionMatch[0] : "";

      // Use file title/displayTitle as the base filename
      const baseFilename =
        file.title ||
        (file as { displayTitle?: string }).displayTitle ||
        "download";
      const titleLower = baseFilename.toLowerCase();

      // Determine if file is onecall or contractor (same logic as FileCard)
      let fileTypePrefix = "";
      const fileWithFlags = file as {
        farmer_file?: boolean;
        diggs_file?: boolean;
      };
      const hasJobLeadFlags =
        fileWithFlags.farmer_file !== undefined ||
        fileWithFlags.diggs_file !== undefined;
      if (
        titleLower.includes("one_call_file") ||
        titleLower.includes("one_call_")
      ) {
        fileTypePrefix = "onecall_";
      } else if (
        titleLower.includes("contractor_") ||
        (hasJobLeadFlags &&
          !fileWithFlags.farmer_file &&
          !fileWithFlags.diggs_file)
      ) {
        fileTypePrefix = "contractor_";
      }

      // Remove prefixes from filename
      const cleanFilename = baseFilename
        .replace(/^one_call_file_?/i, "")
        .replace(/^contractor_/i, "")
        .replace(/^farmer_/i, "");

      // Combine jobTitle with filename if provided
      const filename = jobTitle
        ? `${jobTitle}-${fileTypePrefix}${cleanFilename}${extension}`
        : `${fileTypePrefix}${cleanFilename}${extension}`;

      // Use saveAs to download the file
      saveAs(blob, filename);
    } catch (error) {
      console.error("Error downloading file:", error);
      // Fallback to opening in new tab if download fails
      window.open(file.url, "_blank");
    }
  };

  return (
    <div
      className={cn(
        "border-border-subtle flex items-center gap-3 rounded-lg border transition-colors",
        variant === "card"
          ? "bg-bg-surface-elevated hover:bg-bg-surface/30 px-4 py-3"
          : "bg-bg-surface/30 px-3 py-2"
      )}
    >
      <FileText className="text-text-muted h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        {previewType ? (
          <button
            className="text-accent block truncate text-left font-medium hover:underline"
            type="button"
            onClick={handleView}
          >
            {file.title || "File"}
          </button>
        ) : (
          <a
            className="text-accent truncate font-medium hover:underline"
            href={file.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {file.title || "File"}
          </a>
        )}
        <p className="text-text-muted text-xs">{dateStr}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {previewType ? (
          <Button
            iconOnly
            aria-label="View file"
            leftIcon={<Eye className="h-4 w-4" />}
            size={
              variant === "card" ? ComponentSizeEnum.MD : ComponentSizeEnum.SM
            }
            variant={ButtonVariantEnum.GHOST}
            onClick={handleView}
          />
        ) : null}
        <Button
          iconOnly
          aria-label="Download file"
          leftIcon={<Download className="h-4 w-4" />}
          size={
            variant === "card" ? ComponentSizeEnum.MD : ComponentSizeEnum.SM
          }
          variant={ButtonVariantEnum.GHOST}
          onClick={handleDownload}
        />
        {onDelete ? (
          <Button
            iconOnly
            aria-label="Delete file"
            leftIcon={<Trash2 className="text-feedback-error h-4 w-4" />}
            size={
              variant === "card" ? ComponentSizeEnum.MD : ComponentSizeEnum.SM
            }
            variant={ButtonVariantEnum.GHOST}
            onClick={() => onDelete(file.id)}
          />
        ) : null}
      </div>
      <MediaViewer
        open={viewerOpen}
        title={file.title || "File preview"}
        type={previewType || "image"}
        url={(file as { file?: string; url: string }).file || file.url}
        onOpenChange={setViewerOpen}
      />
    </div>
  );
}
