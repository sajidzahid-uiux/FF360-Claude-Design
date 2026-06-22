import {
  addDays,
  endOfMonth,
  endOfWeek,
  getDate,
  getDaysInMonth,
  isAfter,
  isBefore,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import type { CalendarItem } from "../model/types";

const DAYS_IN_WEEK = 7;

export interface BarPosition {
  visible: boolean;
  /** Percentage from left edge of timeline (0-100). */
  leftPct: number;
  /** Percentage width of timeline (0-100). */
  widthPct: number;
}

const HIDDEN: BarPosition = { visible: false, leftPct: 0, widthPct: 0 };

/**
 * Day-of-month as a fractional number including hours/minutes — e.g. April 3
 * at 09:30 → 3.3958. Lets bars start/end partway through a day cell.
 */
function fractionalDayOfMonth(d: Date): number {
  return getDate(d) + (d.getHours() + d.getMinutes() / 60) / 24;
}

/**
 * A `yyyy-MM-dd` end date is inclusive (the item runs through the end of that
 * day), so the bar's right edge should sit at the start of the next day. Full
 * ISO datetimes (`yyyy-MM-ddTHH:mm:ss`) are exact and used as-is.
 */
function isDateOnly(iso: string): boolean {
  return !iso.includes("T");
}

/**
 * Whether an item's date range overlaps the active month at all. Used to
 * keep the left-side cards in sync with the right-side timeline bars: a
 * card only renders when its bar would also render in the active month.
 */
export function itemOverlapsMonth(
  item: Pick<CalendarItem, "startDate" | "endDate">,
  activeMonth: Date
): boolean {
  const start = parseISO(item.startDate);
  const end = parseISO(item.endDate);
  const monthStart = startOfMonth(activeMonth);
  const monthEnd = endOfMonth(activeMonth);
  return !(isBefore(end, monthStart) || isAfter(start, monthEnd));
}

/**
 * Compute the horizontal position of a calendar item's bar within the active
 * month's timeline. Items entirely outside the month are hidden; items that
 * span across month boundaries are clamped to the month's visible range.
 *
 * Date strings may be `yyyy-MM-dd` (treated as 00:00 for start, inclusive
 * end-of-day for end so the bar covers the full end day) or full ISO
 * datetimes (`yyyy-MM-ddTHH:mm:ss`, used as-is so time-of-day shifts the bar
 * within its day cell).
 */
export function computeBarPosition(
  item: Pick<CalendarItem, "startDate" | "endDate">,
  activeMonth: Date
): BarPosition {
  const start = parseISO(item.startDate);
  const end = parseISO(item.endDate);
  const monthStart = startOfMonth(activeMonth);
  const monthEnd = endOfMonth(activeMonth);

  if (isBefore(end, monthStart) || isAfter(start, monthEnd)) {
    return HIDDEN;
  }

  const daysInMonth = getDaysInMonth(activeMonth);
  const endInclusiveOffset = isDateOnly(item.endDate) ? 1 : 0;
  const effStartFrac = isSameMonth(start, activeMonth)
    ? fractionalDayOfMonth(start)
    : 1;
  const effEndFrac = isSameMonth(end, activeMonth)
    ? fractionalDayOfMonth(end) + endInclusiveOffset
    : daysInMonth + 1;

  const leftPct = ((effStartFrac - 1) / daysInMonth) * 100;
  const widthPct = ((effEndFrac - effStartFrac) / daysInMonth) * 100;

  return { visible: true, leftPct, widthPct };
}

/** Sunday-first week start for a given date (matches the grid's week alignment). */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 0 });
}

/** Whether an item's date range overlaps the 7-day window starting at `weekStart`. */
export function itemOverlapsWeek(
  item: Pick<CalendarItem, "startDate" | "endDate">,
  weekStart: Date
): boolean {
  const start = parseISO(item.startDate);
  const end = parseISO(item.endDate);
  const rangeStart = startOfDay(weekStart);
  const rangeEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
  return !(isBefore(end, rangeStart) || isAfter(start, rangeEnd));
}

/**
 * Day-of-week as a fractional number including hours/minutes within the week
 * starting at `weekStart` — e.g. Tuesday at 09:30 (when week starts Sunday) →
 * 2.3958. Lets bars start/end partway through a day cell.
 */
function fractionalDayOfWeek(d: Date, weekStart: Date): number {
  const dayStart = startOfDay(weekStart);
  const dayDiffMs = startOfDay(d).getTime() - dayStart.getTime();
  const dayIndex = Math.round(dayDiffMs / (24 * 60 * 60 * 1000));
  return dayIndex + (d.getHours() + d.getMinutes() / 60) / 24;
}

/**
 * Compute the horizontal position of a calendar item's bar within a 7-day
 * window starting at `weekStart`. Items entirely outside the week are hidden;
 * items spanning past the week's edges are clamped to the visible range.
 */
export function computeBarPositionInWeek(
  item: Pick<CalendarItem, "startDate" | "endDate">,
  weekStart: Date
): BarPosition {
  const start = parseISO(item.startDate);
  const end = parseISO(item.endDate);
  const rangeStart = startOfDay(weekStart);
  const rangeEndExclusive = startOfDay(addDays(weekStart, DAYS_IN_WEEK));

  if (isBefore(end, rangeStart) || !isBefore(start, rangeEndExclusive)) {
    return HIDDEN;
  }

  const endInclusiveOffset = isDateOnly(item.endDate) ? 1 : 0;
  const startFrac = isBefore(start, rangeStart)
    ? 0
    : fractionalDayOfWeek(start, weekStart);
  const endFrac = !isBefore(end, rangeEndExclusive)
    ? DAYS_IN_WEEK
    : fractionalDayOfWeek(end, weekStart) + endInclusiveOffset;

  const leftPct = (startFrac / DAYS_IN_WEEK) * 100;
  const widthPct = ((endFrac - startFrac) / DAYS_IN_WEEK) * 100;

  return { visible: true, leftPct, widthPct };
}
