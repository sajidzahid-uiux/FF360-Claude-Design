import { JobOrLeadType } from "@/constants";
import { JobType } from "@/constants/enums";

export type ProjectTypeCategory = JobOrLeadType;

/**
 * Map JobType (UI / enum) to the one-letter project type category used by APIs
 * (project types dropdown, organization job status configuration, job list filters, etc.)
 */
export function jobTypeToProjectTypeCategory(
  jobType: string
): ProjectTypeCategory | null {
  if (jobType === JobType.TILING) return JobOrLeadType.TILING;
  if (jobType === JobType.EXCAVATION) return JobOrLeadType.EXCAVATION;
  if (jobType === JobType.REPAIR) return JobOrLeadType.REPAIR;
  return null;
}

export const PROJECT_TYPE_CATEGORY_LABELS: Record<ProjectTypeCategory, string> =
  {
    [JobOrLeadType.REPAIR]: "Repair",
    [JobOrLeadType.EXCAVATION]: "Excavation",
    [JobOrLeadType.TILING]: "Tile",
  };

export interface ProjectType {
  id: number;
  name: string;
  color: string;
  category: ProjectTypeCategory;
  category_display: string;
  is_default: boolean;
  organization: number;
  created_at?: string;
}

export interface PaginatedProjectTypesResponse {
  results: ProjectType[];
  total_count?: number;
  next?: string | null;
  previous?: string | null;
  page_size?: number;
  current_page?: number;
  total_pages?: number;
}

export interface ProjectTypeCreatePayload {
  name: string;
  color: string;
  category: ProjectTypeCategory;
}

export interface ProjectTypeUpdatePayload {
  name?: string;
  color?: string;
  category?: ProjectTypeCategory;
}
