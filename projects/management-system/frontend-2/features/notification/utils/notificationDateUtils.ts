import {
  formatRelativeActivityDate,
  getRelativeDateGroupLabel,
} from "@/shared/lib";

/**
 * Format notification date in relative time (same as activity date).
 * Re-exported for use in notification list and dropdown.
 */
export const formatNotificationDate = formatRelativeActivityDate;

/**
 * Group label for notifications: Today, Yesterday, Last 7 days, or Older.
 * Use when grouping notification lists by relative time.
 */
export function getNotificationGroupLabel(dateString: string): string {
  return getRelativeDateGroupLabel(dateString);
}
