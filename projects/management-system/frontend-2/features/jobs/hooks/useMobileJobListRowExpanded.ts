"use client";

import { useCallback, useSyncExternalStore } from "react";

const expandedByJobId = new Map<number, boolean>();
const listenersByJobId = new Map<number, Set<() => void>>();

function subscribe(jobId: number, onStoreChange: () => void): () => void {
  let listeners = listenersByJobId.get(jobId);
  if (!listeners) {
    listeners = new Set();
    listenersByJobId.set(jobId, listeners);
  }
  listeners.add(onStoreChange);
  return () => {
    listeners?.delete(onStoreChange);
  };
}

function getSnapshot(jobId: number): boolean {
  return expandedByJobId.get(jobId) ?? false;
}

function notify(jobId: number): void {
  listenersByJobId.get(jobId)?.forEach((listener) => listener());
}

export function useMobileJobListRowExpanded(jobId: number) {
  const expanded = useSyncExternalStore(
    (onStoreChange) => subscribe(jobId, onStoreChange),
    () => getSnapshot(jobId),
    () => false
  );

  const toggle = useCallback(() => {
    expandedByJobId.set(jobId, !getSnapshot(jobId));
    notify(jobId);
  }, [jobId]);

  return { expanded, toggle };
}
