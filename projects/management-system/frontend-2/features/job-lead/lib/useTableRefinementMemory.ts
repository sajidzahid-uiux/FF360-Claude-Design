"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  mergeColumnPreferences,
  type TableColumnPreferences,
  type TableFilterValue,
  type TableRefinementPersistence,
  type TableSortRule,
  type TableVariant,
} from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { getItem, removeItem, setItem } from "@/utils/persistentStorage";

/** localStorage keys must match /^[a-zA-Z][a-zA-Z0-9_-]{0,99}$/ — strip the rest. */
function sanitizeKeyPart(part: string | number | null | undefined): string {
  const cleaned = String(part ?? "x")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 40);
  return cleaned || "x";
}

function readArray<T>(key: string): T[] | null {
  const raw = getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

interface StoredColumnLayout {
  preferences: TableColumnPreferences;
  variant: TableVariant;
}

function readColumnLayout(key: string): StoredColumnLayout | null {
  const raw = getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredColumnLayout;
    if (
      parsed?.preferences &&
      Array.isArray(parsed.preferences.order) &&
      Array.isArray(parsed.preferences.hiddenKeys)
    ) {
      return parsed;
    }
  } catch {
    // Ignore corrupt entries — fall through to defaults.
  }
  return null;
}

/** The live column-layout state this hook can persist/restore (from useTablePreferences). */
export interface TableColumnMemoryTarget {
  preferences: TableColumnPreferences;
  variant: TableVariant;
  definitions: Parameters<typeof mergeColumnPreferences>[1];
  setPreferences: (preferences: TableColumnPreferences) => void;
  setVariant: (variant: TableVariant) => void;
}

export interface UseTableRefinementMemoryOptions {
  /** Stable per-list identity, e.g. "leads-repair" or "jobs-excavation". */
  storageKeyPrefix: string;
  organizationId?: string | number | null;
  filterValues: TableFilterValue[];
  onFilterValuesChange: (values: TableFilterValue[]) => void;
  sortRules: TableSortRule[];
  onSortRulesChange: (rules: TableSortRule[]) => void;
  /** Live column layout to remember. Pass null when the caller owns column persistence. */
  columnTarget?: TableColumnMemoryTarget | null;
}

export interface UseTableRefinementMemoryResult {
  filterPersistence: TableRefinementPersistence;
  sortPersistence: TableRefinementPersistence;
  /** Present only when a `columnTarget` was supplied. */
  settingsPersistence?: TableRefinementPersistence;
}

/**
 * Backs the "Remember … for this list" toggles in the table toolbar. The CMS
 * table-query store and column preferences are in-memory only, so this is what
 * makes a list's filters, sort, and column layout survive a reload. When a
 * toggle is on, the current refinement is snapshotted to localStorage and kept
 * in sync; on mount the saved refinement is restored. Each toggle fires a toast.
 */
