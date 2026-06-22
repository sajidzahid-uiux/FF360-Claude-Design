"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export type JobAssignedToFilterMemberOption = { id: number; label: string };

interface JobAssignedToFilterStore {
  orgId: string | null;
  assignedTo: string | null;
  hydrated: boolean;
  isPersisting: boolean;
  setOrgId: (orgId: string | null) => void;
  setAssignedTo: (assignedTo: string | null) => void;
  setHydrated: (hydrated: boolean) => void;
  setIsPersisting: (isPersisting: boolean) => void;
  resetForOrg: (orgId: string | null) => void;
}

export const useJobAssignedToFilterStore = create<JobAssignedToFilterStore>(
  (set) => ({
    orgId: null,
    assignedTo: null,
    hydrated: false,
    isPersisting: false,

    setOrgId: (orgId) => {
      set({ orgId });
    },

    setAssignedTo: (assignedTo) => {
      set({ assignedTo });
    },

    setHydrated: (hydrated) => {
      set({ hydrated });
    },

    setIsPersisting: (isPersisting) => {
      set({ isPersisting });
    },

    resetForOrg: (orgId) => {
      set({
        orgId,
        assignedTo: null,
        hydrated: false,
        isPersisting: false,
      });
    },
  })
);

export function useJobAssignedToFilterState() {
  return useJobAssignedToFilterStore(
    useShallow((state) => ({
      assignedTo: state.assignedTo,
      hydrated: state.hydrated,
      isPersisting: state.isPersisting,
    }))
  );
}

export function useJobAssignedToFilterActions() {
  return useJobAssignedToFilterStore(
    useShallow((state) => ({
      setAssignedTo: state.setAssignedTo,
      setHydrated: state.setHydrated,
      setIsPersisting: state.setIsPersisting,
      resetForOrg: state.resetForOrg,
      setOrgId: state.setOrgId,
    }))
  );
}

export function useJobAssignedToQueryParam(): string | undefined {
  const { assignedTo, hydrated } = useJobAssignedToFilterStore(
    useShallow((state) => ({
      assignedTo: state.assignedTo,
      hydrated: state.hydrated,
    }))
  );

  const isPreferenceReady = hydrated && assignedTo !== null;
  if (!isPreferenceReady || assignedTo === null) return undefined;
  return assignedTo;
}
