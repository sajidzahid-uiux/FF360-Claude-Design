import { JobType } from "@/constants";

/** Backend `job_type` query param for `equipmentUntilUpdate/`. */
export function getMaintenanceJobTypeParam(
  jobType: JobType,
  farmerJob: boolean
): string {
  switch (jobType) {
    case JobType.REPAIR:
      return farmerJob ? "repair_farmer" : "repair_job";
    case JobType.EXCAVATION:
      return farmerJob ? "excavation_farmer" : "excavation_job";
    case JobType.TILING:
      return farmerJob ? "drainage_tiling_farmer" : "drainage_tiling_job";
    default:
      return farmerJob ? "drainage_tiling_farmer" : "drainage_tiling_job";
  }
}
