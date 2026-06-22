"use client";

import { useCallback } from "react";

import { cn } from "@fieldflow360/org-ui";
import { Check } from "lucide-react";

import {
  PIN_CATEGORY_COLOR_OPTIONS,
  type PinCategoryColorOption,
} from "../lib/pinCategoryColors";

export type PinCategoryColorSwatchesVariant = "row" | "grid";

export interface PinCategoryColorSwatchesProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  className?: string;
  variant?: PinCategoryColorSwatchesVariant;
}

export function PinCategoryColorSwatches({
  value,
  onChange,
  disabled = false,
  className,
  variant = "row",
}: PinCategoryColorSwatchesProps) {
  const handleSelect = useCallback(
    (option: PinCategoryColorOption) => {
      if (disabled) return;
      onChange(option.value);
    },
    [disabled, onChange]
  );

  const isGrid = variant === "grid";

  return (
    <div
      className={cn(
        isGrid
          ? "grid grid-cols-5 gap-x-5 gap-y-4"
          : "flex flex-wrap items-center gap-2",
        className
      )}
    >
      {PIN_CATEGORY_COLOR_OPTIONS.map((option) => {
        const isSelected = option.value.toUpperCase() === value.toUpperCase();
        return (
          <button
            key={option.value}
            aria-label={option.label}
            aria-pressed={isSelected}
            className={cn(
              "relative rounded-full border-2 transition-transform",
              isGrid ? "h-11 w-11" : "h-7 w-7",
              isSelected
                ? "border-text-accent"
                : "border-transparent hover:scale-105",
              disabled && "cursor-not-allowed opacity-50"
            )}
            disabled={disabled}
            style={{ backgroundColor: option.value }}
            title={option.label}
            type="button"
            onClick={() => handleSelect(option)}
          >
            {isSelected ? (
              <Check
                aria-hidden
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white",
                  isGrid ? "h-5 w-5" : "h-3.5 w-3.5"
                )}
                strokeWidth={3}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
