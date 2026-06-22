"use client";

import { useMemo, useRef } from "react";

import { cn } from "@fieldflow360/org-ui";
import { format, isValid, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";

export interface DateFieldProps {
  label: string;
  /** ISO date string `yyyy-MM-dd` or empty string for the placeholder state. */
  value: string;
  onChange: (next: string) => void;
  /** date-fns format string for the rendered label. Defaults to `d MMM yyyy`. */
  displayFormat?: string;
  /** Text shown when no date is selected. */
  placeholder?: string;
  /** Wrapper class — control width here (e.g. `flex-1`, `w-[150px]`). */
  className?: string;
}

/**
 * Pixel-style date field — shows a formatted date next to a calendar icon and
 * opens the browser's native date picker via `input.showPicker()` on click.
 * The native input is visually hidden but kept in the DOM for keyboard and
 * `showPicker()` fallback support.
 */
export function DateField({
  label,
  value,
  onChange,
  displayFormat = "d MMM yyyy",
  placeholder = "Select date",
  className,
}: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const display = useMemo(() => {
    if (!value) return placeholder;
    const parsed = parseISO(value);
    return isValid(parsed) ? format(parsed, displayFormat) : placeholder;
  }, [value, displayFormat, placeholder]);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Fall through to focus + click fallback for older browsers.
      }
    }
    input.focus();
    input.click();
  };

  const isPlaceholder = !value;

  return (
    <div className={cn("relative flex min-w-0 flex-col gap-1", className)}>
      <span className="text-text-muted text-[10.5px] leading-none font-medium">
        {label}
      </span>
      <button
        aria-label={label}
        className="border-border-subtle bg-bg-app hover:border-text-primary/30 focus:border-accent-blue-bold focus:ring-accent-blue-bold/15 relative inline-flex h-9 w-full min-w-0 cursor-pointer items-center rounded-[8px] border px-3 text-left transition-colors focus:ring-2 focus:outline-none"
        type="button"
        onClick={openPicker}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[12.5px] leading-none font-medium",
            isPlaceholder ? "text-text-muted" : "text-text-primary"
          )}
        >
          {display}
        </span>
        <CalendarDays
          aria-hidden
          className="text-text-muted ml-2 h-4 w-4 shrink-0"
          strokeWidth={1.75}
        />
      </button>
      <input
        ref={inputRef}
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-9 w-full opacity-0"
        tabIndex={-1}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
