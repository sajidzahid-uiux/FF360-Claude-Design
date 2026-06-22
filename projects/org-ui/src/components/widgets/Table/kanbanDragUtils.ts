import type {
  TableKanbanColumnDefinition,
  TableKanbanMoveEvent,
} from './tableViewTypes';

export type { TableKanbanMoveEvent };

export function buildKanbanMoveEvent<T extends { id: string | number }>(
  item: T,
  data: T[],
  columns: TableKanbanColumnDefinition[],
  getItemStatus: (item: T) => string,
  toColumnKey: string,
  toIndex: number
): TableKanbanMoveEvent<T> | null {
  const fromColumnKey = getItemStatus(item);
  const columnKeys = new Set(columns.map((column) => column.key));
  if (!columnKeys.has(toColumnKey)) return null;

  const grouped = new Map<string, T[]>();
  for (const column of columns) {
    grouped.set(column.key, []);
  }
  for (const row of data) {
    const key = getItemStatus(row);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)?.push(row);
  }

  const fromItems = grouped.get(fromColumnKey) ?? [];
  const fromIndex = fromItems.findIndex((row) => row.id === item.id);
  if (fromIndex < 0) return null;

  const targetColumnItems = grouped.get(toColumnKey) ?? [];
  let clampedIndex = Math.max(0, Math.min(toIndex, targetColumnItems.length));

  if (fromColumnKey === toColumnKey && fromIndex < clampedIndex) {
    clampedIndex -= 1;
  }

  if (fromColumnKey === toColumnKey && fromIndex === clampedIndex) {
    return null;
  }

  return {
    item,
    fromColumnKey,
    toColumnKey,
    fromIndex,
    toIndex: clampedIndex,
  };
}

export function resolveListDropIndex(
  listElement: HTMLElement,
  clientY: number,
  itemSelector = '[data-list-drop-item]'
): number {
  const items = [...listElement.querySelectorAll<HTMLElement>(itemSelector)];
  if (items.length === 0) return 0;

  for (let index = 0; index < items.length; index += 1) {
    const rect = items[index].getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    if (clientY < midpoint) return index;
  }

  return items.length;
}

/** @deprecated Use {@link resolveListDropIndex} */
export function resolveKanbanDropIndex(
  listElement: HTMLElement,
  clientY: number
): number {
  return resolveListDropIndex(listElement, clientY, '[data-kanban-item]');
}