export function useTableRefinementMemory({
  storageKeyPrefix,
  organizationId,
  filterValues,
  onFilterValuesChange,
  sortRules,
  onSortRulesChange,
  columnTarget,
}: UseTableRefinementMemoryOptions): UseTableRefinementMemoryResult {
  const base = `refine_${sanitizeKeyPart(storageKeyPrefix)}_org${sanitizeKeyPart(
    organizationId
  )}`;
  const filtersKey = `${base}_filters`;
  const sortKey = `${base}_sort`;
  const columnsKey = `${base}_columns`;

  const [rememberFilters, setRememberFilters] = useState(false);
  const [rememberSort, setRememberSort] = useState(false);
  const [rememberColumns, setRememberColumns] = useState(false);

  // Latest values/handlers in refs so the restore effects key on identity only.
  const filterValuesRef = useRef(filterValues);
  const sortRulesRef = useRef(sortRules);
  const onFilterValuesChangeRef = useRef(onFilterValuesChange);
  const onSortRulesChangeRef = useRef(onSortRulesChange);
  const columnTargetRef = useRef(columnTarget);
  filterValuesRef.current = filterValues;
  sortRulesRef.current = sortRules;
  onFilterValuesChangeRef.current = onFilterValuesChange;
  onSortRulesChangeRef.current = onSortRulesChange;
  columnTargetRef.current = columnTarget;

  const hasColumnTarget = Boolean(columnTarget);
  const columnPreferences = columnTarget?.preferences;
  const columnVariant = columnTarget?.variant;

  // Restore filters/sort whenever the list identity changes.
  useEffect(() => {
    const storedFilters = readArray<TableFilterValue>(filtersKey);
    const storedSort = readArray<TableSortRule>(sortKey);
    setRememberFilters(storedFilters !== null);
    setRememberSort(storedSort !== null);
    if (storedFilters) onFilterValuesChangeRef.current(storedFilters);
    if (storedSort) onSortRulesChangeRef.current(storedSort);
  }, [filtersKey, sortKey]);

  // Restore the column layout whenever the list identity changes.
  useEffect(() => {
    if (!columnTargetRef.current) {
      setRememberColumns(false);
      return;
    }
    const stored = readColumnLayout(columnsKey);
    setRememberColumns(stored !== null);
    if (stored) {
      columnTargetRef.current.setPreferences(
        mergeColumnPreferences(stored.preferences, columnTargetRef.current.definitions)
      );
      columnTargetRef.current.setVariant(stored.variant);
    }
    // hasColumnTarget gates whether a target exists for this identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnsKey, hasColumnTarget]);

  // Keep snapshots in sync while their toggle stays on.
  useEffect(() => {
    if (rememberFilters) setItem(filtersKey, JSON.stringify(filterValues));
  }, [rememberFilters, filterValues, filtersKey]);

  useEffect(() => {
    if (rememberSort) setItem(sortKey, JSON.stringify(sortRules));
  }, [rememberSort, sortRules, sortKey]);

  useEffect(() => {
    if (rememberColumns && columnPreferences && columnVariant) {
      setItem(
        columnsKey,
        JSON.stringify({ preferences: columnPreferences, variant: columnVariant })
      );
    }
  }, [rememberColumns, columnPreferences, columnVariant, columnsKey]);

  const handleRememberFilters = useCallback(
    (remembered: boolean) => {
      setRememberFilters(remembered);
      if (remembered) {
        setItem(filtersKey, JSON.stringify(filterValuesRef.current));
        toast.success("Filters will be remembered for this list");
      } else {
        removeItem(filtersKey);
        toast.success("Stopped remembering filters for this list");
      }
    },
    [filtersKey]
  );

  const handleRememberSort = useCallback(
    (remembered: boolean) => {
      setRememberSort(remembered);
      if (remembered) {
        setItem(sortKey, JSON.stringify(sortRulesRef.current));
        toast.success("Sort will be remembered for this list");
      } else {
        removeItem(sortKey);
        toast.success("Stopped remembering sort for this list");
      }
    },
    [sortKey]
  );

  const handleRememberColumns = useCallback(
    (remembered: boolean) => {
      const target = columnTargetRef.current;
      setRememberColumns(remembered);
      if (remembered && target) {
        setItem(
          columnsKey,
          JSON.stringify({
            preferences: target.preferences,
            variant: target.variant,
          })
        );
        toast.success("Columns will be remembered for this list");
      } else {
        removeItem(columnsKey);
        toast.success("Stopped remembering columns for this list");
      }
    },
    [columnsKey]
  );

  return useMemo(
    () => ({
      filterPersistence: {
        remembered: rememberFilters,
        onRememberedChange: handleRememberFilters,
      },
      sortPersistence: {
        remembered: rememberSort,
        onRememberedChange: handleRememberSort,
      },
      settingsPersistence: hasColumnTarget
        ? {
            remembered: rememberColumns,
            onRememberedChange: handleRememberColumns,
          }
        : undefined,
    }),
    [
      handleRememberColumns,
      handleRememberFilters,
      handleRememberSort,
      hasColumnTarget,
      rememberColumns,
      rememberFilters,
      rememberSort,
    ]
  );
}
