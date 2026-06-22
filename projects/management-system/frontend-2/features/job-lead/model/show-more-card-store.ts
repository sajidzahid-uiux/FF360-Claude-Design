"use client";

import { useCallback, useMemo } from "react";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { JobActiveInvoice } from "@/api/types";
import type { GeoLatLng } from "@/api/types/geo";
import type { EntityDataState } from "@/features/job-lead/ui/show-more-card/entityDataState";

export interface ShowMoreCardScopeSlice {
  activeTab: string;
  entityDataState: EntityDataState;
  showUploadFile: boolean;
  selectedFileType: string;
  selectedFileName: string;
  isFixedTitle: boolean;
  pendingUploadFile: File | null;
  uploading: boolean;
  uploadFileProgress: number | null;
  checkedFiles: number[];
  invoiceCheckLoading: boolean;
  entityInvoice: JobActiveInvoice | null;
  editingMap: boolean;
  isCorePointMode: boolean;
  isPinMode: boolean;
  triggerBoundaryMapCenter: boolean;
  tempVertices: GeoLatLng[];
  tempLocation: GeoLatLng | null;
  userLocation: GeoLatLng | null;
  locationError: string | null;
  sites: unknown[];
  oneCallError: string | null;
  loading: boolean;
}

const DEFAULT_SCOPE_SLICE: ShowMoreCardScopeSlice = {
  activeTab: "Job Details",
  entityDataState: {},
  showUploadFile: false,
  selectedFileType: "contractor",
  selectedFileName: "",
  isFixedTitle: false,
  pendingUploadFile: null,
  uploading: false,
  uploadFileProgress: null,
  checkedFiles: [],
  invoiceCheckLoading: false,
  entityInvoice: null,
  editingMap: false,
  isCorePointMode: false,
  isPinMode: false,
  triggerBoundaryMapCenter: false,
  tempVertices: [],
  tempLocation: null,
  userLocation: null,
  locationError: null,
  sites: [],
  oneCallError: null,
  loading: false,
};

const EMPTY_MAP_VERTICES: GeoLatLng[] = [];

const EMPTY_MAP_UI_STATE = {
  editingMap: false,
  isCorePointMode: false,
  isPinMode: false,
  tempVertices: EMPTY_MAP_VERTICES,
  tempLocation: null as GeoLatLng | null,
  triggerBoundaryMapCenter: false,
  userLocation: null as GeoLatLng | null,
  locationError: null as string | null,
};

function noopPatch() {}
function noopSetBool() {}
function noopSetTempVertices() {}
function noopSetTempLocation() {}
function noopResetMap() {}

const EMPTY_MAP_UI = {
  ...EMPTY_MAP_UI_STATE,
  setTriggerBoundaryMapCenter: noopSetBool,
  setTempVertices: noopSetTempVertices,
  setTempLocation: noopSetTempLocation,
  patch: noopPatch,
  resetMap: noopResetMap,
};

function resolveSlice(
  scopes: Record<string, ShowMoreCardScopeSlice>,
  scopeKey: string
): ShowMoreCardScopeSlice {
  return scopes[scopeKey] ?? DEFAULT_SCOPE_SLICE;
}

interface ShowMoreCardStore {
  activeScopeKey: string | null;
  scopes: Record<string, ShowMoreCardScopeSlice>;
  setActiveScopeKey: (scopeKey: string | null) => void;
  ensureScope: (
    scopeKey: string,
    defaults?: Partial<ShowMoreCardScopeSlice>
  ) => void;
  patchScope: (
    scopeKey: string,
    patch: Partial<ShowMoreCardScopeSlice>
  ) => void;
  resetScopeMap: (scopeKey: string) => void;
  removeScope: (scopeKey: string) => void;
}

export const useShowMoreCardStore = create<ShowMoreCardStore>((set, get) => ({
  activeScopeKey: null,
  scopes: {},

  setActiveScopeKey: (activeScopeKey) => {
    set({ activeScopeKey });
  },

  ensureScope: (scopeKey, defaults) => {
    const existing = get().scopes[scopeKey];
    if (existing) {
      set({ activeScopeKey: scopeKey });
      return;
    }
    set((state) => ({
      activeScopeKey: scopeKey,
      scopes: {
        ...state.scopes,
        [scopeKey]: {
          ...DEFAULT_SCOPE_SLICE,
          ...defaults,
        },
      },
    }));
  },

  patchScope: (scopeKey, patch) => {
    set((state) => {
      const current = resolveSlice(state.scopes, scopeKey);
      const hasChange = (
        Object.entries(patch) as Array<
          [
            keyof ShowMoreCardScopeSlice,
            ShowMoreCardScopeSlice[keyof ShowMoreCardScopeSlice],
          ]
        >
      ).some(([key, value]) => current[key] !== value);
      if (!hasChange) {
        return state;
      }

      return {
        scopes: {
          ...state.scopes,
          [scopeKey]: {
            ...current,
            ...patch,
          },
        },
      };
    });
  },

  resetScopeMap: (scopeKey) => {
    set((state) => ({
      scopes: {
        ...state.scopes,
        [scopeKey]: {
          ...resolveSlice(state.scopes, scopeKey),
          editingMap: false,
          isCorePointMode: false,
          isPinMode: false,
          triggerBoundaryMapCenter: false,
          tempVertices: [],
          tempLocation: null,
        },
      },
    }));
  },

  removeScope: (scopeKey) => {
    set((state) => {
      const nextScopes = { ...state.scopes };
      delete nextScopes[scopeKey];
      return {
        scopes: nextScopes,
        activeScopeKey:
          state.activeScopeKey === scopeKey ? null : state.activeScopeKey,
      };
    });
  },
}));

