"use client";

import { useCallback } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";

export interface DownloadMaintenanceLogButtonProps {
  isLogReady: boolean;
  isDownloading?: boolean;
  onDownload: () => void | Promise<void>;
  size?: ComponentSizeEnum;
  className?: string;
}

export function DownloadMaintenanceLogButton({
  isLogReady,
  isDownloading = false,
  onDownload,
  size = ComponentSizeEnum.SM,
  className,
}: DownloadMaintenanceLogButtonProps) {
  const handleClick = useCallback(() => {
    void onDownload();
  }, [onDownload]);

  const disabled = !isLogReady || isDownloading;

  return (
    <Button
      aria-label={
        isDownloading
          ? "Generating maintenance log..."
          : isLogReady
            ? "Print/Download Maintenance Log"
            : "Log data is still loading or empty"
      }
      className={className}
      disabled={disabled}
      loading={isDownloading}
      size={size}
      title={
        isDownloading
          ? "Generating maintenance log..."
          : isLogReady
            ? "Print/Download Maintenance Log"
            : "Log data is still loading or empty"
      }
      variant={ButtonVariantEnum.SURFACE}
      onClick={handleClick}
    />
  );
}
