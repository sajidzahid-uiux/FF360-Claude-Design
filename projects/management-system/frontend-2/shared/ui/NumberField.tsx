"use client";

import { cn } from "@fieldflow360/org-ui";

export interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  placeholder = "0",
  min = 0,
  max,
  className,
}: NumberFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-text-muted text-[10.5px] leading-none font-medium">
        {label}
      </span>
      <input
        className="border-border-subtle bg-bg-app text-text-primary placeholder:text-text-muted hover:border-text-primary/30 focus:border-accent-blue-bold focus:ring-accent-blue-bold/15 inline-flex h-9 w-full min-w-0 rounded-[8px] border px-3 text-[12.5px] leading-none font-medium transition-colors focus:ring-2 focus:outline-none"
        inputMode="numeric"
        max={max}
        min={min}
        placeholder={placeholder}
        step={1}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
