import { ReactNode } from "react";

import { JOB_TYPES, JobTypeKey } from "@/constants/jobTypes";

import { AccessDeniedView } from "./AccessDeniedView";
import { PermissionCodeGate } from "./PermissionCodeGate";

interface JobPagePermissionGateProps {
  jobType: JobTypeKey;
  children: ReactNode;
}

/**
 * Reusable permission gate component for job pages.
 * Follows DRY principle by centralizing job page permission logic.
 * Follows FDS principles with consistent error messaging.
 *
 * @param jobType - The job type key (REPAIR, EXCAVATION, or TILING)
 * @param children - The content to render if user has permission
 */
export const JobPagePermissionGate = ({
  jobType,
  children,
}: JobPagePermissionGateProps) => {
  const { permissionCode, label } = JOB_TYPES[jobType];

  return (
    <PermissionCodeGate
      fallback={
        <AccessDeniedView
          message={`You do not have permission to view ${label} jobs.`}
        />
      }
      permissionCode={permissionCode}
    >
      {children}
    </PermissionCodeGate>
  );
};
