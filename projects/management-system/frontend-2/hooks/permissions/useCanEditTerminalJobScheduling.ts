"use client";

import { JobType } from "@/constants";
import { useIsAdmin, useUserPermissions } from "@/hooks/queries";

import { canEditTerminalJobSchedulingFromCodes } from "./permissionRules";

/**
 * Whether the user may edit scheduling fields (dates / extra days) on a
 * completed or canceled job: org admin, or both `completed_canceled_page_write`
 * and the job-type page write permission.
 */
export function useCanEditTerminalJobScheduling(jobType: JobType): {
  canEdit: boolean;
  isLoading: boolean;
} {
  const isAdmin = useIsAdmin();
  const { data: permissionsData, isLoading } = useUserPermissions();

  const canEdit = canEditTerminalJobSchedulingFromCodes(
    isAdmin,
    permissionsData?.permission_codes,
    jobType
  );

  return { canEdit, isLoading };
}

export { terminalJobSchedulingPermissionCodes } from "./permissionRules";
