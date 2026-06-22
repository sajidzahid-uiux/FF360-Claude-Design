"use client";

import { useMemo } from "react";

import { USER_ROLE_NAME_MAP, UserRole } from "@/constants/enums";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUserPermissions } from "@/hooks/queries";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { isMajorRoleName } from "@/shared/lib";

function resolveAuthUserRoleName(
  role: UserRole | { name?: string } | undefined
): string | null {
  if (role == null) return null;
  if (typeof role === "object") {
    return role.name ?? null;
  }
  return USER_ROLE_NAME_MAP[role] ?? role;
}

/** v1 Sidebar `allowedRoles: MAJOR_ROLES` for Up Keep / Industry Specialists. */
export function useMajorRoleAccess(): boolean {
  const permissionsQuery = useUserPermissions();
  const cachedRole = useDataFromStorageByKey(StorageKey.USER_ROLE) as {
    name?: string | null;
  } | null;
  const { currentUser } = useAuth();

  return useMemo(() => {
    const roleName =
      permissionsQuery.data?.role?.name ??
      cachedRole?.name ??
      currentUser?.roleDetails?.name ??
      resolveAuthUserRoleName(currentUser?.role) ??
      null;

    return isMajorRoleName(roleName);
  }, [
    permissionsQuery.data?.role?.name,
    cachedRole?.name,
    currentUser?.roleDetails?.name,
    currentUser?.role,
  ]);
}
