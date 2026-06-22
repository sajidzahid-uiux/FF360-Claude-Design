export type NotificationsTab = "all" | "unread" | "read";

export const INITIAL_SELECTION_BY_TAB: Record<NotificationsTab, string[]> = {
  all: [],
  unread: [],
  read: [],
};
