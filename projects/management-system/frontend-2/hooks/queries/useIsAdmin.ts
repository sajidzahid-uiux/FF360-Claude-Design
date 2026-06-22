import { useMemo } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";

import { useUserRole } from "./useUserPermissions";

function isAdminRole(
  role: { is_admin?: boolean; name?: string | null } | null
) {
  if (!role) return false;
  return role.is_admin === true || role.name === "Admin";
}

/**
 * Hook to check if the current user is an admin.
 * Follows DRY principle by centralizing admin check logic.
 *
 * @returns boolean indicating if user is admin
 *
 * @example
 * const isAdmin = useIsAdmin();
 * if (isAdmin) {
 *   // Show admin-only features
 * }
 */
export const useIsAdmin = (): boolean => {
  const { data: userRole } = useUserRole();
  const cachedRole = useDataFromStorageByKey(StorageKey.USER_ROLE) as {
    is_admin?: boolean;
    name?: string | null;
  } | null;
  const { currentUser } = useAuth();

  return useMemo(() => {
    if (isAdminRole(userRole ?? null)) return true;
    if (isAdminRole(cachedRole)) return true;
    if (isAdminRole(currentUser?.roleDetails ?? null)) return true;
    return false;
  }, [userRole, cachedRole, currentUser?.roleDetails]);
};
