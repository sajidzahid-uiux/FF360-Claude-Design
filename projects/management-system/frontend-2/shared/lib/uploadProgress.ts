import type { AxiosProgressEvent, AxiosRequestConfig } from "axios";

export type UploadProgressHandler = (progress: number) => void;

export function toUploadProgressPercent(
  event: AxiosProgressEvent
): number | undefined {
  const { loaded, total } = event;
  if (total == null || total <= 0) return undefined;
  return Math.min(100, Math.round((loaded * 100) / total));
}

export function withUploadProgress(
  onProgress?: UploadProgressHandler
): AxiosRequestConfig | undefined {
  if (!onProgress) return undefined;
  return {
    onUploadProgress: (event) => {
      const percent = toUploadProgressPercent(event);
      if (percent !== undefined) onProgress(percent);
    },
  };
}
