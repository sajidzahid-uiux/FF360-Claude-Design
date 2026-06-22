"use client";

import { useMemo } from "react";

import { cn } from "@fieldflow360/org-ui";
import { format } from "date-fns";

import {
  type CalendarItem,
  STATUS_BG_CLASS,
  StatusChip,
  formatCalendarItemPrimaryLabel,
  isContinuationDay,
} from "@/entities/calendar-item";

export interface GridDayCellProps {
  date: Date;
  /** Items intersecting this day, already capped to the visible budget. */
  visibleItems: CalendarItem[];
  /** Count of additional items beyond the visible budget. */
  overflowCount: number;
  /** When true, the date falls outside the active month — number is hidden. */
  isOutsideMonth: boolean;
  /** Marks the cell as today (lime highlight around the day number). */
  isToday: boolean;
  /** True when this is the rightmost (Saturday) cell — drops the right border. */
  isLastInRow?: boolean;
  /** True when this row is the last one — drops the bottom border. */
  isLastRow?: boolean;
  onItemClick?: (itemId: number) => void;
  /** Fired when the user clicks the "+N more" pill — opens the day's full list. */
  onMoreClick?: (date: Date) => void;
  className?: string;
}

export function GridDayCell({
  date,
  visibleItems,
  overflowCount,
  isOutsideMonth,
  isToday,
  isLastInRow,
  isLastRow,
  onItemClick,
  onMoreClick,
  className,
}: GridDayCellProps) {
  const dayLabel = useMemo(() => format(date, "d"), [date]);

  return (
    <div
      className={cn(
        "relative flex min-h-[80px] flex-col gap-1.5 px-1.5 pt-2 pb-2 md:min-h-[140px] md:gap-2 md:pb-3",
        !isLastInRow && "border-border-subtle border-r",
        !isLastRow && "border-border-subtle border-b",
        className
      )}
    >
      {!isOutsideMonth ? (
        // Fixed-height row keeps the gap between the date and the first chip
        // identical whether or not today's lime indicator is shown.
        <div className="flex h-7 items-center md:h-[18px]">
          {isToday ? (
            <span
              aria-current="date"
              className="bg-accent-lime-bright text-accent-neutral-dark inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] leading-none font-bold md:h-[18px] md:w-[18px] md:text-[10px]"
            >
              {dayLabel}
            </span>
          ) : (
            <span className="text-text-muted inline-flex h-7 w-7 items-center justify-center text-[14px] leading-none font-semibold md:h-[18px] md:w-[18px] md:text-[11px]">
              {dayLabel}
            </span>
          )}
        </div>
      ) : null}

      {visibleItems.length > 0 ? (
        <>
          {/* Mobile: compact colored bars (no title) — cells are too narrow
              for chip text on phones, so any tap opens the day's full list
              (the same modal the "+N" overflow opens) where the user can
              pick a specific item. One button wraps the whole stack so SR
              users hear a single action per cell instead of N identical ones. */}
          <button
            aria-label={`Open schedules for ${format(date, "d MMM")}`}
            className={cn(
              "flex flex-col gap-1 disabled:cursor-not-allowed md:hidden",
              onMoreClick && "cursor-pointer hover:opacity-90"
            )}
            disabled={!onMoreClick}
            type="button"
            onClick={onMoreClick ? () => onMoreClick(date) : undefined}
          >
            {visibleItems.map((item) => (
              <span
                key={`${date.toISOString()}-${item.id}-bar`}
                aria-hidden
                className={cn(
                  "h-1 w-full rounded-full",
                  STATUS_BG_CLASS[item.barStatus]
                )}
              />
            ))}
          </button>

          {/* Desktop: status chips with title text */}
          <div className="hidden flex-col gap-1.5 md:flex">
            {visibleItems.map((item) => (
              <StatusChip
                key={`${date.toISOString()}-${item.id}`}
                showArrow={isContinuationDay(item, date)}
                status={item.barStatus}
                title={formatCalendarItemPrimaryLabel(item)}
                onClick={onItemClick ? () => onItemClick(item.id) : undefined}
              />
            ))}
          </div>
        </>
      ) : null}

      {overflowCount > 0 ? (
        <button
          className={cn(
            "text-accent-blue-light flex w-full items-center justify-center text-[10px] leading-none font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            "md:bg-accent-blue-light/10 md:hover:bg-accent-blue-light/20 md:h-[22px] md:rounded-[4px]"
          )}
          disabled={!onMoreClick}
          type="button"
          onClick={onMoreClick ? () => onMoreClick(date) : undefined}
        >
          <span className="md:hidden">+{overflowCount}</span>
          <span className="hidden md:inline">+{overflowCount} more</span>
        </button>
      ) : null}
    </div>
  );
}
