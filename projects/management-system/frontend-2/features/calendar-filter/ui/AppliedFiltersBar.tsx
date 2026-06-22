"use client";

import { cn } from "@fieldflow360/org-ui";
import { Check, X } from "lucide-react";

import { CALENDAR_FILTER_FIELDS } from "../model/config";
import type {
  CalendarDynamicFilterKey,
  CalendarDynamicFilterOptions,
  CalendarFilterKey,
  CalendarFiltersState,
} from "../model/types";

export interface AppliedFiltersBarProps {
  filters: CalendarFiltersState;
  onClearFilter: (key: CalendarFilterKey) => void;
  dynamicOptions?: CalendarDynamicFilterOptions;
  className?: string;
}

export function AppliedFiltersBar({
  filters,
  onClearFilter,
  dynamicOptions,
  className,
}: AppliedFiltersBarProps) {
  const activeChips = CALENDAR_FILTER_FIELDS.flatMap((config) => {
    const values = filters[config.key];
    if (!values || values.length === 0) return [];
    const dynamic = dynamicOptions?.[config.key as CalendarDynamicFilterKey];
    const opts = dynamic ?? config.options;
    const labels = opts
      .filter((option) => values.includes(option.value))
      .map((option) => option.label);
    const display = labels.length > 0 ? labels : values;
    return [{ key: config.key, label: display.join(", ") }];
  });

  if (activeChips.length === 0) return null;

  return (
    <div
      aria-label="Applied filters"
      className={cn(
        "bg-bg-app flex flex-wrap items-center justify-start gap-2 px-4 pb-3 sm:px-6 md:justify-end",
        className
      )}
    >
      {activeChips.map((chip) => (
        <span
          key={chip.key}
          className="border-accent bg-bg-app text-text-primary inline-flex h-9 items-center gap-2 rounded-full border pr-1.5 pl-3 text-[13px] font-medium"
        >
          <Check
            className="text-text-primary h-4 w-4 shrink-0"
            strokeWidth={2.5}
          />
          <span className="truncate">{chip.label}</span>
          <button
            aria-label={`Remove ${chip.label} filter`}
            className="bg-feedback-error focus-visible:ring-feedback-error/40 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
            type="button"
            onClick={() => onClearFilter(chip.key)}
          >
            <X className="h-3 w-3" strokeWidth={2.75} />
          </button>
        </span>
      ))}
    </div>
  );
}
