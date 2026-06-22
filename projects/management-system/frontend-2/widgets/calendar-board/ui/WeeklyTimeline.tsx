"use client";

import { useCallback, useMemo } from "react";

import {
  addDays,
  differenceInCalendarDays,
  isWithinInterval,
  startOfDay,
} from "date-fns";

import {
  type CalendarItem,
  type CalendarTabCounterValue,
  computeBarPositionInWeek,
} from "@/entities/calendar-item";

import { TimelineFrame } from "./TimelineFrame";
import { WeekDayHeader } from "./WeekDayHeader";

const DAYS_IN_WEEK = 7;

export interface WeeklyTimelineProps {
  /** Sunday (or week-start) of the active 7-day window. */
  weekStart: Date;
  items: CalendarItem[];
  activeTab?: CalendarTabCounterValue;
  onTabChange?: (value: CalendarTabCounterValue) => void;
  onItemClick?: (item: CalendarItem) => void;
  className?: string;
}

export function WeeklyTimeline({
  weekStart,
  items,
  activeTab,
  onTabChange,
  onItemClick,
  className,
}: WeeklyTimelineProps) {
  const todayLineLeftPct = useMemo(() => {
    const today = new Date();
    const rangeStart = startOfDay(weekStart);
    const rangeEnd = addDays(rangeStart, DAYS_IN_WEEK);
    // Center the line in today's cell (half-day offset) to match the monthly
    // timeline's positioning.
    const inRange = isWithinInterval(today, {
      start: rangeStart,
      end: rangeEnd,
    });
    if (!inRange) return null;
    const dayIndex = differenceInCalendarDays(today, rangeStart);
    return ((dayIndex + 0.5) / DAYS_IN_WEEK) * 100;
  }, [weekStart]);

  const getBarPosition = useCallback(
    (item: CalendarItem) => computeBarPositionInWeek(item, weekStart),
    [weekStart]
  );

  return (
    <TimelineFrame
      activeTab={activeTab}
      className={className}
      daysCount={DAYS_IN_WEEK}
      getBarPosition={getBarPosition}
      header={<WeekDayHeader weekStart={weekStart} />}
      items={items}
      todayLineLeftPct={todayLineLeftPct}
      onItemClick={onItemClick}
      onTabChange={onTabChange}
    />
  );
}
