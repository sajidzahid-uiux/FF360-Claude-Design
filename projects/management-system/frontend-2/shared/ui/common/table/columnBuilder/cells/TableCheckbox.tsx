"use client";

import React, { useEffect, useRef } from "react";

import { cn } from "@fieldflow360/org-ui";

import { SanitizedInput } from "@/shared/ui/primitives";

export interface TableCheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "checked" | "onChange" | "size"
> {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  size?: "default" | "sm" | "lg";
}

export function TableCheckbox({
  checked,
  indeterminate = false,
  onChange,
  className,
  size = "default",
  disabled,
  "aria-label": ariaLabel,
  ...props
}: TableCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const sizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className="flex items-center justify-center">
      <SanitizedInput
        ref={inputRef}
        aria-label={ariaLabel}
        checked={checked}
        className={cn(
          "focus:ring-accent cursor-pointer rounded border-gray-300 bg-white transition-all focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          checked &&
            "border-accent bg-accent checked:bg-accent checked:border-accent text-white",
          indeterminate && "border-accent bg-accent",
          sizeClasses[size],
          className
        )}
        disabled={disabled}
        role="checkbox"
        style={{
          accentColor: "var(--color-primary)",
          ...(checked && {
            backgroundColor: "var(--color-primary)",
            borderColor: "var(--color-primary)",
          }),
        }}
        type="checkbox"
        onChange={(e) => onChange?.(e.target.checked)}
        {...props}
      />
    </div>
  );
}
