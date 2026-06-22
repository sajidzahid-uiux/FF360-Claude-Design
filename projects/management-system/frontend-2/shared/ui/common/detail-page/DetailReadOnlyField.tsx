"use client";

export interface DetailReadOnlyFieldProps {
  label: string;
  value: string;
  /** Wrap long unbroken strings (e.g. descriptions) instead of overflowing on narrow viewports. */
  preserveLineBreaks?: boolean;
}

export function DetailReadOnlyField({
  label,
  value,
  preserveLineBreaks = false,
}: DetailReadOnlyFieldProps) {
  const displayValue = value.trim() || "—";

  return (
    <div className="max-w-full min-w-0 space-y-1">
      <p className="text-text-muted text-xs font-medium">{label}</p>
      <p
        className={
          preserveLineBreaks
            ? "text-text-primary max-w-full text-sm [overflow-wrap:anywhere] break-words whitespace-pre-wrap"
            : "text-text-primary max-w-full text-sm [overflow-wrap:anywhere] break-words"
        }
      >
        {displayValue}
      </p>
    </div>
  );
}
