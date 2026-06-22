import { JobType } from "@/constants";

import { PERMISSION_RESOURCES, type PermissionResource } from "./constants";

export const JOB_TYPE_TO_PAGE_RESOURCE: Record<JobType, PermissionResource> = {
  [JobType.TILING]: PERMISSION_RESOURCES.JOBS_TILING_PAGE,
  [JobType.EXCAVATION]: PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE,
  [JobType.REPAIR]: PERMISSION_RESOURCES.JOBS_REPAIR_PAGE,
};

export function jobPageResourceForJobType(
  jobType: JobType
): PermissionResource {
  return JOB_TYPE_TO_PAGE_RESOURCE[jobType];
}
