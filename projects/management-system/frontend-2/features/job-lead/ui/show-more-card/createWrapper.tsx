"use client";

/**
 * Wrapper Factory for ShowMoreCard
 *
 * This factory creates wrapper components that automatically configure
 * ShowMoreCard for specific job/lead types, eliminating ~300 LOC of
 * duplicated wrapper code.
 */
import { ComponentType } from "react";

import type { ProjectTypeCategory } from "@/api/types";
import { JobOrLeadType, JobType, ResourceType } from "@/constants";
import { useProjectTypesQuery } from "@/hooks/queries";

import { getConfig } from "./configs";
import ShowMoreCard from "./index";
import { EntityType, ShowMoreCardProps } from "./types";

/**
 * Create a typed ShowMoreCard wrapper for a specific job/lead type
 *
 * @param entityType - "job" or "lead"
 * @param jobType - The specific job type (TILING, EXCAVATION, REPAIR)
 * @returns A configured wrapper component
 *
 * @example
 * ```typescript
 * // In app/jobs/repair/[id]/ShowMoreCardWrapper.tsx
 * export default createShowMoreCardWrapper("job", JobType.REPAIR);
 * ```
 */
export function createShowMoreCardWrapper(
  entityType: EntityType,
  jobType: JobType
): ComponentType<ShowMoreCardProps> {
  const WrapperComponent = (props: ShowMoreCardProps) => {
    const config = getConfig(entityType, jobType);

    const categoryByJobType: Record<JobType, ProjectTypeCategory> = {
      [JobType.REPAIR]: JobOrLeadType.REPAIR,
      [JobType.EXCAVATION]: JobOrLeadType.EXCAVATION,
      [JobType.TILING]: JobOrLeadType.TILING,
    };

    const category = categoryByJobType[jobType];
    const { data: projectTypes } = useProjectTypesQuery({ category });

    // Handle optional parameter wrappers for onArchive/onDelete
    // Some pages pass required params, ShowMoreCard expects optional
    const onArchive = props.onArchive;
    const handleArchive: ShowMoreCardProps["onArchive"] = onArchive
      ? (params?: { model: string; id: number }) => {
          if (params) {
            onArchive(params);
          }
        }
      : undefined;

    const onDelete = props.onDelete;
    const handleDelete: ShowMoreCardProps["onDelete"] = onDelete
      ? (params?: { model: string; id: number }) => {
          if (params) {
            onDelete(params);
          }
        }
      : undefined;

    return (
      <ShowMoreCard
        {...props}
        config={config}
        projectTypes={projectTypes ?? []}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />
    );
  };

  // Set display name for debugging
  WrapperComponent.displayName = `ShowMoreCardWrapper(${entityType}-${jobType})`;

  return WrapperComponent;
}

/**
 * Pre-configured wrapper creators for common use cases
 */
export const ShowMoreCardWrappers = {
  /**
   * Job wrapper creators
   */
  Job: {
    Repair: () => createShowMoreCardWrapper(ResourceType.JOB, JobType.REPAIR),
    Excavation: () =>
      createShowMoreCardWrapper(ResourceType.JOB, JobType.EXCAVATION),
    Tiling: () => createShowMoreCardWrapper(ResourceType.JOB, JobType.TILING),
  },

  /**
   * Lead wrapper creators
   */
  Lead: {
    Repair: () => createShowMoreCardWrapper(ResourceType.LEAD, JobType.REPAIR),
    Excavation: () =>
      createShowMoreCardWrapper(ResourceType.LEAD, JobType.EXCAVATION),
    Tiling: () => createShowMoreCardWrapper(ResourceType.LEAD, JobType.TILING),
  },
};
