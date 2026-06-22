"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export interface TrialSubscriptionInfo {
  trialing: boolean;
  remaining_days: number;
}

interface UserState {
  trialSubscription: TrialSubscriptionInfo | null;
  setTrialSubscription: (info: TrialSubscriptionInfo | null) => void;
  clearTrialSubscription: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  trialSubscription: null,
  setTrialSubscription: (info) => set({ trialSubscription: info }),
  clearTrialSubscription: () => set({ trialSubscription: null }),
}));

export function useTrialSubscription() {
  return useUserStore((state) => state.trialSubscription);
}

export function useTrialSubscriptionActions() {
  return useUserStore(
    useShallow((state) => ({
      setTrialSubscription: state.setTrialSubscription,
      clearTrialSubscription: state.clearTrialSubscription,
    }))
  );
}
