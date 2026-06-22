import { useCallback, useMemo } from "react";

import { saveAs } from "file-saver";
import { FileText, MoreHorizontal } from "lucide-react";

import axiosInstance from "@/lib/axios";
import { Dropdown } from "@/shared/ui/common";
import { Card } from "@/shared/ui/primitives";
import { buildRowActions } from "@/utils/actions";

interface MapFileCardProps {
  fileName: string;
  fileUrl?: string;
  fileId?: number;
  fileType: "xml_file" | "shape_file" | string;
  onDelete: (id: number, type: string) => void;
  disabled?: boolean;
  canView?: boolean;
}

export function MapFileCard({
  fileName,
  fileUrl,
  fileId,
  fileType,
  onDelete,
  disabled = false,
  canView = false,
}: MapFileCardProps) {
  const handleDownload = useCallback(async () => {
    if (!fileUrl) return;

    try {
      let blob;
      const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(fileUrl);

      if (isAbsolute) {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Fetch failed");
        blob = await response.blob();
      } else {
        const response = await axiosInstance.get(fileUrl, {
          responseType: "blob",
        });
        blob = response.data;
      }

      if (blob) {
        const urlParts = fileUrl.split("/");
        let urlFilename = urlParts[urlParts.length - 1] || "download";
        urlFilename = urlFilename.split("?")[0];
        const extensionMatch = urlFilename.match(/\.[^.]*$/);
        let extension = extensionMatch ? extensionMatch[0] : "";

        if (!extension) {
          if (fileType.includes("xml")) extension = ".xml";
          else if (fileType.includes("shape")) extension = ".shp";
          else if (fileType.includes("kml")) extension = ".kml";
        }

        const safeFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, "_");
        const downloadName = `${safeFileName}${extension}`;
        saveAs(blob, downloadName);
      }
    } catch (error) {
      console.error("Download process failed:", error);
      window.open(fileUrl, "_blank");
    }
  }, [fileUrl, fileType, fileName]);

  const dropdownActions = useMemo(
    () =>
      buildRowActions({
        canView,
        canEdit: false,
        canDelete: !disabled,
        canArchive: false,
        canTrack: false,
        isArchived: false,
        onView:
          canView && fileUrl ? () => window.open(fileUrl, "_blank") : () => {},
        ...(fileUrl && {
          onDownload: handleDownload,
        }),
        ...(!disabled &&
          fileId && {
            onDelete: () => onDelete(fileId, fileType),
          }),
      }),
    [canView, disabled, fileId, fileType, fileUrl, onDelete, handleDownload]
  );

  return (
    <Card className="bg-bg-surface-elevated hover:bg-accent/50 border-accent relative flex h-[92px] w-full flex-col items-center justify-center gap-2 transition-colors">
      <div className="absolute top-2 right-2">
        <Dropdown
          items={dropdownActions}
          trigger={
            <MoreHorizontal className="text-text-muted hover:text-text-primary h-4 w-4 cursor-pointer" />
          }
        />
      </div>
      <FileText className="h-8 w-8" />
      <div className="px-2 text-center text-xs font-medium">{fileName}</div>
    </Card>
  );
}
