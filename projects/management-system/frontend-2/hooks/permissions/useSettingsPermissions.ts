"use client";

import { useMemo } from "react";

import { PERMISSION_RESOURCES } from "./constants";
import { resolveSettingsPermissionFlags } from "./permissionRules";
import type { SettingsPermissionFlags } from "./types";
import { usePermissionsFromStorage } from "./usePermissionsFromStorage";

/**
 * Hook to check settings permissions (read, write, delete) for the settings page.
 * Follows DRY and SRP principles by centralizing permission logic.
 *
 * @returns Object with canRead, canWrite, canDelete flags and isLoading state
 *
 * @example
 * const { canRead, canWrite, canDelete } = useSettingsPermissions();
 * if (canRead) {
 *   // Show settings page
 * }
 * if (canWrite) {
 *   // Show edit settings button
 * }
 */
export function useSettingsPermissions(): SettingsPermissionFlags {
  const { permissionCodes, isLoading } = usePermissionsFromStorage(
    PERMISSION_RESOURCES.SETTINGS_PAGE
  );

  return useMemo(
    () => ({
      ...resolveSettingsPermissionFlags(permissionCodes),
      isLoading,
    }),
    [permissionCodes, isLoading]
  );
}
