import type { TableKanbanColumnDefinition } from './tableViewTypes';

export function groupTableItemsByStatus<T extends { id: string | number }>(
  items: T[],
  columns: TableKanbanColumnDefinition[],
  getItemStatus: (item: T) => string
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const column of columns) {
    groups.set(column.key, []);
  }

  for (const item of items) {
    const statusKey = getItemStatus(item);
    const bucket = groups.get(statusKey);
    if (bucket) {
      bucket.push(item);
      continue;
    }
    const fallback = columns[0]?.key;
    if (fallback) {
      groups.get(fallback)?.push(item);
    }
  }

  return groups;
}
