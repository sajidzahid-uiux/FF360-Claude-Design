"use client";

import { ReactNode, useState } from "react";

import { saveAs } from "file-saver";
import { Download, Eye, Info, Trash2 } from "lucide-react";

import { MediaViewer } from "@/features/equipment/ui";
import axiosInstance from "@/lib/axios";
import { TouchSlideText } from "@/shared/ui/common";
import { FileDescriptionModal } from "@/shared/ui/common/FileDescriptionModal";
import { Card, CardContent } from "@/shared/ui/primitives";

// Helper function to truncate and handle scrolling text for file names
const TruncatedFileName = ({ fileName }: { fileName: string }) => {
  const isLongName = fileName.length > 35;

  if (!isLongName) {
    return <span className="text-base font-semibold">{fileName}</span>;
  }

  return (
    <div className="max-w-[125px] overflow-hidden whitespace-nowrap sm:max-w-[200px]">
      <TouchSlideText
        className="text-base font-semibold"
        maxWidth="sm:max-w-[200px] max-w-[125px]"
        text={fileName}
      />
    </div>
  );
};

export interface FileCardItem {
  id: string | number;
  file?: string;
  url?: string;
  title?: string;
  displayTitle?: string;
  description?: string;
  uploaded_at?: string;
  icon?: ReactNode;
  farmer_file?: boolean;
  diggs_file?: boolean;
}

export default function FileCard({
  file,
  onDelete,
  hideActions,
  jobTitle,
  disabled,
}: {
  file: FileCardItem;
  onDelete?: (id: string) => void;
  hideActions?: boolean;
  jobTitle?: string;
  disabled?: boolean;
  checked?: boolean;
  onCheck?: () => void;
}) {
  const [showDescription, setShowDescription] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerType, setViewerType] = useState<"image" | "pdf">("image");

  const getPreviewType = (fileUrl: string): "image" | "pdf" | null => {
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
  };

  const handleVisualize = () => {
    const fileUrl = file.file || file.url;
    if (!fileUrl) return;

    const previewType = getPreviewType(fileUrl);
    if (!previewType) return;

    setViewerType(previewType);
    setViewerUrl(fileUrl);
    setViewerOpen(true);
  };

  const handleDownload = async () => {
    const fileUrl = file.file || file.url;
    if (!fileUrl) return;

    try {
      let blob;
      const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(fileUrl);
      if (isAbsolute) {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        blob = await response.blob();
      } else {
        const response = await axiosInstance.get(fileUrl, {
          responseType: "blob",
        });
        blob = response.data;
      }

      // Use file title as filename, but preserve file extension from URL
      const urlParts = fileUrl.split("/");
      let urlFilename = urlParts[urlParts.length - 1] || "download";

      // Remove query parameters from filename (e.g., AWS S3 signed URL parameters)
      urlFilename = urlFilename.split("?")[0];

      // Extract file extension from URL (stop at first ? or & to avoid AWS parameters)
      const extensionMatch = urlFilename.match(/\.[^.]*$/);
      const extension = extensionMatch ? extensionMatch[0] : "";

      // Use file title/displayTitle as the base filename
      const baseFilename = file.title || file.displayTitle || "download";
      const titleLower = baseFilename.toLowerCase();

      // Determine if file is onecall or contractor
      let fileTypePrefix = "";
      if (
        titleLower.includes("one_call_file") ||
        titleLower.includes("one_call_")
      ) {
        fileTypePrefix = "onecall_";
      } else if (
        titleLower.includes("contractor_") ||
        (!file.farmer_file && !file.diggs_file)
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
      window.open(file.file || file.url, "_blank");
    }
  };

  const fileUrl = file.file || file.url;
  const previewType = fileUrl ? getPreviewType(fileUrl) : null;
  const canVisualize = Boolean(previewType);

  return (
    <>
      <Card className="border-muted-foreground/20 mb-2 h-[96px] rounded-sm sm:w-[446px]">
        <CardContent className="flex h-full items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {file.icon}
            <div className="flex flex-col">
              <TruncatedFileName
                fileName={
                  file.displayTitle || file.title || file.file || "Untitled"
                }
              />
              <span className="text-text-muted mt-1 text-xs">
                {file.uploaded_at
                  ? `${new Date(file.uploaded_at).toLocaleString()}`
                  : ""}
              </span>
            </div>
          </div>
          {!hideActions && (
            <div className="ml-2 flex grid grid-cols-2 items-center gap-6 pr-2 sm:flex">
              <Download
                className="h-5 w-5 cursor-pointer"
                onClick={handleDownload}
              />
              {canVisualize && (
                <Eye
                  className="h-5 w-5 cursor-pointer transition-all duration-300 hover:text-blue-500"
                  onClick={handleVisualize}
                />
              )}
              <Trash2
                className={`h-5 w-5 transition-all duration-300 ${
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:animate-pulse hover:text-red-500"
                }`}
                onClick={() =>
                  !disabled && onDelete && onDelete(String(file.id))
                }
              />
              <Info
                className="h-5 w-5 cursor-pointer"
                onClick={() => setShowDescription(true)}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <FileDescriptionModal
        description={file.description}
        open={showDescription}
        onOpenChange={setShowDescription}
      />
      <MediaViewer
        open={viewerOpen}
        title={file.displayTitle || file.title || "File preview"}
        type={viewerType}
        url={viewerUrl}
        onOpenChange={setViewerOpen}
      />
    </>
  );
}
