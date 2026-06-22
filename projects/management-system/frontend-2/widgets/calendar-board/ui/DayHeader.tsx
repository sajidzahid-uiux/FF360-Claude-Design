"use client";

import { useMemo } from "react";

import { cn } from "@fieldflow360/org-ui";
import { getDate, getDaysInMonth, isSameMonth } from "date-fns";

export interface DayHeaderProps {
  activeMonth: Date;
  /** Optional override; defaults to the days of activeMonth. */
  daysInMonth?: number;
  className?: string;
}

export function DayHeader({
  activeMonth,
  daysInMonth,
  className,
}: DayHeaderProps) {
  const { days, todayDay } = useMemo(() => {
    const today = new Date();
    const total = daysInMonth ?? getDaysInMonth(activeMonth);
    return {
      days: Array.from({ length: total }, (_, i) => i + 1),
      todayDay: isSameMonth(activeMonth, today) ? getDate(today) : null,
    };
  }, [activeMonth, daysInMonth]);

  return (
    <div
      className={cn(
        "grid h-[38px] auto-cols-fr grid-flow-col items-stretch",
        className
      )}
    >
      {days.map((day) => {
        const isToday = day === todayDay;
        return (
          <div
            key={day}
            className="border-border-subtle relative z-20 flex flex-col items-center border-r pt-[11px] last:border-r-0"
          >
            <span
              className={cn(
                "text-[11px] leading-none font-bold",
                isToday ? "text-text-primary" : "text-text-muted"
              )}
            >
              {day}
            </span>
            <span
              aria-hidden
              className={cn(
                "mt-auto h-3 w-3 rounded-full",
                isToday ? "bg-foreground" : "bg-transparent"
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
