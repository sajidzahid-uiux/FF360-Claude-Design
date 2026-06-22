import type { Column } from './Table';

export interface TableColumnDefinition {
  key: string;
  label: string;
  /** When false, column stays visible and pinned to the end (e.g. row actions). Default true. */
  hideable?: boolean;
  /** Initial visibility when no saved preferences exist. Default true. */
  defaultVisible?: boolean;
}

export interface TableColumnPreferences {
  /** Display order for hideable columns; pinned columns are appended automatically. */
  order: string[];
  hiddenKeys: string[];
}

const COLUMN_PREFS_STORAGE_VERSION = 1;

interface StoredColumnPreferences extends TableColumnPreferences {
  v: number;
}

export function resolveColumnLabel<T extends { id: string | number }>(
  column: Column<T>
): string {
  if (column.label?.trim()) return column.label.trim();
  if (typeof column.header === 'string' && column.header.trim()) {
    return column.header.trim();
  }
  return column.key;
}

export function isColumnHideable<T extends { id: string | number }>(
  column: Column<T>
): boolean {
  if (column.hideable === false) return false;
  if (column.key === 'actions') return false;
  return true;
}

export function getTableColumnDefinitions<T extends { id: string | number }>(
  columns: Column<T>[]
): TableColumnDefinition[] {
  return columns.map((column) => ({
    key: column.key,
    label: resolveColumnLabel(column),
    hideable: isColumnHideable(column),
    defaultVisible: column.defaultVisible ?? true,
  }));
}

export function createDefaultColumnPreferences(
  definitions: TableColumnDefinition[]
): TableColumnPreferences {
  return {
    order: definitions.filter((def) => def.hideable !== false).map((def) => def.key),
    hiddenKeys: definitions
      .filter((def) => def.hideable !== false && def.defaultVisible === false)
      .map((def) => def.key),
  };
}

export function countCustomizedColumns(
  preferences: TableColumnPreferences,
  defaults: TableColumnPreferences
): number {
  const hiddenCount = preferences.hiddenKeys.length;
  const orderChanged =
    preferences.order.length !== defaults.order.length ||
    preferences.order.some((key, index) => key !== defaults.order[index]);

  if (hiddenCount === 0 && !orderChanged) return 0;
  return hiddenCount + (orderChanged ? 1 : 0);
}

export function areTableColumnPreferencesEqual(
  a: TableColumnPreferences,
  b: TableColumnPreferences
): boolean {
  if (a.hiddenKeys.length !== b.hiddenKeys.length) return false;
  if (a.order.length !== b.order.length) return false;

  const hiddenA = [...a.hiddenKeys].sort().join('\0');
  const hiddenB = [...b.hiddenKeys].sort().join('\0');
  if (hiddenA !== hiddenB) return false;

  return a.order.every((key, index) => key === b.order[index]);
}

export function mergeColumnPreferences(
  preferences: TableColumnPreferences,
  definitions: TableColumnDefinition[]
): TableColumnPreferences {
  const hideableKeys = definitions
    .filter((def) => def.hideable !== false)
    .map((def) => def.key);
  const hideableSet = new Set(hideableKeys);

  const order = [
    ...preferences.order.filter((key) => hideableSet.has(key)),
    ...hideableKeys.filter((key) => !preferences.order.includes(key)),
  ];

  const hiddenKeys = preferences.hiddenKeys.filter((key) => hideableSet.has(key));

  return { order, hiddenKeys };
}

export function applyColumnPreferences<T extends { id: string | number }>(
  columns: Column<T>[],
  preferences: TableColumnPreferences
): Column<T>[] {
  const definitions = getTableColumnDefinitions(columns);
  const merged = mergeColumnPreferences(preferences, definitions);
  const columnByKey = new Map(columns.map((column) => [column.key, column]));

  const hideableDefs = definitions.filter((def) => def.hideable !== false);
  const pinnedDefs = definitions.filter((def) => def.hideable === false);
  const hiddenSet = new Set(merged.hiddenKeys);

  let visibleHideable = merged.order.filter((key) => !hiddenSet.has(key));
  if (visibleHideable.length === 0 && hideableDefs.length > 0) {
    visibleHideable = [hideableDefs[0].key];
  }

  const orderedKeys = [
    ...visibleHideable,
    ...pinnedDefs.map((def) => def.key),
  ];

  return orderedKeys
    .map((key) => columnByKey.get(key))
    .filter((column): column is Column<T> => column !== undefined);
}

