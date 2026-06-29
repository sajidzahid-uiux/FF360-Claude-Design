"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  TableFilterValue,
  TableRefinementPersistence,
  TableSortRule,
} from "@fieldflow360/org-ui";

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

export interface UseTableRefinementMemoryOptions {
  /** Stable per-list identity, e.g. "leads-repair" or "jobs-excavation". */
  storageKeyPrefix: string;
  organizationId?: string | number | null;
  filterValues: TableFilterValue[];
  onFilterValuesChange: (values: TableFilterValue[]) => void;
  sortRules: TableSortRule[];
  onSortRulesChange: (rules: TableSortRule[]) => void;
}

export interface UseTableRefinementMemoryResult {
  filterPersistence: TableRefinementPersistence;
  sortPersistence: TableRefinementPersistence;
}

/**
 * Backs the "Remember filters / sort for this list" toggles in the table
 * toolbar. The CMS table-query store is in-memory only, so this is what makes a
 * list's filters and sort survive a reload. When a toggle is on, the current
 * refinement is snapshotted to localStorage and kept in sync; on mount the
 * saved refinement is restored back into the (parent-owned) query state.
 */
export function useTableRefinementMemory({
  storageKeyPrefix,
  organizationId,
  filterValues,
  onFilterValuesChange,
  sortRules,
  onSortRulesChange,
}: UseTableRefinementMemoryOptions): UseTableRefinementMemoryResult {
  const base = `refine_${sanitizeKeyPart(storageKeyPrefix)}_org${sanitizeKeyPart(
    organizationId
  )}`;
  const filtersKey = `${base}_filters`;
  const sortKey = `${base}_sort`;

  const [rememberFilters, setRememberFilters] = useState(false);
  const [rememberSort, setRememberSort] = useState(false);

  // Latest values/handlers in refs so the restore effect keys on identity only.
  const filterValuesRef = useRef(filterValues);
  const sortRulesRef = useRef(sortRules);
  const onFilterValuesChangeRef = useRef(onFilterValuesChange);
  const onSortRulesChangeRef = useRef(onSortRulesChange);
  filterValuesRef.current = filterValues;
  sortRulesRef.current = sortRules;
  onFilterValuesChangeRef.current = onFilterValuesChange;
  onSortRulesChangeRef.current = onSortRulesChange;

  // Restore the saved refinement whenever the list identity changes.
  useEffect(() => {
    const storedFilters = readArray<TableFilterValue>(filtersKey);
    const storedSort = readArray<TableSortRule>(sortKey);
    setRememberFilters(storedFilters !== null);
    setRememberSort(storedSort !== null);
    if (storedFilters) onFilterValuesChangeRef.current(storedFilters);
    if (storedSort) onSortRulesChangeRef.current(storedSort);
  }, [filtersKey, sortKey]);

  // Keep the saved snapshot in sync while the toggle stays on.
  useEffect(() => {
    if (rememberFilters) setItem(filtersKey, JSON.stringify(filterValues));
  }, [rememberFilters, filterValues, filtersKey]);

  useEffect(() => {
    if (rememberSort) setItem(sortKey, JSON.stringify(sortRules));
  }, [rememberSort, sortRules, sortKey]);

  const handleRememberFilters = useCallback(
    (remembered: boolean) => {
      setRememberFilters(remembered);
      if (remembered) {
        setItem(filtersKey, JSON.stringify(filterValuesRef.current));
      } else {
        removeItem(filtersKey);
      }
    },
    [filtersKey]
  );

  const handleRememberSort = useCallback(
    (remembered: boolean) => {
      setRememberSort(remembered);
      if (remembered) {
        setItem(sortKey, JSON.stringify(sortRulesRef.current));
      } else {
        removeItem(sortKey);
      }
    },
    [sortKey]
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
    }),
    [handleRememberFilters, handleRememberSort, rememberFilters, rememberSort]
  );
}
