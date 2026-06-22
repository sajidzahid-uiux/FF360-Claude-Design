import { saveAs } from "file-saver";

export function triggerBlobDownload(blob: Blob, filename: string): void {
  saveAs(blob, filename);
}