export function toggleColumnVisibility(
  preferences: TableColumnPreferences,
  definitions: TableColumnDefinition[],
  columnKey: string,
  visible: boolean
): TableColumnPreferences {
  const def = definitions.find((entry) => entry.key === columnKey);
  if (!def || def.hideable === false) return preferences;

  const hideableKeys = definitions
    .filter((entry) => entry.hideable !== false)
    .map((entry) => entry.key);
  const hiddenSet = new Set(preferences.hiddenKeys);

  if (visible) {
    hiddenSet.delete(columnKey);
  } else {
    const visibleCount = hideableKeys.filter((key) => !hiddenSet.has(key)).length;
    if (visibleCount <= 1) return preferences;
    hiddenSet.add(columnKey);
  }

  return {
    ...preferences,
    hiddenKeys: [...hiddenSet],
  };
}

export function moveColumnInPreferences(
  preferences: TableColumnPreferences,
  definitions: TableColumnDefinition[],
  columnKey: string,
  direction: 'up' | 'down'
): TableColumnPreferences {
  const hideableKeys = definitions
    .filter((def) => def.hideable !== false)
    .map((def) => def.key);
  const order = mergeColumnPreferences(preferences, definitions).order.filter((key) =>
    hideableKeys.includes(key)
  );
  const index = order.indexOf(columnKey);
  if (index < 0) return preferences;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= order.length) return preferences;

  const nextOrder = [...order];
  const [removed] = nextOrder.splice(index, 1);
  if (!removed) return preferences;
  nextOrder.splice(targetIndex, 0, removed);

  return { ...preferences, order: nextOrder };
}

export function reorderColumnInPreferences(
  preferences: TableColumnPreferences,
  definitions: TableColumnDefinition[],
  columnKey: string,
  toIndex: number
): TableColumnPreferences {
  const hideableKeys = definitions
    .filter((def) => def.hideable !== false)
    .map((def) => def.key);
  const order = mergeColumnPreferences(preferences, definitions).order.filter((key) =>
    hideableKeys.includes(key)
  );
  const fromIndex = order.indexOf(columnKey);
  if (fromIndex < 0) return preferences;

  let targetIndex = Math.max(0, Math.min(toIndex, order.length));
  if (fromIndex < targetIndex) {
    targetIndex -= 1;
  }
  if (fromIndex === targetIndex) return preferences;

  const nextOrder = [...order];
  const [removed] = nextOrder.splice(fromIndex, 1);
  if (!removed) return preferences;
  nextOrder.splice(targetIndex, 0, removed);

  return { ...preferences, order: nextOrder };
}

export function loadTableColumnPreferences(
  storageKey: string,
  defaults: TableColumnPreferences
): TableColumnPreferences {
  if (typeof window === 'undefined') return defaults;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as StoredColumnPreferences;
    if (parsed.v !== COLUMN_PREFS_STORAGE_VERSION) return defaults;
    if (!Array.isArray(parsed.order) || !Array.isArray(parsed.hiddenKeys)) {
      return defaults;
    }
    return {
      order: parsed.order.filter((key): key is string => typeof key === 'string'),
      hiddenKeys: parsed.hiddenKeys.filter(
        (key): key is string => typeof key === 'string'
      ),
    };
  } catch {
    return defaults;
  }
}

export function saveTableColumnPreferences(
  storageKey: string,
  preferences: TableColumnPreferences
): void {
  if (typeof window === 'undefined') return;

  const payload: StoredColumnPreferences = {
    v: COLUMN_PREFS_STORAGE_VERSION,
    order: preferences.order,
    hiddenKeys: preferences.hiddenKeys,
  };

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // Ignore quota / private mode errors.
  }
}
