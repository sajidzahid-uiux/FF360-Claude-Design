"use client";

import { usePathname } from "next/navigation";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type BreadcrumbLabelOverrides = Record<string, string>;
type Listener = () => void;

const EMPTY_OVERRIDES: BreadcrumbLabelOverrides = {};

interface BreadcrumbOverrideStore {
  getOverrides: () => BreadcrumbLabelOverrides;
  setOverride: (pathname: string, label: string | null) => void;
  subscribe: (listener: Listener) => () => void;
}

function createBreadcrumbOverrideStore(): BreadcrumbOverrideStore {
  let overrides: BreadcrumbLabelOverrides = {};
  const listeners = new Set<Listener>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    getOverrides: () => overrides,
    setOverride: (pathname, label) => {
      if (label === null) {
        if (!(pathname in overrides)) return;
        const next = { ...overrides };
        delete next[pathname];
        overrides = next;
        notify();
        return;
      }

      if (overrides[pathname] === label) return;
      overrides = { ...overrides, [pathname]: label };
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const CmsBreadcrumbOverrideStoreContext =
  createContext<BreadcrumbOverrideStore | null>(null);

export function CmsBreadcrumbOverrideProvider({
  children,
}: {
  children: ReactNode;
}) {
  const store = useMemo(() => createBreadcrumbOverrideStore(), []);

  return (
    <CmsBreadcrumbOverrideStoreContext.Provider value={store}>
      {children}
    </CmsBreadcrumbOverrideStoreContext.Provider>
  );
}

function useBreadcrumbOverrideStore() {
  return useContext(CmsBreadcrumbOverrideStoreContext);
}

export function useCmsBreadcrumbOverrides(): BreadcrumbLabelOverrides {
  const store = useBreadcrumbOverrideStore();

  return useSyncExternalStore(
    (onStoreChange) => store?.subscribe(onStoreChange) ?? (() => undefined),
    () => store?.getOverrides() ?? EMPTY_OVERRIDES,
    () => EMPTY_OVERRIDES
  );
}

export function useCmsBreadcrumbLabel(
  label: string | undefined,
  options?: { targetPath?: string }
) {
  const pathname = usePathname();
  const targetPath = options?.targetPath ?? pathname;
  const store = useBreadcrumbOverrideStore();

  useEffect(() => {
    if (!store || !label?.trim()) return;

    const trimmedLabel = label.trim();
    store.setOverride(targetPath, trimmedLabel);

    return () => {
      store.setOverride(targetPath, null);
    };
  }, [store, label, targetPath]);
}

/** Injects an intermediate crumb before the opaque id on equipment detail routes. */
export function useCmsBreadcrumbIntermediate(
  overrideKey: string | undefined,
  label: string | undefined
) {
  const store = useBreadcrumbOverrideStore();

  useEffect(() => {
    if (!store || !overrideKey || !label?.trim()) return;

    const trimmedLabel = label.trim();
    store.setOverride(overrideKey, trimmedLabel);

    return () => {
      store.setOverride(overrideKey, null);
    };
  }, [store, label, overrideKey]);
}
