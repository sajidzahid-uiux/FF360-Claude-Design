"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type {
  DesignRequestPanelTab,
  DesignRequestSourceType,
  DesignRequestStatusItem,
} from "@/api/types/designRequest";

import type { DesignRequestEntityContext } from "../lib/design-request-entity-context";

export interface DesignRequestPanelScope {
  organizationId: string;
  sourceType: DesignRequestSourceType;
  sourceId: number;
  entity: DesignRequestEntityContext;
}

interface DesignRequestPanelStore {
  isOpen: boolean;
  scope: DesignRequestPanelScope | null;
  activeTab: DesignRequestPanelTab;
  resubmitMode: boolean;
  optimisticStatus: DesignRequestStatusItem | null;
  openPanel: (scope: DesignRequestPanelScope) => void;
  closePanel: () => void;
  setActiveTab: (tab: DesignRequestPanelTab) => void;
  setResubmitMode: (mode: boolean) => void;
  setOptimisticStatus: (item: DesignRequestStatusItem | null) => void;
  resetPanelUi: () => void;
}

const DEFAULT_PANEL_UI = {
  activeTab: "details" as DesignRequestPanelTab,
  resubmitMode: false,
  optimisticStatus: null as DesignRequestStatusItem | null,
};

export const useDesignRequestPanelStore = create<DesignRequestPanelStore>(
  (set) => ({
    isOpen: false,
    scope: null,
    ...DEFAULT_PANEL_UI,

    openPanel: (scope) => {
      set({ isOpen: true, scope });
    },

    closePanel: () => {
      set({ isOpen: false, ...DEFAULT_PANEL_UI });
    },

    setActiveTab: (activeTab) => {
      set({ activeTab });
    },

    setResubmitMode: (resubmitMode) => {
      set({ resubmitMode });
    },

    setOptimisticStatus: (optimisticStatus) => {
      set({ optimisticStatus });
    },

    resetPanelUi: () => {
      set(DEFAULT_PANEL_UI);
    },
  })
);

export function useDesignRequestPanelScope() {
  return useDesignRequestPanelStore(useShallow((state) => state.scope));
}

export function useDesignRequestPanelUi() {
  return useDesignRequestPanelStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      scope: state.scope,
      activeTab: state.activeTab,
      resubmitMode: state.resubmitMode,
      closePanel: state.closePanel,
      setActiveTab: state.setActiveTab,
      setResubmitMode: state.setResubmitMode,
      setOptimisticStatus: state.setOptimisticStatus,
      resetPanelUi: state.resetPanelUi,
    }))
  );
}

export function useDesignRequestPanelIntegration() {
  return useDesignRequestPanelStore(
    useShallow((state) => ({
      openPanel: state.openPanel,
      optimisticStatus: state.optimisticStatus,
    }))
  );
}

export function useDesignRequestOptimisticStatusSync() {
  return useDesignRequestPanelStore(
    useShallow((state) => ({
      optimisticStatus: state.optimisticStatus,
      setOptimisticStatus: state.setOptimisticStatus,
    }))
  );
}
