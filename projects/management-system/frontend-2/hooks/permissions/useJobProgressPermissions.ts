"use client";

import { useMemo } from "react";

import { JobType } from "@/constants";
import { useJobById } from "@/hooks/queries";

import { StorageKey, useDataFromStorageByKey } from "../storage-data";
import { resolveJobProgressPermissionFlags } from "./permissionRules";
import type { JobProgressPermissionFlags } from "./types";
import { useJobPermissions } from "./useJobPermissions";

/**
 * Hook to check job progress field permissions based on job's canAccessOnSiteTracking field, admin status, and read/write permissions.
 * Follows DRY and SRP principles by centralizing progress permission logic.
 *
 * Rules:
 * - Admin always has full access to all fields
 * - If job's canAccessOnSiteTracking is true: all users can update all fields
 * - For Tiling jobs (job_footage and raisers_installed):
 *   - Users with READ permission can VIEW these fields (read-only)
 *   - Users with WRITE permission can UPDATE these fields
 *   - Users without READ permission cannot see these fields at all
 *
 * @param jobId - The job ID to check permissions for
 * @param jobType - The job type (repair, excavation, or tiling)
 * @returns Object with permission flags for each progress field and isLoading state
 *
 * @example
 * const { canUpdateInstalledFootage, canViewInstalledFootage } = useJobProgressPermissions(jobId, JobType.TILING);
 * if (canViewInstalledFootage) {
 *   // Show field (read-only if !canUpdateInstalledFootage)
 * }
 */
export function useJobProgressPermissions(
  jobId: string | number | undefined,

  jobType: JobType
): JobProgressPermissionFlags {
  const userRole = useDataFromStorageByKey(StorageKey.USER_ROLE);

  const isAdmin = useMemo(() => {
    if (!userRole) return false;
    return userRole.name === "Admin";
  }, [userRole]);

  const { data: jobData, isLoading: isLoadingJob } = useJobById(
    jobId || "",
    jobType
  );

  const {
    canRead,
    canEdit,
    isLoading: isLoadingPermissions,
  } = useJobPermissions(jobType);

  const canAccessOnSiteTracking = jobData?.canAccessOnSiteTracking || false;

  return useMemo(() => {
    return {
      ...resolveJobProgressPermissionFlags({
        isAdmin,
        canAccessOnSiteTracking,
        jobType,
        canRead,
        canEdit,
      }),
      isLoading: isLoadingJob || isLoadingPermissions,
    };
  }, [
    isAdmin,
    canAccessOnSiteTracking,
    jobType,
    isLoadingJob,
    canRead,
    canEdit,
    isLoadingPermissions,
  ]);
}
