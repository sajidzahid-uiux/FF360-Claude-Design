/** Poll only while the tab is visible (React Query refetchInterval callback). */
export function refetchIntervalWhenVisible(intervalMs: number): number | false {
  if (typeof document === "undefined") return false;
  return document.visibilityState === "visible" ? intervalMs : false;
}

/** Shared polling cadence for shell badges (notifications, unread chat). */
export const SHELL_BADGE_REFETCH_MS = 2 * 60 * 1000;
