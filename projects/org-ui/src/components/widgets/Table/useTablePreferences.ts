import { useCallback, useMemo, useState } from 'react';

import type { Column } from './Table';
import type { TableSettingsConfig } from './tableSettingsTypes';
import { TableVariantEnum, type TableVariant } from './tableVariantTypes';
import {
  loadTableVariant,
  saveTableVariant,
  tableVariantStorageKey,
} from './tableVariantPreferences';
import { useTableColumnPreferences } from './useTableColumnPreferences';
import type { UseTableColumnPreferencesOptions } from './useTableColumnPreferences';

export interface UseTablePreferencesOptions extends UseTableColumnPreferencesOptions {
  defaultVariant?: TableVariant;
}

export interface UseTablePreferencesResult<T extends { id: string | number }>
  extends ReturnType<typeof useTableColumnPreferences<T>> {
  variant: TableVariant;
  setVariant: (variant: TableVariant) => void;
  tableSettings: TableSettingsConfig;
}

export function useTablePreferences<T extends { id: string | number }>(
  columns: Column<T>[],
  options: UseTablePreferencesOptions = {}
): UseTablePreferencesResult<T> {
  const defaultVariant = options.defaultVariant ?? TableVariantEnum.CARD;
  const columnPrefs = useTableColumnPreferences(columns, {
    storageKey: options.storageKey,
  });

  const variantStorageKey = options.storageKey
    ? tableVariantStorageKey(options.storageKey)
    : undefined;

  const [variant, setVariantState] = useState<TableVariant>(() =>
    loadTableVariant(variantStorageKey, defaultVariant)
  );

  const setVariant = useCallback(
    (next: TableVariant) => {
      setVariantState(next);
      if (variantStorageKey) {
        saveTableVariant(variantStorageKey, next);
      }
    },
    [variantStorageKey]
  );

  const tableSettings = useMemo<TableSettingsConfig>(
    () => ({
      columnEditor: columnPrefs.columnEditor,
      variant,
      onVariantChange: setVariant,
      defaultVariant,
    }),
    [columnPrefs.columnEditor, defaultVariant, setVariant, variant]
  );

  const settingsCustomizedCount =
    columnPrefs.customizedCount + (variant !== defaultVariant ? 1 : 0);

  return {
    ...columnPrefs,
    variant,
    setVariant,
    tableSettings,
    customizedCount: settingsCustomizedCount,
  };
}
