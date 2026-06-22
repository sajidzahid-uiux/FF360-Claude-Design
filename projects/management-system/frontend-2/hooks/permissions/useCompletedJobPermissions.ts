import { JobType } from "@/constants";

import {
  combineCompletedJobPermissionFlags,
  resolveCompletedJobPageAccess,
} from "./permissionRules";
import type { CompletedJobPermissionFlags, JobPermissionFlags } from "./types";
import { useJobPermissions } from "./useJobPermissions";
import { useRoutePermissions } from "./useRoutePermissions";

/**
 * Hook to get combined permissions for completed/cancelled jobs page
 * Combines page-level permissions with job-type-specific permissions
 */
export const useCompletedJobPermissions = () => {
  // Page-level permissions
  const pagePermissions = useRoutePermissions();

  // Job-type-specific permissions
  const repairPermissions = useJobPermissions(JobType.REPAIR);
  const excavationPermissions = useJobPermissions(JobType.EXCAVATION);
  const tilingPermissions = useJobPermissions(JobType.TILING);

  /**
   * Get combined permissions for a specific job based on its type
   * @param jobObjectSubclass - The job's object subclass (ExcavationJob, RepairJob, Drainage_TilingJob)
   * @returns Combined permissions object with canRead, canEdit, canDelete, canEditStatus
   */
  const getJobPermissions = (
    jobObjectSubclass: string
  ): CompletedJobPermissionFlags => {
    let jobTypePermissions: Partial<JobPermissionFlags> = {};

    switch (jobObjectSubclass) {
      case "ExcavationJob":
        jobTypePermissions = excavationPermissions;
        break;
      case "RepairJob":
        jobTypePermissions = repairPermissions;
        break;
      case "Drainage_TilingJob":
        jobTypePermissions = tilingPermissions;
        break;
      default:
        jobTypePermissions = {};
    }

    // Combine page-level and job-type permissions (both must be true)
    return combineCompletedJobPermissionFlags(
      pagePermissions,
      jobTypePermissions
    );
  };

  return {
    pagePermissions,
    repairPermissions,
    excavationPermissions,
    tilingPermissions,
    getJobPermissions,
    ...resolveCompletedJobPageAccess(pagePermissions, [
      repairPermissions,
      excavationPermissions,
      tilingPermissions,
    ]),
  };
};
