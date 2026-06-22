/**
 * Single notification item from GET /new-notifications/ (list or results).
 */
import type { IdOf } from "./common";

export interface NewNotificationItem {
  id: number;
  title: string;
  description: string;
  created_at: string;
  read: boolean;
  url: string | null;
  /** Deep link path or URL; prefer for navigation when set. */
  web_url?: string | null;
  webUrl?: string | null;
  category: string;
  module: string;
  event_key: string;
  date_group: "today" | "last_7_days" | "older";
  display_date: string;
}

/** Backend category values. UI maps these to priority colors. */
export type NotificationCategory = "critical" | "important" | "fyi";

/**
 * Tailwind class for a left-border priority indicator.
 * Critical → red, Important → orange, FYI → gray. Works in light, dark, and night mode.
 */
export const NOTIFICATION_PRIORITY_BORDER_CLASS: Record<
  NotificationCategory,
  string
> = {
  critical: "border-l-4 border-l-[var(--color-feedback-error)]",
  important: "border-l-4 border-l-[var(--color-accent)]",
  fyi: "border-l-4 border-l-border-strong",
} as const;

/**
 * Card background + left accent by priority (theme tokens).
 */
export const NOTIFICATION_PRIORITY_CARD_BG: Record<
  NotificationCategory,
  string
> = {
  critical:
    "bg-bg-surface-elevated border-border-subtle border border-l-4 border-l-[var(--color-feedback-error)]",
  important:
    "bg-bg-surface-elevated border-border-subtle border border-l-4 border-l-[var(--color-accent)]",
  fyi: "bg-bg-surface-elevated border-border-subtle border border-l-4 border-l-border-strong",
} as const;

/**
 * Title text color by priority.
 */
export const NOTIFICATION_PRIORITY_TITLE_CLASS: Record<
  NotificationCategory,
  string
> = {
  critical: "text-text-primary",
  important: "text-text-primary",
  fyi: "text-text-primary",
} as const;

/**
 * Module badge: soft priority tint.
 */
export const NOTIFICATION_PRIORITY_BADGE_CLASS: Record<
  NotificationCategory,
  string
> = {
  critical:
    "border-0 bg-[var(--color-feedback-error-soft)] text-[var(--color-feedback-error-strong)]",
  important:
    "border-0 bg-[color-mix(in_srgb,var(--color-accent)_22%,var(--color-bg-app))] text-text-primary",
  fyi: "border-0 bg-bg-app text-text-secondary",
} as const;

const DEFAULT_PRIORITY: NotificationCategory = "fyi";

function normalizeCategory(category: string): NotificationCategory {
  const key = (category ?? "").toLowerCase();
  if (key === "critical") return "critical";
  if (key === "important") return "important";
  return DEFAULT_PRIORITY;
}

/**
 * Returns the Tailwind border class for the notification's priority.
 * Normalizes category from API (e.g. "Critical", "critical", "FYI") to critical | important | fyi.
 */
export function getNotificationPriorityBorderClass(category: string): string {
  return NOTIFICATION_PRIORITY_BORDER_CLASS[normalizeCategory(category)];
}

/**
 * Returns card background + left border classes for the notification page (Figma-style).
 */
export function getNotificationPriorityCardClass(category: string): string {
  return NOTIFICATION_PRIORITY_CARD_BG[normalizeCategory(category)];
}

/**
 * Returns title text color class by priority.
 */
export function getNotificationPriorityTitleClass(category: string): string {
  return NOTIFICATION_PRIORITY_TITLE_CLASS[normalizeCategory(category)];
}

/**
 * Returns module badge solid background + text class (Figma top-right badge).
 */
export function getNotificationPriorityBadgeClass(category: string): string {
  return NOTIFICATION_PRIORITY_BADGE_CLASS[normalizeCategory(category)];
}

/**
 * Returns normalized category for filtering.
 */
export function getNotificationCategory(
  category: string
): NotificationCategory {
  return normalizeCategory(category);
}

/**
 * Query params for GET /new-notifications/
 */
export interface NewNotificationsParams {
  page?: number;
  page_size?: number;
  search?: string;
  unread?: boolean;
}

/**
 * Paginated response when page/page_size are sent.
 */
export interface NewNotificationsPaginatedResponse {
  total_count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: NewNotificationItem[];
}

export type NewNotificationsResponse =
  | NewNotificationItem[]
  | NewNotificationsPaginatedResponse;

export function isPaginatedResponse(
  data: NewNotificationsResponse
): data is NewNotificationsPaginatedResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray((data as NewNotificationsPaginatedResponse).results)
  );
}

/**
 * Response from POST mark-all-read.
 */
export interface MarkAllReadResponse {
  marked_count: number;
}

/**
 * Response from POST delete-all.
 */
export interface DeleteAllResponse {
  deleted_count: number;
}

export interface NewNotificationPatchPayload {
  read: boolean;
}

export interface MarkNewNotificationReadArgs {
  id: IdOf<NewNotificationItem>;
  read: boolean;
}
