"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  isSameWeek,
  isValid,
  parseISO,
  startOfMonth,
  subMonths,
  subWeeks,
} from "date-fns";

import { getWeekStart } from "@/entities/calendar-item";
import {
  type CalendarFiltersState,
  DEFAULT_CALENDAR_FILTERS,
  FILTER_KEYS,
} from "@/features/calendar-filter";
import { getItem, removeItem, setItem } from "@/utils/persistentStorage";

import {
  type CalendarTimelineMode,
  type CalendarTimelineScale,
  DEFAULT_CALENDAR_TIMELINE_MODE,
  DEFAULT_CALENDAR_TIMELINE_SCALE,
} from "../model/types";

const STORAGE_KEY_MODE = "calendarViewMode";
const STORAGE_KEY_SCALE = "calendarViewScale";
const STORAGE_KEY_DATE = "calendarViewDate";

function readStoredMode(): CalendarTimelineMode | null {
  const raw = getItem(STORAGE_KEY_MODE);
  return raw === "grid" || raw === "timeline" ? raw : null;
}

function readStoredScale(): CalendarTimelineScale | null {
  const raw = getItem(STORAGE_KEY_SCALE);
  return raw === "week" || raw === "month" ? raw : null;
}

function readPersistedDate(): string | null {
  return getItem(STORAGE_KEY_DATE);
}

function writePersistedDate(value: string | null): void {
  if (value === null) removeItem(STORAGE_KEY_DATE);
  else setItem(STORAGE_KEY_DATE, value);
}

