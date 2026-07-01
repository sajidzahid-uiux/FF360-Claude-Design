"use client";

import { cn } from "@fieldflow360/org-ui";

export interface NotesCountBadgeProps {
  count: number;
  /** Emphasized (unread/attention) styling vs. neutral header count. */
  emphasis?: "neutral" | "attention";
  className?: string;
}

/**
 * Circular count badge for the notes header/tab — a circle with the count text
 * inside (grows to a pill only for 3+ digits). Shared so the count reads the
 * same everywhere notes appear (docked section, floating widget, full modal).
 */
export function NotesCountBadge({
  count,
  emphasis = "neutral",
  className,
}: NotesCountBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
        emphasis === "attention"
          ? "bg-feedback-error text-text-inverse"
          : "bg-bg-hover text-text-muted",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
