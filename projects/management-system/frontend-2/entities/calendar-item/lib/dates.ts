import { format, isValid, parseISO } from "date-fns";

/** Sunday-first weekday labels for grid headers. */
export const WEEKDAY_LABELS = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
] as const;

/** Number of columns in the calendar grid (one per weekday). */
export const GRID_COLUMNS = 7;

/**
 * Convert any ISO datetime string to the `yyyy-MM-dd` form expected by
 * `<input type="date">`. Returns an empty string for empty or invalid input
 * so callers can use it directly as a controlled-input value.
 */
export function toInputDate(iso: string): string {
  if (!iso) return "";
  const d = parseISO(iso);
  return isValid(d) ? format(d, "yyyy-MM-dd") : "";
}

/**
 * Format two ISO date strings as a `dd MMM yyyy - dd MMM yyyy` range. Used by
 * the timeline bar and item card so the format stays in lock-step.
 */
export function formatDateRange(
  startISO: string,
  endISO: string,
  dateFormat = "dd MMM yyyy"
): string {
  return `${format(parseISO(startISO), dateFormat)} - ${format(
    parseISO(endISO),
    dateFormat
  )}`;
}
