"use client";

import { getAuthRuntimeActions } from "@/features/auth/model/auth-actions";
import { useAuthState } from "@/features/auth/model/auth-store";

function requireAuthActions() {
  const actions = getAuthRuntimeActions();
  if (!actions) {
    throw new Error("useAuth requires AuthSync to be mounted");
  }
  return actions;
}

export function useAuth() {
  const state = useAuthState();
  const actions = requireAuthActions();

  return {
    ...state,
    logout: actions.logout,
    fetchOrganizations: actions.fetchOrganizations,
    setSelectedOrganization: actions.setSelectedOrganization,
    syncOrgFromUrl: actions.syncOrgFromUrl,
    getAccessToken: actions.getAccessToken,
    refreshToken: actions.refreshToken,
  };
}
