"use client";

import { useMemo } from "react";

import type { NotesTabAccess } from "@/api/types";
import { useIsAdmin } from "@/hooks/queries";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";

import { useRoutePermissions } from "./useRoutePermissions";

/** View equipment notes when user has any equipment page access level. */
export function hasEquipmentPageReadPermission(
  permissionCodes: string[]
): boolean {
  return (
    permissionCodes.includes("equipment_page_read") ||
    permissionCodes.includes("equipment_page_write") ||
    permissionCodes.includes("equipment_page_delete")
  );
}

export function hasEquipmentPageWritePermission(
  permissionCodes: string[]
): boolean {
  return permissionCodes.includes("equipment_page_write");
}

/** Equipment detail notes — aligned to backend `equipment_page_*` codes only. */
export function resolveEquipmentCommentPermissions(
  isAdmin: boolean,
  permissionCodes: string[]
): { canReadComments: boolean; canWriteComments: boolean } {
  return {
    canReadComments: isAdmin || hasEquipmentPageReadPermission(permissionCodes),
    canWriteComments:
      isAdmin || hasEquipmentPageWritePermission(permissionCodes),
  };
}

export function useEquipmentPermissions() {
  const isAdmin = useIsAdmin();
  const routePerms = useRoutePermissions();
  const permissionCodes = useDataFromStorageByKey(StorageKey.PERM_CODES);

  const commentPerms = useMemo(
    () => resolveEquipmentCommentPermissions(isAdmin, permissionCodes),
    [isAdmin, permissionCodes]
  );

  return useMemo(
    () => ({
      isAdmin,
      canRead: isAdmin || Boolean(routePerms?.read),
      canWrite: isAdmin || Boolean(routePerms?.write),
      canDelete: isAdmin || Boolean(routePerms?.delete),
      canReadComments: commentPerms.canReadComments,
      canWriteComments: commentPerms.canWriteComments,
    }),
    [isAdmin, routePerms, commentPerms]
  );
}

export function getEquipmentNotesTabAccess(
  canRead: boolean
): NotesTabAccess | undefined {
  if (!canRead) return undefined;
  return { general: true, office: false, onsite: false };
}
