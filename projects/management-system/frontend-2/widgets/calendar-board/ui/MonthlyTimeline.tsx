"use client";

import { useCallback, useMemo } from "react";

import { getDate, getDaysInMonth, isSameMonth } from "date-fns";

import {
  type CalendarItem,
  type CalendarTabCounterValue,
  computeBarPosition,
} from "@/entities/calendar-item";

import { DayHeader } from "./DayHeader";
import { TimelineFrame } from "./TimelineFrame";

export interface MonthlyTimelineProps {
  activeMonth: Date;
  items: CalendarItem[];
  activeTab?: CalendarTabCounterValue;
  onTabChange?: (value: CalendarTabCounterValue) => void;
  onItemClick?: (item: CalendarItem) => void;
  className?: string;
}

export function MonthlyTimeline({
  activeMonth,
  items,
  activeTab,
  onTabChange,
  onItemClick,
  className,
}: MonthlyTimelineProps) {
  const { todayLineLeftPct, daysInMonth } = useMemo(() => {
    const today = new Date();
    const days = getDaysInMonth(activeMonth);
    return {
      daysInMonth: days,
      todayLineLeftPct: isSameMonth(activeMonth, today)
        ? ((getDate(today) - 0.5) / days) * 100
        : null,
    };
  }, [activeMonth]);

  const getBarPosition = useCallback(
    (item: CalendarItem) => computeBarPosition(item, activeMonth),
    [activeMonth]
  );

  return (
    <TimelineFrame
      activeTab={activeTab}
      className={className}
      daysCount={daysInMonth}
      getBarPosition={getBarPosition}
      header={<DayHeader activeMonth={activeMonth} daysInMonth={daysInMonth} />}
      items={items}
      todayLineLeftPct={todayLineLeftPct}
      onItemClick={onItemClick}
      onTabChange={onTabChange}
    />
  );
}
