"use client";

import { useEffect, useMemo, useState } from "react";

import { StorageKey } from "../storage-data";
import { usePersistentStorage } from "../usePersistentStorage";
import { type PermissionAction, type PermissionResource } from "./constants";

interface PermissionsFromStorageActions {
  permissionCodes: PermissionAction[];
  isLoading: boolean;
  error: Error | null;
}

interface PermissionsFromStorageResources {
  permissionCodes: string[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to retrieve user's permission codes from localStorage
 * This is useful for client-side permission checks when the auth context data isn't immediately available
 *
 * @overload
 * @param {PermissionResource} permCode - Specific permission resource to filter codes for
 * @returns {PermissionsFromStorageActions} Permission actions (read, write, delete) for the resource
 *
 * @overload
 * @param {undefined} permCode - No specific resource
 * @returns {PermissionsFromStorageResources} All permission resources
 *
 * @example
 * // Get all resources
 * const { permissionCodes } = usePermissionsFromStorage();
 * // permissionCodes = ["contact_access", "leads_page", ...]
 *
 * // Get actions for specific resource
 * const { permissionCodes } = usePermissionsFromStorage("contact_access");
 * // permissionCodes = ["read", "write"]
 */

export function usePermissionsFromStorage(
  permCode: PermissionResource
): PermissionsFromStorageActions;

export function usePermissionsFromStorage(
  permCode?: undefined
): PermissionsFromStorageResources;

export function usePermissionsFromStorage(
  permCode?: PermissionResource
): PermissionsFromStorageActions | PermissionsFromStorageResources {
  const storage = usePersistentStorage();
  const [storageTick, setStorageTick] = useState(0);

  useEffect(() => {
    const onStorage = () => setStorageTick((v) => v + 1);
    window.addEventListener("app-storage", onStorage);
    return () => window.removeEventListener("app-storage", onStorage);
  }, []);

  const { permissionCodes, isLoading, error } = useMemo(() => {
    // Ensure `storageTick` is considered part of the memo's calculation triggers
    // (used only to force recalculation when storage changes).
    void storageTick;
    try {
      const storedPermissionCodes = storage.getItem(StorageKey.PERM_CODES);

      if (!storedPermissionCodes) {
        return {
          permissionCodes: [],
          isLoading: true, // Still loading if not in storage yet
          error: null,
        };
      }

      const parsed = JSON.parse(storedPermissionCodes) as string[];

      if (permCode) {
        return {
          // find all permissions that include the permCode and return as [read, write, delete]
          permissionCodes: parsed
            .filter((code: string) => code.startsWith(permCode))
            .map((code: string) =>
              code.slice(permCode.length + 1)
            ) as PermissionAction[], // +1 to remove the underscore
          isLoading: false,
          error: null,
        };
      }

      const permissionCodes = parsed
        .map((code: string) =>
          code.endsWith("_read") ? code.slice(0, -5) : null
        )
        .filter((code: string | null) => code !== null);

      return {
        permissionCodes,
        isLoading: false,
        error: null,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      console.error("Failed to parse permissions from storage:", error);

      return {
        permissionCodes: [],
        isLoading: false,
        error,
      };
    }
  }, [storage, permCode, storageTick]);

  return {
    permissionCodes,
    isLoading,
    error,
  };
}
