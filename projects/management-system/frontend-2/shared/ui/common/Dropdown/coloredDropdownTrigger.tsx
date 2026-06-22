"use client";

import type { ReactNode } from "react";

import { cn } from "@fieldflow360/org-ui";
import { ChevronDown } from "lucide-react";

export function statusColorDot(color?: string | null) {
  if (!color) return null;
  return (
    <span
      aria-hidden
      className="h-3 w-3 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

export function coloredDropdownTrigger({
  prefix,
  label,
  dotColor,
  placeholder,
  disabled,
  isOpen,
}: {
  prefix?: string;
  label?: string;
  dotColor?: string | null;
  placeholder: string;
  disabled: boolean;
  isOpen: boolean;
}) {
  return (
    <button
      aria-expanded={isOpen}
      className={cn(
        "border-border-subtle bg-bg-surface text-text-primary flex h-11 w-full min-w-[12rem] items-center justify-between gap-2 rounded-lg border px-3 text-sm shadow-sm transition-colors",
        "hover:border-border-subtle-strong focus-visible:ring-accent/35 focus-visible:ring-2 focus-visible:outline-none",
        disabled && "cursor-not-allowed opacity-55"
      )}
      disabled={disabled}
      type="button"
    >
      <span className="flex min-w-0 items-center gap-2">
        {prefix ? (
          <span className="text-text-muted shrink-0">{prefix}</span>
        ) : null}
        {statusColorDot(dotColor)}
        <span className="truncate">{label ?? placeholder}</span>
      </span>
      <ChevronDown
        aria-hidden
        className={cn("h-4 w-4 shrink-0 opacity-60", isOpen && "rotate-180")}
      />
    </button>
  );
}

export function coloredDropdownOptionIcon(color?: string | null): ReactNode {
  return statusColorDot(color);
}
