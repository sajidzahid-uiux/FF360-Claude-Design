import { JobType, PermissionCode } from "@/constants";

export interface JobEquipmentPermissionCodes {
  read: PermissionCode;
  write: PermissionCode;
  delete: PermissionCode;
}

export function getJobEquipmentPermissionCodes(
  jobType: JobType
): JobEquipmentPermissionCodes {
  switch (jobType) {
    case JobType.REPAIR:
      return {
        read: PermissionCode.JOBS_REPAIR_PAGE_READ,
        write: PermissionCode.JOBS_REPAIR_EQUIPMENT_MANAGEMENT_WRITE,
        delete: PermissionCode.JOBS_REPAIR_EQUIPMENT_MANAGEMENT_DELETE,
      };
    case JobType.EXCAVATION:
      return {
        read: PermissionCode.JOBS_EXCAVATION_PAGE_READ,
        write: PermissionCode.JOBS_EXCAVATION_EQUIPMENT_MANAGEMENT_WRITE,
        delete: PermissionCode.JOBS_EXCAVATION_EQUIPMENT_MANAGEMENT_DELETE,
      };
    case JobType.TILING:
      return {
        read: PermissionCode.JOBS_TILING_PAGE_READ,
        write: PermissionCode.JOBS_TILING_EQUIPMENT_MANAGEMENT_WRITE,
        delete: PermissionCode.JOBS_TILING_EQUIPMENT_MANAGEMENT_DELETE,
      };
    default:
      return {
        read: PermissionCode.JOBS_TILING_PAGE_READ,
        write: PermissionCode.JOBS_TILING_EQUIPMENT_MANAGEMENT_WRITE,
        delete: PermissionCode.JOBS_TILING_EQUIPMENT_MANAGEMENT_DELETE,
      };
  }
}
