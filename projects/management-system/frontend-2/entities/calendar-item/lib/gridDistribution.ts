import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import type { CalendarItem } from "../model/types";

export interface CalendarGridDay {
  /** Calendar date represented by the cell. */
  date: Date;
  /** Whether the date falls outside the active month (used to mute styling). */
  isOutsideMonth: boolean;
  /** Items intersecting this day, capped at `visibleLimit`. */
  visibleItems: CalendarItem[];
  /** Count of items beyond `visibleLimit` on this day. */
  overflowCount: number;
}

export interface BuildGridOptions {
  /** Maximum number of event chips rendered per cell before "+N more". */
  visibleLimit: number;
  /** Sunday-first by default to mirror Figma; pass 1 for Monday-first. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export const itemContainsDay = (
  item: Pick<CalendarItem, "startDate" | "endDate">,
  day: Date
): boolean => {
  const start = parseISO(item.startDate);
  const end = parseISO(item.endDate);
  if (isSameDay(start, day) || isSameDay(end, day)) return true;
  return isAfter(day, start) && isBefore(day, end);
};

export const isContinuationDay = (
  item: Pick<CalendarItem, "startDate" | "endDate">,
  day: Date
): boolean => {
  const start = parseISO(item.startDate);
  const end = parseISO(item.endDate);
  if (isSameDay(start, day) || isSameDay(end, day)) return false;
  return isAfter(day, start) && isBefore(day, end);
};

/** Sort a list by `startDate` ascending without mutating the input. */
export function sortByStartDate<T extends { startDate: string }>(
  items: T[]
): T[] {
  return [...items].sort(
    (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
  );
}

/**
 * Build the day grid for the active month — always returns full weeks so the
 * grid stays aligned (typically 5 or 6 rows). Each cell carries the items
 * intersecting that date, sorted by start date, capped by `visibleLimit`.
 */
export function buildCalendarGrid(
  activeMonth: Date,
  items: CalendarItem[],
  { visibleLimit, weekStartsOn = 0 }: BuildGridOptions
): CalendarGridDay[] {
  const monthStart = startOfMonth(activeMonth);
  const monthEnd = endOfMonth(activeMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });

  const sortedItems = sortByStartDate(items);

  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => {
    const isOutsideMonth =
      isBefore(date, monthStart) || isAfter(date, monthEnd);
    if (isOutsideMonth) {
      return { date, isOutsideMonth, visibleItems: [], overflowCount: 0 };
    }
    const matched = sortedItems.filter((item) => itemContainsDay(item, date));
    const visibleItems = matched.slice(0, visibleLimit);
    const overflowCount = Math.max(0, matched.length - visibleLimit);
    return { date, isOutsideMonth, visibleItems, overflowCount };
  });
}

/**
 * Build a single-week grid of exactly 7 day cells starting at `weekStart`.
 * `isOutsideMonth` is always false here since every day is part of the active
 * week — the grid's full-week scope makes the month-membership flag moot.
 */
export function buildWeekGrid(
  weekStart: Date,
  items: CalendarItem[],
  { visibleLimit }: Pick<BuildGridOptions, "visibleLimit">
): CalendarGridDay[] {
  const sortedItems = sortByStartDate(items);

  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map(
    (date) => {
      const matched = sortedItems.filter((item) => itemContainsDay(item, date));
      const visibleItems = matched.slice(0, visibleLimit);
      const overflowCount = Math.max(0, matched.length - visibleLimit);
      return { date, isOutsideMonth: false, visibleItems, overflowCount };
    }
  );
}
