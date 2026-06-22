"use client";

import { useCallback, useMemo } from "react";

import { cn } from "@fieldflow360/org-ui";

import type { MapPinCategory } from "@/api/types/mapPinCategory";

import {
  arePinCategoryColorsEqual,
  getPinCategoryColorLabel,
} from "../lib/pinCategoryColors";

function CategoryDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="inline-block h-4 w-4 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function getCategoryPillLabel(
  category: MapPinCategory,
  categories: MapPinCategory[]
): string {
  const sameColorCount = categories.filter((item) =>
    arePinCategoryColorsEqual(item.color, category.color)
  ).length;
  if (sameColorCount > 1) {
    return category.name;
  }
  return getPinCategoryColorLabel(category.color);
}

export interface MapPinCategoryPillsProps {
  categories: MapPinCategory[];
  value: number | null;
  onChange: (categoryId: number) => void;
  disabled?: boolean;
}

export function MapPinCategoryPills({
  categories,
  value,
  onChange,
  disabled = false,
}: MapPinCategoryPillsProps) {
  const labelsById = useMemo(
    () =>
      new Map(
        categories.map((category) => [
          category.id,
          getCategoryPillLabel(category, categories),
        ])
      ),
    [categories]
  );

  const handleSelect = useCallback(
    (categoryId: number) => {
      if (disabled) return;
      onChange(categoryId);
    },
    [disabled, onChange]
  );

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = value === category.id;
        const label = labelsById.get(category.id) ?? category.name;
        return (
          <button
            key={category.id}
            aria-pressed={isSelected}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
              isSelected
                ? "border-text-accent bg-bg-surface"
                : "border-border-subtle hover:bg-bg-surface/60",
              disabled && "cursor-not-allowed opacity-50"
            )}
            disabled={disabled}
            type="button"
            onClick={() => handleSelect(category.id)}
          >
            <CategoryDot color={category.color} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
