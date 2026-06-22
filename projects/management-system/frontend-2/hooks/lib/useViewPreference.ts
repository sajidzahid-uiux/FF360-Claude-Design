"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ViewMode } from "@/constants";
import type { ViewMode as ViewModeType } from "@/constants";
import { usePersistentStorage } from "@/hooks/usePersistentStorage";
import { useRouteIds } from "@/hooks/useRouteIds";

export type ViewType = ViewModeType;

const ALL_VIEWS: readonly ViewType[] = [
  ViewMode.LIST,
  ViewMode.GRID,
  ViewMode.KANBAN,
];

/** Use for pages that only support list/grid (e.g. leads, equipment). */
export const VIEW_LIST_GRID: readonly ViewType[] = [
  ViewMode.LIST,
  ViewMode.GRID,
];

/**
 * Persisted view preference (list/grid/kanban) per route and org.
 * @param defaultView - Fallback when no saved preference or invalid.
 * @param allowedViews - Optional. When provided, only these views are allowed (e.g. ["list", "grid"] for leads/equipment).
 */
export function useViewPreference(
  defaultView: ViewType = ViewMode.LIST,
  allowedViews?: readonly ViewType[]
) {
  const pathname = usePathname();
  const storage = usePersistentStorage();
  const { orgId } = useRouteIds();
  const sanitizedPathname = pathname.replace(/^\//, "").replace(/\//g, "_");

  const storageKey = useMemo(
    () => `viewPreference_${sanitizedPathname}_org_${orgId ?? "default"}`,
    [sanitizedPathname, orgId]
  );

  const effectiveAllowed = useMemo(
    () => allowedViews ?? ALL_VIEWS,
    [allowedViews]
  );

  const [view, setViewState] = useState<ViewType>(() => {
    if (typeof window === "undefined") return defaultView;

    const saved = storage.getItem(storageKey);
    const parsed = ALL_VIEWS.includes(saved as ViewType)
      ? (saved as ViewType)
      : defaultView;
    return effectiveAllowed.includes(parsed) ? parsed : defaultView;
  });

  const lastSyncedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastSyncedKeyRef.current === storageKey) return;
    lastSyncedKeyRef.current = storageKey;

    const saved = storage.getItem(storageKey);
    const parsed = ALL_VIEWS.includes(saved as ViewType)
      ? (saved as ViewType)
      : null;

    if (parsed && effectiveAllowed.includes(parsed)) {
      setViewState(parsed);
    }
    // storage.getItem is stable (uses useCallback), safe to exclude from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, effectiveAllowed]);

  const setView = useCallback(
    (nextView: ViewType) => {
      if (!effectiveAllowed.includes(nextView)) return;

      setViewState(nextView);
      storage.setItem(storageKey, nextView);
    },
    [storage, storageKey, effectiveAllowed]
  );

  return {
    view,
    setView,
  };
}
