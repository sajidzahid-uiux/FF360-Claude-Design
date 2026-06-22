"use client";

import { cn } from "@fieldflow360/org-ui";
import { FileCheck, FilePenLine } from "lucide-react";

interface DocumentSentToggleButtonsProps {
  estimateSent: boolean;
  contractSent: boolean;
  /** When true, the pair fills the row and wraps on narrow screens. */
  fullWidth?: boolean;
  className?: string;
}

/**
 * Read-only estimate / contract status (green = sent, red = not sent).
 * Updates when entity state changes; use More Actions to toggle.
 */
export function DocumentSentToggleButtons({
  estimateSent,
  contractSent,
  fullWidth = false,
  className,
}: DocumentSentToggleButtonsProps) {
  const pillClass = (sent: boolean) =>
    cn(
      "inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium sm:px-2.5 sm:text-sm",
      sent
        ? "border-emerald-600/50 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100"
        : "border-red-600/50 bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-100"
    );

  return (
    <div
      aria-label="Estimate and contract document status"
      className={cn(
        "flex flex-row flex-wrap gap-2",
        fullWidth && "w-full max-w-full",
        className
      )}
      role="status"
    >
      <div className={cn(pillClass(estimateSent), "min-w-0")}>
        <FileCheck aria-hidden className="h-4 w-4 shrink-0" />
        <span className="min-w-0 truncate">
          Estimate{estimateSent ? " · Sent" : " · Not sent"}
        </span>
      </div>
      <div className={cn(pillClass(contractSent), "min-w-0")}>
        <FilePenLine aria-hidden className="h-4 w-4 shrink-0" />
        <span className="min-w-0 truncate">
          Contract{contractSent ? " · Sent" : " · Not sent"}
        </span>
      </div>
    </div>
  );
}
