"use client";

import { useAuth0 } from "@auth0/auth0-react";

import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";

/** Gate org-scoped queries until Auth0 session and JWT are present. */
export function useOrgAuthenticatedQueryEnabled(
  orgId: string | null | undefined
): boolean {
  const { isAuthenticated, isLoading } = useAuth0();
  const token = useDataFromStorageByKey(StorageKey.ACCESS_TOKEN);

  return Boolean(orgId && token && isAuthenticated && !isLoading);
}
