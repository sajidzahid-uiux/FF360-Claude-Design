"use client";

import { useMemo } from "react";

import { cn } from "@fieldflow360/org-ui";
import { addDays, format, isSameDay } from "date-fns";

const DAYS_IN_WEEK = 7;

export interface WeekDayHeaderProps {
  /** Sunday (or week-start) of the active 7-day window. */
  weekStart: Date;
  className?: string;
}

export function WeekDayHeader({ weekStart, className }: WeekDayHeaderProps) {
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAYS_IN_WEEK }, (_, i) => {
      const date = addDays(weekStart, i);
      return {
        date,
        dayLabel: format(date, "EEE").toUpperCase(),
        dayNumber: format(date, "d"),
        isToday: isSameDay(date, today),
      };
    });
  }, [weekStart]);

  return (
    <div
      className={cn(
        "grid h-[38px] auto-cols-fr grid-flow-col items-stretch",
        className
      )}
    >
      {days.map(({ date, dayLabel, dayNumber, isToday }) => (
        <div
          key={date.toISOString()}
          aria-current={isToday ? "date" : undefined}
          className="border-border-subtle relative z-20 flex flex-col items-center border-r pt-[11px] last:border-r-0"
        >
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-[10px] leading-none font-semibold tracking-[0.5px]",
                isToday ? "text-text-primary" : "text-text-muted"
              )}
            >
              {dayLabel}
            </span>
            <span
              className={cn(
                "text-[11px] leading-none font-bold",
                isToday ? "text-text-primary" : "text-text-muted"
              )}
            >
              {dayNumber}
            </span>
          </div>
          <span
            aria-hidden
            className={cn(
              "mt-auto ml-[2px] h-3 w-3 rounded-full",
              isToday ? "bg-foreground" : "bg-transparent"
            )}
          />
        </div>
      ))}
    </div>
  );
}
