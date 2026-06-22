import { JobType } from "@/constants";

import { EntityType, ShowMoreCardConfig } from "../types";
import { EXCAVATION_JOB_CONFIG } from "./excavationJob";
import { EXCAVATION_LEAD_CONFIG } from "./excavationLead";
import { REPAIR_JOB_CONFIG } from "./repairJob";
import { REPAIR_LEAD_CONFIG } from "./repairLead";
import { TILING_JOB_CONFIG } from "./tilingJob";
import { TILING_LEAD_CONFIG } from "./tilingLead";

/**
 * Get configuration for a specific entity type and job type
 */
export function getConfig(
  entityType: EntityType,
  jobType: JobType
): ShowMoreCardConfig {
  const configMap: Record<string, ShowMoreCardConfig> = {
    [`job-${JobType.REPAIR}`]: REPAIR_JOB_CONFIG,
    [`job-${JobType.EXCAVATION}`]: EXCAVATION_JOB_CONFIG,
    [`job-${JobType.TILING}`]: TILING_JOB_CONFIG,
    [`lead-${JobType.REPAIR}`]: REPAIR_LEAD_CONFIG,
    [`lead-${JobType.EXCAVATION}`]: EXCAVATION_LEAD_CONFIG,
    [`lead-${JobType.TILING}`]: TILING_LEAD_CONFIG,
  };

  const key = `${entityType}-${jobType}`;
  const config = configMap[key];

  if (!config) {
    throw new Error(
      `No configuration found for entityType: ${entityType}, jobType: ${jobType}`
    );
  }

  return config;
}

/**
 * Export individual configs for direct use
 */
export {
  EXCAVATION_JOB_CONFIG,
  EXCAVATION_LEAD_CONFIG,
  REPAIR_JOB_CONFIG,
  REPAIR_LEAD_CONFIG,
  TILING_JOB_CONFIG,
  TILING_LEAD_CONFIG,
};
