"use client";

import { useMemo } from "react";

import { JobType } from "@/constants";

import {
  crewManagementResourceForJobType,
  resolveCrewManagementFlags,
} from "./permissionRules";
import type { JobCrewPermissionFlags } from "./types";
import { usePermissionsFromStorage } from "./usePermissionsFromStorage";

/**
 * Hook to check crew management permissions for a specific job type.
 * Follows DRY and SRP principles by centralizing crew permission logic.
 *
 * @param jobType - The job type to check crew management permissions for
 * @returns Object with canManageCrew flag and isLoading state
 *
 * @example
 * const { canManageCrew, isLoading } = useJobCrewPermissions(JobType.REPAIR);
 * if (canManageCrew) {
 *   // Show crew assignment buttons
 * }
 */
export function useJobCrewPermissions(
  jobType: JobType
): JobCrewPermissionFlags {
  const resourceKey = useMemo(
    () => crewManagementResourceForJobType(jobType),
    [jobType]
  );

  const { permissionCodes, isLoading } = usePermissionsFromStorage(resourceKey);

  return useMemo(
    () => ({
      ...resolveCrewManagementFlags(permissionCodes),
      isLoading,
    }),
    [permissionCodes, isLoading]
  );
}
