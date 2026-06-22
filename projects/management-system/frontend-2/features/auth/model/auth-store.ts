"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { AuthUser } from "./auth-types";

interface AuthStore {
  currentUser: AuthUser | null;
  loading: boolean;
  selectedOrganization: string | null;
  freshLogin: boolean;
  setCurrentUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setSelectedOrganization: (orgId: string | null) => void;
  setFreshLogin: (freshLogin: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentUser: null as AuthUser | null,
  loading: true,
  selectedOrganization: null as string | null,
  freshLogin: false,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setCurrentUser: (currentUser) => set({ currentUser }),
  setLoading: (loading) => set({ loading }),
  setSelectedOrganization: (selectedOrganization) =>
    set({ selectedOrganization }),
  setFreshLogin: (freshLogin) => set({ freshLogin }),
  reset: () => set(initialState),
}));

export function useAuthState() {
  return useAuthStore(
    useShallow((state) => ({
      currentUser: state.currentUser,
      loading: state.loading,
      selectedOrganization: state.selectedOrganization,
    }))
  );
}
