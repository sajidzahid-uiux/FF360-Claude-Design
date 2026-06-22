"use client";

import { cn } from "@fieldflow360/org-ui";

import { GRID_COLUMNS, WEEKDAY_LABELS } from "@/entities/calendar-item";
import { Skeleton } from "@/shared/ui";

const ROWS = 6;
const CHIPS_PER_CELL = 3;

export interface MonthGridSkeletonProps {
  className?: string;
}

export function MonthGridSkeleton({ className }: MonthGridSkeletonProps) {
  const totalCells = ROWS * GRID_COLUMNS;

  return (
    <div
      className={cn(
        "border-border-subtle bg-bg-app mx-4 mb-4 flex flex-1 flex-col overflow-hidden rounded-xl border shadow-sm sm:mx-6",
        className
      )}
    >
      <div
        aria-hidden
        className="border-border-subtle bg-bg-app grid border-b"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
        }}
      >
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            className={cn(
              "text-text-muted flex h-[34px] items-center justify-center text-[10px] leading-none font-semibold tracking-[0.5px]",
              index < GRID_COLUMNS - 1 && "border-border-subtle border-r"
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div
        className="grid flex-1"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
          gridAutoRows: "minmax(0, 1fr)",
        }}
      >
        {Array.from({ length: totalCells }).map((_, index) => {
          const rowIndex = Math.floor(index / GRID_COLUMNS);
          const colIndex = index % GRID_COLUMNS;
          const isLastRow = rowIndex === ROWS - 1;
          const isLastInRow = colIndex === GRID_COLUMNS - 1;
          const chipCount = (index * 7) % (CHIPS_PER_CELL + 1);

          return (
            <div
              key={index}
              className={cn(
                "relative flex min-h-[140px] flex-col gap-2 px-1.5 pt-2 pb-3",
                !isLastInRow && "border-border-subtle border-r",
                !isLastRow && "border-border-subtle border-b"
              )}
            >
              <div className="flex h-[18px] items-center">
                <Skeleton className="h-[14px] w-[14px] rounded-full" />
              </div>
              {chipCount > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {Array.from({ length: chipCount }).map((__, chipIndex) => (
                    <Skeleton
                      key={chipIndex}
                      className="h-[22px] w-full rounded-[4px]"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
