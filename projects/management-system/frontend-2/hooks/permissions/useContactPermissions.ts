"use client";

import { useMemo } from "react";

import { PERMISSION_RESOURCES } from "./constants";
import { resolveContactPermissionFlags } from "./permissionRules";
import type { ContactPermissionFlags } from "./types";
import { usePermissionsFromStorage } from "./usePermissionsFromStorage";

/**
 * Hook to check contact permissions (read, write, delete) for contact access.
 * Follows DRY and SRP principles by centralizing permission logic.
 *
 * @returns Object with canRead, canAdd, canDelete flags and isLoading state
 *
 * @example
 * const { canRead, canAdd, canDelete } = useContactPermissions();
 * if (canRead) {
 *   // Show contact information
 * }
 * if (canAdd) {
 *   // Show add contact button
 * }
 */
export function useContactPermissions(): ContactPermissionFlags {
  const { permissionCodes, isLoading } = usePermissionsFromStorage(
    PERMISSION_RESOURCES.CONTACT_ACCESS
  );

  return useMemo(
    () => ({
      ...resolveContactPermissionFlags(permissionCodes),
      isLoading,
    }),
    [permissionCodes, isLoading]
  );
}
