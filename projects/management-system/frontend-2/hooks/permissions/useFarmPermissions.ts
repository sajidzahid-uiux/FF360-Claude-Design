"use client";

import { useMemo } from "react";

import { PERMISSION_RESOURCES } from "./constants";
import { resolveFarmPermissionFlags } from "./permissionRules";
import type { FarmPermissionFlags } from "./types";
import { usePermissionsFromStorage } from "./usePermissionsFromStorage";

/**
 * Hook to check farm permissions (read, add, edit, delete) for the contact farm tab.
 * Follows DRY and SRP principles by centralizing permission logic.
 *
 * @returns Object with canRead, canAdd, canEdit, canDelete flags and isLoading state
 *
 * @example
 * const { canRead, canAdd, canEdit, canDelete } = useFarmPermissions();
 * if (canAdd) {
 *   // Show add farm button
 * }
 * if (canEdit) {
 *   // Show edit farm button
 * }
 */
export function useFarmPermissions(): FarmPermissionFlags {
  const { permissionCodes, isLoading } = usePermissionsFromStorage(
    PERMISSION_RESOURCES.CONTACT_FARM_TAB
  );

  return useMemo(
    () => ({
      ...resolveFarmPermissionFlags(permissionCodes),
      isLoading,
    }),
    [permissionCodes, isLoading]
  );
}
