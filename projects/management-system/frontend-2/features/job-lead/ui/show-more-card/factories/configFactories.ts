/**
 * Config Factories for ShowMoreCard
 *
 * This file provides factory functions to generate ShowMoreCard configurations
 * using composition patterns, eliminating ~100 LOC of duplication
 * across config files.
 */
import { JobType, ResourceType } from "@/constants";
import { ProductionTracking } from "@/features/jobs/ui/production-tracking";

import { ShowMoreCardConfig, toShowMoreCardTabComponent } from "../types";
import { createJobHooks, createLeadHooks } from "./hookFactories";

/**
 * Deep merge utility for configuration objects
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, override: Partial<T>): T {
  const result = { ...base };

  for (const key of Object.keys(override) as Array<keyof T>) {
    const overrideValue = override[key];
    if (overrideValue === undefined) continue;

    const baseValue = result[key];
    if (isPlainObject(overrideValue) && isPlainObject(baseValue)) {
      result[key] = deepMerge(
        baseValue as T[keyof T],
        overrideValue as Partial<T[keyof T]>
      ) as T[keyof T];
    } else {
      result[key] = overrideValue as T[keyof T];
    }
  }

  return result;
}

/**
 * Get state data key for job type
 */
function getJobStateDataKey(jobType: JobType): string {
  switch (jobType) {
    case JobType.TILING:
      return "drainage_tilingjob";
    case JobType.EXCAVATION:
      return "excavationjob";
    case JobType.REPAIR:
      return "repairjob";
    default:
      return "repairjob";
  }
}

/**
 * Get state data key for lead type
 */
function getLeadStateDataKey(jobType: JobType): string {
  switch (jobType) {
    case JobType.TILING:
      return "drainage_tilinglead";
    case JobType.EXCAVATION:
      return "excavationlead";
    case JobType.REPAIR:
      return "repairlead";
    default:
      return "repairlead";
  }
}

/**
 * Create a base configuration for Job entities
 *
 * This function provides common defaults for all job configurations,
 * which can be overridden with specific settings.
 *
 * @param jobType - The type of job (TILING, EXCAVATION, REPAIR)
 * @param overrides - Partial configuration to override defaults
 * @returns Complete ShowMoreCardConfig for the job
 *
 * @example
 * ```typescript
 * const config = createJobConfig(JobType.TILING, {
 *   tabs: ["Job Details", "Production Tracking", "Files"],
 *   fileTypes: { regular: ["contractor", "one_call"] },
 * });
 * ```
 */
export function createJobConfig(
  jobType: JobType,
  overrides: Partial<ShowMoreCardConfig>
): ShowMoreCardConfig {
  // Base configuration common to all jobs
  const baseJobConfig: ShowMoreCardConfig = {
    entityType: ResourceType.JOB,
    jobType,
    tabs: ["Job Details", "Production Tracking", "Files"],
    fileTypes: {
      regular: [],
    },
    features: {
      mapPins: true,
    },
    components: {
      productionTracking: toShowMoreCardTabComponent(ProductionTracking),
    },
    hooks: createJobHooks(jobType, {
      includeEstimate: overrides.tabs?.includes("Estimate"),
    }),
    stateDataKey: getJobStateDataKey(jobType),
  };

  // Merge overrides with base config
  return deepMerge(baseJobConfig, overrides);
}

/**
 * Create a base configuration for Lead entities
 *
 * This function provides common defaults for all lead configurations,
 * which can be overridden with specific settings.
 *
 * @param jobType - The type of lead (TILING, EXCAVATION, REPAIR)
 * @param overrides - Partial configuration to override defaults
 * @returns Complete ShowMoreCardConfig for the lead
 *
 * @example
 * ```typescript
 * const config = createLeadConfig(JobType.TILING, {
 *   tabs: ["Lead Details", "Files"],
 *   fileTypes: { regular: ["contractor", "one_call"] },
 * });
 * ```
 */
export function createLeadConfig(
  jobType: JobType,
  overrides: Partial<ShowMoreCardConfig>
): ShowMoreCardConfig {
  // Base configuration common to all leads
  const baseLeadConfig: ShowMoreCardConfig = {
    entityType: ResourceType.LEAD,
    jobType,
    tabs: ["Lead Details", "Files"],
    fileTypes: {
      regular: [],
    },
    features: {
      mapPins: true,
    },
    components: {},
    hooks: createLeadHooks(jobType, {
      includeEquipment: overrides.features?.equipmentSelection === true,
    }),
    stateDataKey: getLeadStateDataKey(jobType),
  };

  // Merge overrides with base config
  return deepMerge(baseLeadConfig, overrides);
}
