"use client";

import { type ChangeEvent } from "react";

import { cn } from "@fieldflow360/org-ui";

import { Label, SanitizedInput } from "@/shared/ui/primitives";

export interface SchedulingFieldProps {
  label: string;
  id: string;
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
  readOnly?: boolean;
  min?: string;
  placeholder?: string;
}

export function SchedulingField({
  label,
  id,
  value,
  onChange,
  disabled,
  type = "text",
  readOnly,
  min,
  placeholder,
}: SchedulingFieldProps) {
  return (
    <div className="relative z-10 space-y-2 overflow-visible">
      <Label htmlFor={id}>{label}</Label>
      <SanitizedInput
        className={cn(
          "relative z-10 w-full max-w-full",
          type === "date" && "min-w-[12rem]",
          readOnly && "bg-bg-surface"
        )}
        disabled={disabled}
        id={id}
        min={min}
        placeholder={placeholder}
        readOnly={readOnly}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
