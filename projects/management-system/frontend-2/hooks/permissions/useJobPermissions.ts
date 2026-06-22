"use client";

import { useMemo } from "react";

import { JobType } from "@/constants";

import { jobPageResourceForJobType } from "./jobPageResource";
import {
  editStatusResourceForJobType,
  resolveJobPermissionFlags,
} from "./permissionRules";
import type { JobPermissionFlags } from "./types";
import { usePermissionsFromStorage } from "./usePermissionsFromStorage";

/**
 * Hook to check job permissions (add, edit, delete, edit status) for a specific job type.
 * Follows DRY and SRP principles by centralizing permission logic.
 *
 * @param jobType - The job type to check permissions for
 * @returns Object with canRead, canAdd, canEdit, canEditStatus, canDelete flags and isLoading state
 *
 * @example
 * const { canRead, canAdd, canEdit, canEditStatus, canDelete } = useJobPermissions("repair");
 * if (canAdd) {
 *   // Show add job button
 * }
 * if (canEditStatus) {
 *   // Show status edit dropdown
 * }
 */
export function useJobPermissions(jobType: JobType): JobPermissionFlags {
  const resourceKey = useMemo(
    () => jobPageResourceForJobType(jobType),
    [jobType]
  );

  const editStatusResourceKey = useMemo(
    () => editStatusResourceForJobType(jobType),
    [jobType]
  );

  const { permissionCodes, isLoading } = usePermissionsFromStorage(resourceKey);
  const {
    permissionCodes: editStatusPermissionCodes,
    isLoading: editStatusLoading,
  } = usePermissionsFromStorage(editStatusResourceKey);

  return useMemo(() => {
    return {
      ...resolveJobPermissionFlags(permissionCodes, editStatusPermissionCodes),
      isLoading: isLoading || editStatusLoading,
    };
  }, [
    permissionCodes,
    editStatusPermissionCodes,
    isLoading,
    editStatusLoading,
  ]);
}
