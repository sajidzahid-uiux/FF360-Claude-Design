import type { CalendarItem } from "../model/types";

/**
 * Primary line for the Schedule Details "Client" card: "Contact - Farm" when both exist.
 */
export function formatCalendarClientCardLine(
  item: Pick<CalendarItem, "client" | "farmName" | "location">
): string {
  const contact = item.client?.trim() ?? "";
  const farm = item.farmName?.trim() ?? "";
  if (contact && farm) return `${contact} - ${farm}`;
  if (contact) return contact;
  if (farm) return farm;
  const loc = item.location?.trim() ?? "";
  return loc || "—";
}

/** True when the scheduling `title` is the same as the contact name (avoid showing both). */
export function calendarItemTitleDuplicatesContact(
  item: Pick<CalendarItem, "title" | "client">
): boolean {
  const contact = item.client?.trim();
  const title = item.title?.trim();
  if (!contact || !title) return false;
  return contact === title;
}

/**
 * Headline for compact calendar cards (grid chips, timeline row, day popover).
 * Prefer contact + farm from `formatCalendarClientCardLine`; API `title` is
 * often a job/lead description and must not replace identity in list views.
 */
export function formatCalendarItemPrimaryLabel(
  item: Pick<CalendarItem, "client" | "farmName" | "location" | "title">
): string {
  const cardLine = formatCalendarClientCardLine(item);
  if (cardLine && cardLine !== "—") return cardLine;
  const t = item.title?.trim();
  if (t) return t;
  return "—";
}

export interface CalendarItemCardDisplayLines {
  primaryLine: string;
  subtitleLine: string;
}

/**
 * Primary + secondary lines for `ItemCard`-style layouts. Subtitle is
 * `location` when it adds information beyond the primary (avoids repeating farm).
 */
export function getCalendarItemCardDisplayLines(
  item: Pick<CalendarItem, "client" | "farmName" | "location" | "title">
): CalendarItemCardDisplayLines {
  const primaryLine = formatCalendarItemPrimaryLabel(item);
  const loc = item.location?.trim() ?? "";
  let subtitleLine = "";
  if (loc && loc !== primaryLine) {
    const farm = item.farmName?.trim() ?? "";
    if (!(farm && loc === farm && primaryLine.includes(farm))) {
      subtitleLine = loc;
    }
  }
  return { primaryLine, subtitleLine };
}
