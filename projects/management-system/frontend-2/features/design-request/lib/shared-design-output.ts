import type {
  SharedDesignFile,
  SharedDesignOutput,
} from "@/api/types/designRequest";

export function isSharedDesignFileReady(file: SharedDesignFile): boolean {
  return file.ingest_status === "ready" && Boolean(file.download_url);
}

export function canPreviewSharedDesignPdf(file: SharedDesignFile): boolean {
  return file.file_type === "pdf" && isSharedDesignFileReady(file);
}

export function isSharedDesignFileFailed(file: SharedDesignFile): boolean {
  return file.ingest_status === "failed";
}

export function getSharedDesignFileErrorMessage(
  file: SharedDesignFile
): string {
  if (file.error_message?.trim()) {
    return file.error_message.trim();
  }
  return "This file could not be processed.";
}

export function extractSharedXmlMapLayers(
  sharedOutput: SharedDesignOutput | null | undefined
): Array<{ data: Record<string, unknown> }> {
  if (!sharedOutput?.files?.length) return [];

  return sharedOutput.files
    .filter(
      (file) =>
        file.file_type === "xml" &&
        file.overlay?.available &&
        file.overlay.data != null
    )
    .map((file) => ({ data: file.overlay!.data! }));
}

export function getSharedDesignOutputEmptyMessage(
  sharedOutput: SharedDesignOutput | null | undefined,
  options: { isLoading: boolean; isError: boolean; isForbidden: boolean }
): string | null {
  if (options.isLoading) return null;
  if (options.isForbidden) {
    return "You do not have permission to view shared design files for this record.";
  }
  if (options.isError) {
    return "Unable to load shared design files. Please try again.";
  }
  if (!sharedOutput) {
    return "No design has been shared by FieldFlow360 yet.";
  }
  if (!sharedOutput.files.length) {
    return "Shared design files are still being prepared.";
  }
  return null;
}

export function getSharedDesignFileTypeLabel(
  fileType: SharedDesignFile["file_type"]
): string {
  switch (fileType) {
    case "pdf":
      return "PDF Report";
    case "xml":
      return "XML Map";
    case "shp":
      return "Shape File";
    default:
      return fileType;
  }
}