export function useShowMoreCardScopeActions() {
  return useShowMoreCardStore(
    useShallow((state) => ({
      setActiveScopeKey: state.setActiveScopeKey,
      ensureScope: state.ensureScope,
      patchScope: state.patchScope,
      resetScopeMap: state.resetScopeMap,
      removeScope: state.removeScope,
    }))
  );
}

export function useShowMoreCardScopeKey(): string | null {
  return useShowMoreCardStore((state) => state.activeScopeKey);
}

export function useShowMoreCardUi(scopeKey: string | null) {
  const slice = useShowMoreCardStore((state) =>
    scopeKey ? resolveSlice(state.scopes, scopeKey) : DEFAULT_SCOPE_SLICE
  );
  const patchScope = useShowMoreCardStore((state) => state.patchScope);

  const patch = useCallback(
    (patchValue: Partial<ShowMoreCardScopeSlice>) => {
      if (!scopeKey) return;
      patchScope(scopeKey, patchValue);
    },
    [patchScope, scopeKey]
  );

  return useMemo(
    () => ({
      slice,
      patch,
    }),
    [patch, slice]
  );
}

export function useShowMoreCardActiveTab(scopeKey: string | null) {
  const activeTab = useShowMoreCardStore((state) =>
    scopeKey ? resolveSlice(state.scopes, scopeKey).activeTab : null
  );
  const patchScope = useShowMoreCardStore((state) => state.patchScope);

  const setActiveTab = useCallback(
    (tab: string) => {
      if (!scopeKey) return;
      patchScope(scopeKey, { activeTab: tab });
    },
    [patchScope, scopeKey]
  );

  return useMemo(
    () => ({
      activeTab,
      setActiveTab,
    }),
    [activeTab, setActiveTab]
  );
}

export function useShowMoreCardEntity(scopeKey: string | null) {
  const entityDataState = useShowMoreCardStore((state) =>
    scopeKey
      ? resolveSlice(state.scopes, scopeKey).entityDataState
      : DEFAULT_SCOPE_SLICE.entityDataState
  );
  const patchScope = useShowMoreCardStore((state) => state.patchScope);

  const setEntityDataState = useCallback(
    (value: EntityDataState | ((prev: EntityDataState) => EntityDataState)) => {
      if (!scopeKey) return;
      const prev =
        useShowMoreCardStore.getState().scopes[scopeKey]?.entityDataState ?? {};
      const next = typeof value === "function" ? value(prev) : value;
      if (Object.is(next, prev)) return;
      patchScope(scopeKey, { entityDataState: next });
    },
    [patchScope, scopeKey]
  );

  return useMemo(
    () => ({
      entityDataState,
      setEntityDataState,
    }),
    [entityDataState, setEntityDataState]
  );
}

export function useShowMoreCardMapUi(scopeKey: string | null) {
  const mapState = useShowMoreCardStore(
    useShallow((state) => {
      if (!scopeKey) {
        return EMPTY_MAP_UI_STATE;
      }

      const slice = resolveSlice(state.scopes, scopeKey);
      return {
        editingMap: slice.editingMap,
        isCorePointMode: slice.isCorePointMode,
        isPinMode: slice.isPinMode,
        tempVertices: slice.tempVertices,
        tempLocation: slice.tempLocation,
        triggerBoundaryMapCenter: slice.triggerBoundaryMapCenter,
        userLocation: slice.userLocation,
        locationError: slice.locationError,
      };
    })
  );

  const patchScope = useShowMoreCardStore((state) => state.patchScope);
  const resetScopeMap = useShowMoreCardStore((state) => state.resetScopeMap);

  const setTriggerBoundaryMapCenter = useCallback(
    (triggerBoundaryMapCenter: boolean) => {
      if (!scopeKey) return;
      patchScope(scopeKey, { triggerBoundaryMapCenter });
    },
    [patchScope, scopeKey]
  );

  const setTempVertices = useCallback(
    (value: GeoLatLng[] | ((prev: GeoLatLng[]) => GeoLatLng[])) => {
      if (!scopeKey) return;
      const prev =
        useShowMoreCardStore.getState().scopes[scopeKey]?.tempVertices ??
        EMPTY_MAP_VERTICES;
      const next = typeof value === "function" ? value(prev) : value;
      patchScope(scopeKey, { tempVertices: next });
    },
    [patchScope, scopeKey]
  );

  const setTempLocation = useCallback(
    (tempLocation: GeoLatLng | null) => {
      if (!scopeKey) return;
      patchScope(scopeKey, { tempLocation });
    },
    [patchScope, scopeKey]
  );

  const patch = useCallback(
    (patchValue: Partial<ShowMoreCardScopeSlice>) => {
      if (!scopeKey) return;
      patchScope(scopeKey, patchValue);
    },
    [patchScope, scopeKey]
  );

  const resetMap = useCallback(() => {
    if (!scopeKey) return;
    resetScopeMap(scopeKey);
  }, [resetScopeMap, scopeKey]);

  return useMemo(() => {
    if (!scopeKey) {
      return EMPTY_MAP_UI;
    }

    return {
      ...mapState,
      setTriggerBoundaryMapCenter,
      setTempVertices,
      setTempLocation,
      patch,
      resetMap,
    };
  }, [
    mapState,
    patch,
    resetMap,
    scopeKey,
    setTempLocation,
    setTempVertices,
    setTriggerBoundaryMapCenter,
  ]);
}
