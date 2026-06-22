import type { OrganizationJobStatus } from "@/api/types";
import { JobOrLeadType } from "@/constants";

/** Job status row grouped by job type label for settings UI. */
export type TransformedJobStatus = Pick<
  OrganizationJobStatus,
  "id" | "title" | "color" | "is_default" | "editable"
> & {
  number: string;
  type: OrganizationJobStatus["job_type"];
};

export type JobTypeLabel = "Repair" | "Excavation" | "Tile";

export type JobStatusesByType = Record<JobTypeLabel, TransformedJobStatus[]>;

type JobTypeMap = Record<JobOrLeadType, JobTypeLabel>;

/**
 * Transforms job statuses from API response to a grouped object by job type
 *
 * @param statusesData - Raw statuses data from API
 * @returns Grouped statuses by job type
 */
export const transformJobStatuses = (
  statusesData: OrganizationJobStatus[]
): JobStatusesByType => {
  // Define job type mapping
  const jobTypeMap: JobTypeMap = {
    [JobOrLeadType.TILING]: "Tile",
    [JobOrLeadType.REPAIR]: "Repair",
    [JobOrLeadType.EXCAVATION]: "Excavation",
  };

  // Initialize the result object with the same structure as jobStatusesByType
  const jobStatusesByType: JobStatusesByType = {
    Repair: [],
    Excavation: [],
    Tile: [],
  };

  // Group by job type and transform data
  statusesData.forEach((status) => {
    const jobTypeKey = jobTypeMap[status.job_type as JobOrLeadType];

    // Check if title in snake_case equals "in_progress"
    let transformedTitle = status.title;
    if (
      status.title.toLowerCase().replace(/\s+/g, "_") === "in_progress" &&
      status.is_default === true
    ) {
      transformedTitle = "In Progress - ";
    }

    if (jobTypeKey) {
      jobStatusesByType[jobTypeKey].push({
        title: transformedTitle,
        color: status.color,
        number: status.order.toString(), // Convert order to string to match original format
        id: status.id, // Adding id for reference, though it wasn't in original
        is_default: status.is_default,
        editable: status.editable,
        type: status.job_type, // Adding job type for reference
      });
    }
  });

  const jobTypeLabels: JobTypeLabel[] = ["Repair", "Excavation", "Tile"];
  for (const jobType of jobTypeLabels) {
    jobStatusesByType[jobType].sort(
      (a, b) => parseInt(a.number, 10) - parseInt(b.number, 10)
    );
  }

  return jobStatusesByType;
};
