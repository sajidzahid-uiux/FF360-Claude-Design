"use client";

import { useEffect, useMemo, useState } from "react";

import {
  PERMISSION_RESOURCES,
  parsePermissionCodes,
} from "@/hooks/permissions";
import { resolveOrganizationSettingsFlags } from "@/hooks/permissions/permissionRules";
import { StorageKey } from "@/hooks/storage-data";
import { usePersistentStorage } from "@/hooks/usePersistentStorage";
import { isValidPermissionCode } from "@/utils/validation";

export interface OrganizationSettingsPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
}

/**
 * Team & Organization Info permissions for the org settings tab.
 * Uses the same resource as the role permissions editor (`team_organization_info`).
 */
export function useOrganizationSettingsPermissions(): OrganizationSettingsPermissions {
  const storage = usePersistentStorage();
  const [storageTick, setStorageTick] = useState(0);

  useEffect(() => {
    const onStorage = () => setStorageTick((value) => value + 1);
    window.addEventListener("app-storage", onStorage);
    return () => window.removeEventListener("app-storage", onStorage);
  }, []);

  return useMemo(() => {
    void storageTick;

    const stored = storage.getItem(StorageKey.PERM_CODES);
    if (!stored) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        isLoading: true,
      };
    }

    try {
      const parsed = JSON.parse(stored) as unknown;
      if (!Array.isArray(parsed)) {
        return {
          canView: false,
          canEdit: false,
          canDelete: false,
          isLoading: false,
        };
      }

      const codes = parsed.filter(
        (code): code is string =>
          typeof code === "string" && isValidPermissionCode(code)
      );
      const permissionMap = parsePermissionCodes(codes);
      const teamOrg = permissionMap[
        PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO
      ] ?? {
        read: false,
        write: false,
        delete: false,
      };

      return {
        ...resolveOrganizationSettingsFlags(teamOrg),
        isLoading: false,
      };
    } catch {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        isLoading: false,
      };
    }
  }, [storage, storageTick]);
}