function filtersStorageKey(pathname: string): string {
  const page = pathname.replace(/\//g, "-").replace(/^-/, "") || "default";
  return `filters_${page}`;
}

function readStoredFilters(pathname: string): CalendarFiltersState | null {
  const raw = getItem(filtersStorageKey(pathname));
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const source = parsed as Record<string, unknown>;
  let hasAny = false;
  const result: CalendarFiltersState = { ...DEFAULT_CALENDAR_FILTERS };
  for (const key of FILTER_KEYS) {
    const value = source[key];
    if (!Array.isArray(value)) continue;
    const values = value.filter(
      (v): v is string => typeof v === "string" && v.length > 0
    );
    if (values.length === 0) continue;
    result[key] = values;
    hasAny = true;
  }
  return hasAny ? result : null;
}

function writeStoredFilters(
  pathname: string,
  filters: CalendarFiltersState
): void {
  const hasAny = FILTER_KEYS.some((key) => filters[key].length > 0);
  if (!hasAny) {
    removeItem(filtersStorageKey(pathname));
    return;
  }
  setItem(filtersStorageKey(pathname), JSON.stringify(filters));
}

function readMode(sp: URLSearchParams): CalendarTimelineMode {
  return sp.get("mode") === "grid" ? "grid" : DEFAULT_CALENDAR_TIMELINE_MODE;
}

function readScale(sp: URLSearchParams): CalendarTimelineScale {
  return sp.get("scale") === "week" ? "week" : DEFAULT_CALENDAR_TIMELINE_SCALE;
}

function resolveActiveDate(
  rawDate: string | null,
  scale: CalendarTimelineScale
): Date {
  if (rawDate) {
    const parsed = parseISO(rawDate);
    if (isValid(parsed)) {
      return scale === "week" ? getWeekStart(parsed) : startOfMonth(parsed);
    }
  }
  return scale === "week" ? getWeekStart(new Date()) : startOfMonth(new Date());
}

function readFilters(sp: URLSearchParams): CalendarFiltersState {
  const result: CalendarFiltersState = { ...DEFAULT_CALENDAR_FILTERS };
  for (const key of FILTER_KEYS) {
    const raw = sp.get(key);
    result[key] = raw ? raw.split(",").filter(Boolean) : [];
  }
  return result;
}

function isCurrentDate(date: Date, scale: CalendarTimelineScale): boolean {
  const today = new Date();
  return scale === "week"
    ? isSameWeek(date, today, { weekStartsOn: 0 })
    : isSameMonth(date, today);
}

export interface CalendarUrlState {
  mode: CalendarTimelineMode;
  scale: CalendarTimelineScale;
  activeDate: Date;
  filters: CalendarFiltersState;
  rangeLabel: string;
  isCurrentRange: boolean;
  setMode: (mode: CalendarTimelineMode) => void;
  setScale: (scale: CalendarTimelineScale) => void;
  setActiveDate: (date: Date) => void;
  setFilters: (filters: CalendarFiltersState) => void;
  prevRange: () => void;
  nextRange: () => void;
  jumpToCurrent: () => void;
}

/**
 * View-position state (mode, scale, date, filters) is mirrored to the URL so
 * refreshing or sharing a link preserves the user's view. Ephemeral UI state
 * (open popovers, modal visibility) stays in component state.
 *
 * Filters share the URL surface with view position, so they're round-tripped
 * through this hook even though their schema lives in `features/calendar-filter`.
 * Splitting URL ownership across hooks would race on `searchParams` writes.
 */
export function useCalendarUrlState(): CalendarUrlState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // useMemo keyed on searchParams keeps Date and filters object identities
  // stable across re-renders without URL changes, so downstream useMemo
  // dependencies don't churn.
  const mode = useMemo(() => readMode(searchParams), [searchParams]);
  const scale = useMemo(() => readScale(searchParams), [searchParams]);

  const [persistedDate, setPersistedDate] = useState<string | null>(null);
  useEffect(() => {
    setPersistedDate(readPersistedDate());
  }, []);

  const activeDate = useMemo(
    () => resolveActiveDate(searchParams.get("date") ?? persistedDate, scale),
    [searchParams, scale, persistedDate]
  );
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const updateUrl = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // On first mount, restore mode/scale and filters from localStorage when the
  // URL doesn't already pin them. URL params still win so refreshes and shared
  // links remain deterministic. Runs once via the ref guard — otherwise the
  // post-restore re-render writes the URL back to defaults.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const patch: Record<string, string | null> = {};
    if (!searchParams.has("mode")) {
      const storedMode = readStoredMode();
      if (storedMode && storedMode !== DEFAULT_CALENDAR_TIMELINE_MODE) {
        patch.mode = storedMode;
      }
    }
    if (!searchParams.has("scale")) {
      const storedScale = readStoredScale();
      if (storedScale && storedScale !== DEFAULT_CALENDAR_TIMELINE_SCALE) {
        patch.scale = storedScale;
      }
    }
    const urlHasAnyFilter = FILTER_KEYS.some((k) => searchParams.has(k));
    if (!urlHasAnyFilter) {
      const storedFilters = readStoredFilters(pathname);
      if (storedFilters) {
        for (const key of FILTER_KEYS) {
          patch[key] =
            storedFilters[key].length > 0 ? storedFilters[key].join(",") : null;
        }
      }
    }
    if (Object.keys(patch).length > 0) updateUrl(patch);
  }, [pathname, searchParams, updateUrl]);

  const setMode = useCallback(
    (next: CalendarTimelineMode) => {
      setItem(STORAGE_KEY_MODE, next);
      updateUrl({
        mode: next === DEFAULT_CALENDAR_TIMELINE_MODE ? null : next,
      });
    },
    [updateUrl]
  );

  // Snap the active date to the nearest range start when scale changes so the
  // stepper and visible-items filter line up with the new unit. If the user
  // is currently on "this month"/"this week", anchor on today rather than
  // activeDate — otherwise switching month→week from the current month lands
  // on the week containing day 1, which is usually the *previous* week.
  const setScale = useCallback(
    (newScale: CalendarTimelineScale) => {
      setItem(STORAGE_KEY_SCALE, newScale);
      const reference = isCurrentDate(activeDate, scale)
        ? new Date()
        : activeDate;
      const snapped =
        newScale === "week" ? getWeekStart(reference) : startOfMonth(reference);
      const dateValue = isCurrentDate(snapped, newScale)
        ? null
        : format(snapped, "yyyy-MM-dd");
      writePersistedDate(dateValue);
      setPersistedDate(dateValue);
      updateUrl({
        scale: newScale === DEFAULT_CALENDAR_TIMELINE_SCALE ? null : newScale,
        date: dateValue,
      });
    },
    [activeDate, scale, updateUrl]
  );

  const setActiveDate = useCallback(
    (next: Date) => {
      const dateValue = isCurrentDate(next, scale)
        ? null
        : format(next, "yyyy-MM-dd");
      writePersistedDate(dateValue);
      setPersistedDate(dateValue);
      updateUrl({ date: dateValue });
    },
    [scale, updateUrl]
  );

  const setFilters = useCallback(
    (next: CalendarFiltersState) => {
      writeStoredFilters(pathname, next);
      const patch: Record<string, string | null> = {
        scheduleType: null,
        status: null,
      };
      for (const key of FILTER_KEYS) {
        patch[key] = next[key].length > 0 ? next[key].join(",") : null;
      }
      updateUrl(patch);
    },
    [pathname, updateUrl]
  );

  const rangeLabel = useMemo(() => {
    if (scale === "week") {
      const end = endOfWeek(activeDate, { weekStartsOn: 0 });
      return isSameMonth(activeDate, end)
        ? `${format(activeDate, "dd")} - ${format(end, "dd MMM yyyy")}`
        : `${format(activeDate, "dd MMM")} - ${format(end, "dd MMM yyyy")}`;
    }
    return format(activeDate, "MMMM yyyy");
  }, [activeDate, scale]);

  const isCurrentRange = useMemo(
    () => isCurrentDate(activeDate, scale),
    [activeDate, scale]
  );

  const prevRange = useCallback(() => {
    setActiveDate(
      scale === "week" ? subWeeks(activeDate, 1) : subMonths(activeDate, 1)
    );
  }, [activeDate, scale, setActiveDate]);

  const nextRange = useCallback(() => {
    setActiveDate(
      scale === "week" ? addWeeks(activeDate, 1) : addMonths(activeDate, 1)
    );
  }, [activeDate, scale, setActiveDate]);

  const jumpToCurrent = useCallback(() => {
    setActiveDate(
      scale === "week" ? getWeekStart(new Date()) : startOfMonth(new Date())
    );
  }, [scale, setActiveDate]);

  return {
    mode,
    scale,
    activeDate,
    filters,
    rangeLabel,
    isCurrentRange,
    setMode,
    setScale,
    setActiveDate,
    setFilters,
    prevRange,
    nextRange,
    jumpToCurrent,
  };
}
