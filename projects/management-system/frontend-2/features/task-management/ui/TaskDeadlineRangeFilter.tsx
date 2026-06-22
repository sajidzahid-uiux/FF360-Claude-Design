"use client";

import { useState } from "react";

import { Button, ButtonVariantEnum, Modal } from "@fieldflow360/org-ui";
import { Calendar } from "lucide-react";

import { FilterState, FilterType } from "@/shared/ui/common";
import { SanitizedInput } from "@/shared/ui/primitives";

interface TaskDeadlineRangeFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

function readDeadlineRange(filters: FilterState): {
  startValue: string;
  endValue: string;
} {
  const raw = filters[FilterType.DEADLINE_RANGE];
  if (
    typeof raw === "object" &&
    raw !== null &&
    !Array.isArray(raw) &&
    "startValue" in raw &&
    "endValue" in raw
  ) {
    return {
      startValue: raw.startValue ?? "",
      endValue: raw.endValue ?? "",
    };
  }
  return { startValue: "", endValue: "" };
}

export function TaskDeadlineRangeFilter({
  filters,
  onFiltersChange,
}: TaskDeadlineRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const { startValue, endValue } = readDeadlineRange(filters);
  const hasRange = Boolean(startValue || endValue);

  const updateRange = (
    patch: Partial<{ startValue: string; endValue: string }>
  ) => {
    const current = readDeadlineRange(filters);
    onFiltersChange({
      ...filters,
      [FilterType.DEADLINE_RANGE]: { ...current, ...patch },
    });
  };

  const handleClear = () => {
    onFiltersChange({
      ...filters,
      [FilterType.DEADLINE_RANGE]: { startValue: "", endValue: "" },
    });
  };

  return (
    <>
      <Button
        aria-label="Filter by deadline range"
        leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
        rightIcon={
          hasRange ? (
            <span className="bg-accent rounded-full px-1.5 text-xs font-semibold text-black">
              1
            </span>
          ) : undefined
        }
        title="Deadline"
        variant={
          hasRange ? ButtonVariantEnum.DEFAULT : ButtonVariantEnum.SURFACE
        }
        onClick={() => setOpen(true)}
      />
      <Modal
        isOpen={open}
        size="sm"
        title="Deadline range"
        onClose={() => setOpen(false)}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-text-secondary text-xs">From</label>
            <SanitizedInput
              type="date"
              value={startValue}
              onChange={(event) =>
                updateRange({ startValue: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-text-secondary text-xs">To</label>
            <SanitizedInput
              type="date"
              value={endValue}
              onChange={(event) =>
                updateRange({ endValue: event.target.value })
              }
            />
          </div>
          {hasRange ? (
            <Button
              fullWidth
              aria-label="Clear deadline range"
              title="Clear deadline range"
              variant={ButtonVariantEnum.GHOST}
              onClick={handleClear}
            />
          ) : null}
        </div>
      </Modal>
    </>
  );
}
