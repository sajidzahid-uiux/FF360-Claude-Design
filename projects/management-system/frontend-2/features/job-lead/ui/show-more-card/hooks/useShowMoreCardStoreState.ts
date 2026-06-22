"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import type { JobActiveInvoice } from "@/api/types";
import type { GeoLatLng } from "@/api/types/geo";
import {
  type ShowMoreCardScopeSlice,
  useShowMoreCardScopeActions,
  useShowMoreCardStore,
} from "@/features/job-lead/model/show-more-card-store";

import type { EntityDataState } from "../entityDataState";
import type { OneCallSite, TabName } from "../types";

interface UseShowMoreCardStoreStateOptions {
  scopeKey: string | null;
  defaultTab: string;
  initialVertices: GeoLatLng[];
  initialLocation: GeoLatLng | null;
  initialLoading: boolean;
  initialEntityDataState: EntityDataState;
}

export function useShowMoreCardStoreState({
  scopeKey,
  defaultTab,
  initialVertices,
  initialLocation,
  initialLoading,
  initialEntityDataState,
}: UseShowMoreCardStoreStateOptions) {
  const { ensureScope, removeScope, patchScope } =
    useShowMoreCardScopeActions();
  const scopeInitRef = useRef<{
    scopeKey: string | null;
    defaults: Omit<UseShowMoreCardStoreStateOptions, "scopeKey"> | null;
  }>({ scopeKey: null, defaults: null });

  if (scopeKey !== scopeInitRef.current.scopeKey) {
    scopeInitRef.current = {
      scopeKey,
      defaults: {
        defaultTab,
        initialVertices,
        initialLocation,
        initialLoading,
        initialEntityDataState,
      },
    };
  }

  useEffect(() => {
    if (!scopeKey) return;

    const defaults = scopeInitRef.current.defaults;
    if (!defaults) return;

    ensureScope(scopeKey, {
      activeTab: defaults.defaultTab,
      tempVertices: defaults.initialVertices,
      tempLocation: defaults.initialLocation,
      loading: defaults.initialLoading,
      entityDataState: defaults.initialEntityDataState,
    });

    return () => {
      removeScope(scopeKey);
    };
  }, [ensureScope, removeScope, scopeKey]);

  const slice = useShowMoreCardStore((state) =>
    scopeKey ? state.scopes[scopeKey] : undefined
  );

  const patch = useCallback(
    (patchValue: Partial<ShowMoreCardScopeSlice>) => {
      if (!scopeKey) return;
      patchScope(scopeKey, patchValue);
    },
    [patchScope, scopeKey]
  );

  const setActiveTab = useCallback(
    (activeTab: TabName) => {
      patch({ activeTab });
    },
    [patch]
  );

  const setShowUploadFile = useCallback(
    (showUploadFile: boolean) => {
      patch({ showUploadFile });
    },
    [patch]
  );

  const setSelectedFileType = useCallback(
    (selectedFileType: string) => {
      patch({ selectedFileType });
    },
    [patch]
  );

  const setSelectedFileName = useCallback(
    (selectedFileName: string) => {
      patch({ selectedFileName });
    },
    [patch]
  );

  const setIsFixedTitle = useCallback(
    (isFixedTitle: boolean) => {
      patch({ isFixedTitle });
    },
    [patch]
  );

  const setPendingUploadFile = useCallback(
    (pendingUploadFile: File | null) => {
      patch({ pendingUploadFile });
    },
    [patch]
  );

  const setUploading = useCallback(
    (uploading: boolean) => {
      patch({ uploading });
    },
    [patch]
  );

  const setUploadFileProgress = useCallback(
    (uploadFileProgress: number | null) => {
      patch({ uploadFileProgress });
    },
    [patch]
  );

  const setCheckedFiles = useCallback(
    (value: number[] | ((prev: number[]) => number[])) => {
      if (!scopeKey) return;
      if (typeof value === "function") {
        const prev =
          useShowMoreCardStore.getState().scopes[scopeKey]?.checkedFiles ?? [];
        patchScope(scopeKey, { checkedFiles: value(prev) });
        return;
      }
      patch({ checkedFiles: value });
    },
    [patch, patchScope, scopeKey]
  );

  const setInvoiceCheckLoading = useCallback(
    (invoiceCheckLoading: boolean) => {
      patch({ invoiceCheckLoading });
    },
    [patch]
  );

  const setEntityInvoice = useCallback(
    (
      value:
        | JobActiveInvoice
        | null
        | ((prev: JobActiveInvoice | null) => JobActiveInvoice | null)
    ) => {
      if (!scopeKey) return;
      if (typeof value === "function") {
        const prev =
          useShowMoreCardStore.getState().scopes[scopeKey]?.entityInvoice ??
          null;
        patchScope(scopeKey, { entityInvoice: value(prev) });
        return;
      }
      patch({ entityInvoice: value });
    },
    [patch, patchScope, scopeKey]
  );

  const setSites = useCallback(
    (value: OneCallSite[] | ((prev: OneCallSite[]) => OneCallSite[])) => {
      if (!scopeKey) return;
      if (typeof value === "function") {
        const prev = (useShowMoreCardStore.getState().scopes[scopeKey]?.sites ??
          []) as OneCallSite[];
        patchScope(scopeKey, { sites: value(prev) });
        return;
      }
      patch({ sites: value });
    },
    [patch, patchScope, scopeKey]
  );

  const setOneCallError = useCallback(
    (oneCallError: string | null) => {
      patch({ oneCallError });
    },
    [patch]
  );

  const setEditingMap = useCallback(
    (editingMap: boolean) => {
      patch({ editingMap });
    },
    [patch]
  );

  const setIsCorePointMode = useCallback(
    (isCorePointMode: boolean) => {
      patch({ isCorePointMode });
    },
    [patch]
  );

  const setIsPinMode = useCallback(
    (isPinMode: boolean) => {
      patch({ isPinMode });
    },
    [patch]
  );

  const setTriggerBoundaryMapCenter = useCallback(
    (triggerBoundaryMapCenter: boolean) => {
      patch({ triggerBoundaryMapCenter });
    },
    [patch]
  );

  const setTempVertices = useCallback(
    (value: GeoLatLng[] | ((prev: GeoLatLng[]) => GeoLatLng[])) => {
      if (!scopeKey) return;
      if (typeof value === "function") {
        const prev =
          useShowMoreCardStore.getState().scopes[scopeKey]?.tempVertices ?? [];
        patchScope(scopeKey, { tempVertices: value(prev) });
        return;
      }
      patch({ tempVertices: value });
    },
    [patch, patchScope, scopeKey]
  );

  const setTempLocation = useCallback(
    (tempLocation: GeoLatLng | null) => {
      patch({ tempLocation });
    },
    [patch]
  );

  const setUserLocation = useCallback(
    (userLocation: GeoLatLng | null) => {
      patch({ userLocation });
    },
    [patch]
  );

  const setLocationError = useCallback(
    (locationError: string | null) => {
      patch({ locationError });
    },
    [patch]
  );

  const setLoading = useCallback(
    (loading: boolean) => {
      patch({ loading });
    },
    [patch]
  );

  return useMemo(
    () => ({
      activeTab: (slice?.activeTab ?? defaultTab) as TabName,
      setActiveTab,
      showUploadFile: slice?.showUploadFile ?? false,
      setShowUploadFile,
      selectedFileType: slice?.selectedFileType ?? "contractor",
      setSelectedFileType,
      selectedFileName: slice?.selectedFileName ?? "",
      setSelectedFileName,
      isFixedTitle: slice?.isFixedTitle ?? false,
      setIsFixedTitle,
      pendingUploadFile: slice?.pendingUploadFile ?? null,
      setPendingUploadFile,
      uploading: slice?.uploading ?? false,
      setUploading,
      uploadFileProgress: slice?.uploadFileProgress ?? null,
      setUploadFileProgress,
      checkedFiles: slice?.checkedFiles ?? [],
      setCheckedFiles,
      invoiceCheckLoading: slice?.invoiceCheckLoading ?? false,
      setInvoiceCheckLoading,
      entityInvoice: slice?.entityInvoice ?? null,
      setEntityInvoice,
      sites: (slice?.sites ?? []) as OneCallSite[],
      setSites,
      oneCallError: slice?.oneCallError ?? null,
      setOneCallError,
      editingMap: slice?.editingMap ?? false,
      setEditingMap,
      isCorePointMode: slice?.isCorePointMode ?? false,
      setIsCorePointMode,
      isPinMode: slice?.isPinMode ?? false,
      setIsPinMode,
      triggerBoundaryMapCenter: slice?.triggerBoundaryMapCenter ?? false,
      setTriggerBoundaryMapCenter,
      tempVertices: slice?.tempVertices ?? initialVertices,
      setTempVertices,
      tempLocation: slice?.tempLocation ?? initialLocation,
      setTempLocation,
      userLocation: slice?.userLocation ?? null,
      setUserLocation,
      locationError: slice?.locationError ?? null,
      setLocationError,
      loading: slice?.loading ?? initialLoading,
      setLoading,
      scopeKey,
    }),
    [
      defaultTab,
      initialLoading,
      initialLocation,
      initialVertices,
      scopeKey,
      setActiveTab,
      setCheckedFiles,
      setEditingMap,
      setEntityInvoice,
      setInvoiceCheckLoading,
      setIsCorePointMode,
      setIsFixedTitle,
      setIsPinMode,
      setLoading,
      setLocationError,
      setOneCallError,
      setPendingUploadFile,
      setSelectedFileName,
      setSelectedFileType,
      setShowUploadFile,
      setSites,
      setTempLocation,
      setTempVertices,
      setTriggerBoundaryMapCenter,
      setUploadFileProgress,
      setUploading,
      setUserLocation,
      slice,
    ]
  );
}
