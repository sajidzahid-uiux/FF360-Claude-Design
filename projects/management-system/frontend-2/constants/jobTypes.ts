import { JobType, PermissionCode } from "./enums";
import {
  JobLeadTypeRouteSegment,
  jobTypeToRouteSegment,
} from "./jobLeadTypeSegments";

/**
 * Job type configuration for consistent usage across the application.
 * Follows FDS (Functional Design System) principles by centralizing job type definitions.
 */
export const JOB_TYPES = {
  [JobType.REPAIR]: {
    label: "Repair",
    path: "/jobs/repair",
    permissionCode: PermissionCode.JOBS_REPAIR_PAGE_READ,
    jobType: JobType.REPAIR as const,
    apiJobType: JobType.REPAIR as const,
  },
  [JobType.EXCAVATION]: {
    label: "Excavation",
    path: "/jobs/excavation",
    permissionCode: PermissionCode.JOBS_EXCAVATION_PAGE_READ,
    jobType: JobType.EXCAVATION as const,
    apiJobType: JobType.EXCAVATION as const,
  },
  [JobType.TILING]: {
    label: "Tile",
    path: `/jobs/${JobLeadTypeRouteSegment.DRAINAGE_TILING}`,
    permissionCode: PermissionCode.JOBS_TILING_PAGE_READ,
    jobType: JobType.TILING as const,
    apiJobType: JobType.TILING as const,
  },
} as const;

export type JobTypeKey = keyof typeof JOB_TYPES;

/**
 * Get job type by label (for Sidebar filtering)
 */
export const getJobTypeByLabel = (
  label: string
): (typeof JOB_TYPES)[keyof typeof JOB_TYPES] | undefined => {
  return Object.values(JOB_TYPES).find((type) => type.label === label);
};

/**
 * Get all job type permission codes
 */
export const getJobTypePermissionCodes = (): PermissionCode[] => {
  return Object.values(JOB_TYPES).map((type) => type.permissionCode);
};

/**
 * Converts a JobType enum value to a URL-friendly path segment.
 * Replaces underscores with hyphens (e.g., "drainage_tiling" -> "drainage-tiling").
 *
 * @param jobType - The JobType enum value
 * @returns The URL-friendly path segment
 */
export const getJobTypePathSegment = (jobType: JobType): string => {
  return jobTypeToRouteSegment(jobType);
};
