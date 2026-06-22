const TERMINAL_STATUS_TITLES = new Set(["completed", "cancelled", "canceled"]);

export function isTerminalStatusTitle(title: string): boolean {
  return TERMINAL_STATUS_TITLES.has(title.trim().toLowerCase());
}

export function filterExternalStatusOptions<T extends { title: string }>(
  statusTypes: T[]
): T[] {
  return statusTypes.filter((status) => !isTerminalStatusTitle(status.title));
}
