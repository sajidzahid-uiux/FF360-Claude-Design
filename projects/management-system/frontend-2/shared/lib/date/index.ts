import {
  differenceInDays,
  differenceInSeconds,
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from "date-fns";

/**
 * Format a timestamp as: "Just now", "5 minutes ago",
 * "Yesterday, 1:40 PM", or "May 15, 2023" for older records.
 */
export function formatRelativeActivityDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = differenceInSeconds(now, date);

  if (secondsAgo < 60) {
    return "Just now";
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  }
  if (secondsAgo < 24 * 60 * 60) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  return format(date, "MMM d, yyyy");
}

export function getRelativeDateGroupLabel(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  const daysAgo = differenceInDays(new Date(), date);
  if (daysAgo >= 1 && daysAgo <= 7) return "Last 7 days";
  return "Older";
}
