"use client";

import { useMemo } from "react";

import { cn } from "@fieldflow360/org-ui";
import { isSameDay } from "date-fns";

import {
  type CalendarItem,
  GRID_COLUMNS,
  WEEKDAY_LABELS,
  buildCalendarGrid,
} from "@/entities/calendar-item";

import { GridDayCell } from "./GridDayCell";

const VISIBLE_ITEMS_PER_DAY = 3;

export interface MonthGridProps {
  activeMonth: Date;
  items: CalendarItem[];
  onItemClick?: (itemId: number) => void;
  onMoreClick?: (date: Date) => void;
  className?: string;
}

export function MonthGrid({
  activeMonth,
  items,
  onItemClick,
  onMoreClick,
  className,
}: MonthGridProps) {
  const cells = useMemo(
    () =>
      buildCalendarGrid(activeMonth, items, {
        visibleLimit: VISIBLE_ITEMS_PER_DAY,
        weekStartsOn: 0,
      }),
    [activeMonth, items]
  );

  const today = useMemo(() => new Date(), []);
  const totalRows = cells.length / GRID_COLUMNS;

  return (
    <div
      className={cn(
        "border-border-subtle bg-bg-app mx-4 flex flex-col overflow-hidden rounded-xl border shadow-sm sm:mx-6 md:mb-4 md:min-h-0 md:flex-1 md:overflow-y-auto",
        className
      )}
    >
      <div
        aria-hidden
        className="border-border-subtle bg-bg-app sticky top-0 z-20 grid border-b"
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
          gridAutoRows: "minmax(auto, 1fr)",
        }}
      >
        {cells.map((cell, index) => {
          const rowIndex = Math.floor(index / GRID_COLUMNS);
          const colIndex = index % GRID_COLUMNS;
          return (
            <GridDayCell
              key={cell.date.toISOString()}
              date={cell.date}
              isLastInRow={colIndex === GRID_COLUMNS - 1}
              isLastRow={rowIndex === totalRows - 1}
              isOutsideMonth={cell.isOutsideMonth}
              isToday={isSameDay(cell.date, today)}
              overflowCount={cell.overflowCount}
              visibleItems={cell.visibleItems}
              onItemClick={onItemClick}
              onMoreClick={onMoreClick}
            />
          );
        })}
      </div>
    </div>
  );
}
