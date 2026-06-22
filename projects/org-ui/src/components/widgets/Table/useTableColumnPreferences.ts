import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Column } from './Table';
import {
  applyColumnPreferences,
  areTableColumnPreferencesEqual,
  createDefaultColumnPreferences,
  getTableColumnDefinitions,
  loadTableColumnPreferences,
  mergeColumnPreferences,
  saveTableColumnPreferences,
  type TableColumnDefinition,
  type TableColumnPreferences,
} from './tableColumnPreferences';
import type { TableColumnEditorConfig } from './tableColumnEditorTypes';

export interface UseTableColumnPreferencesOptions {
  /** Persists visibility and order in `localStorage` when set. */
  storageKey?: string;
}

export interface UseTableColumnPreferencesResult<T extends { id: string | number }> {
  preferences: TableColumnPreferences;
  setPreferences: (preferences: TableColumnPreferences) => void;
  resetPreferences: () => void;
  definitions: TableColumnDefinition[];
  applyColumns: (columns: Column<T>[]) => Column<T>[];
  columnEditor: TableColumnEditorConfig;
  customizedCount: number;
}

export function useTableColumnPreferences<T extends { id: string | number }>(
  columns: Column<T>[],
  options: UseTableColumnPreferencesOptions = {}
): UseTableColumnPreferencesResult<T> {
  const definitions = useMemo(() => getTableColumnDefinitions(columns), [columns]);

  const defaultPreferences = useMemo(
    () => createDefaultColumnPreferences(definitions),
    [definitions]
  );

  const [preferences, setPreferencesState] = useState<TableColumnPreferences>(() => {
    const base = options.storageKey
      ? loadTableColumnPreferences(options.storageKey, defaultPreferences)
      : defaultPreferences;
    return mergeColumnPreferences(base, definitions);
  });

  useEffect(() => {
    setPreferencesState((current) => {
      const merged = mergeColumnPreferences(current, definitions);
      return areTableColumnPreferencesEqual(current, merged) ? current : merged;
    });
  }, [definitions]);

  const setPreferences = useCallback(
    (next: TableColumnPreferences) => {
      const merged = mergeColumnPreferences(next, definitions);
      setPreferencesState((current) => {
        if (areTableColumnPreferencesEqual(current, merged)) {
          return current;
        }
        if (options.storageKey) {
          saveTableColumnPreferences(options.storageKey, merged);
        }
        return merged;
      });
    },
    [definitions, options.storageKey]
  );

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, [defaultPreferences, setPreferences]);

  const applyColumns = useCallback(
    (source: Column<T>[]) => applyColumnPreferences(source, preferences),
    [preferences]
  );

  const columnEditor = useMemo<TableColumnEditorConfig>(
    () => ({
      definitions,
      preferences,
      onPreferencesChange: setPreferences,
      onReset: resetPreferences,
    }),
    [definitions, preferences, resetPreferences, setPreferences]
  );

  const customizedCount = useMemo(() => {
    const hiddenCount = preferences.hiddenKeys.length;
    const orderChanged = preferences.order.some(
      (key, index) => key !== defaultPreferences.order[index]
    );
    return hiddenCount + (orderChanged ? 1 : 0);
  }, [defaultPreferences.order, preferences.hiddenKeys, preferences.order]);

  return {
    preferences,
    setPreferences,
    resetPreferences,
    definitions,
    applyColumns,
    columnEditor,
    customizedCount,
  };
}
