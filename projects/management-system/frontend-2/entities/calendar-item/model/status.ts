import type { CalendarBarStatus } from "./types";

/**
 * Single source of truth mapping a `CalendarBarStatus` to its background-color
 * Tailwind class. Consumed by the StatusChip primitive and any other surface
 * that renders a status indicator.
 *
 * To re-tone the system, edit this map (or the underlying CSS tokens in
 * `cms-app-extensions.css`) — never inline new bg classes in feature components.
 */
export const STATUS_BG_CLASS: Record<CalendarBarStatus, string> = {
  overdue: "bg-feedback-error",
  inprogress: "bg-accent-blue-light",
  completed: "bg-accent-green-deep",
  lead: "bg-accent-orange-bright",
  not_started: "bg-accent-neutral-mid",
};

/**
 * Status text-color counterpart, used where a colored label sits on a neutral
 * (e.g. white) surface — like the timeline bar's "completed" date pill.
 */
export const STATUS_TEXT_CLASS: Record<CalendarBarStatus, string> = {
  overdue: "text-feedback-error",
  inprogress: "text-accent-blue-bold",
  completed: "text-accent-green-deep",
  lead: "text-accent-orange-bright",
  not_started: "text-accent-neutral-mid",
};
