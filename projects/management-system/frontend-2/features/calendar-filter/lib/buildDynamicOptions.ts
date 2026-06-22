import type {
  LeadStatus,
  LeadTypeInfo,
  OrganizationJobStatus,
  ProjectType,
} from "@/api/types";
import { PROJECT_TYPE_CATEGORY_LABELS } from "@/api/types";
import { JobOrLeadType, JobType } from "@/constants/enums";

import type { CalendarDynamicFilterOptions } from "../model/types";

interface BuildDynamicFilterOptionsArgs {
  jobStatuses: readonly OrganizationJobStatus[];
  leadStatuses: readonly LeadStatus[];
  leadSources: readonly LeadTypeInfo[];
  projectTypes: readonly ProjectType[];
}

function normalizeJobType(
  jobType: OrganizationJobStatus["job_type"]
): JobOrLeadType | null {
  if (jobType === JobOrLeadType.TILING || jobType === JobType.TILING) {
    return JobOrLeadType.TILING;
  }
  if (jobType === JobOrLeadType.EXCAVATION || jobType === JobType.EXCAVATION) {
    return JobOrLeadType.EXCAVATION;
  }
  if (jobType === JobOrLeadType.REPAIR || jobType === JobType.REPAIR) {
    return JobOrLeadType.REPAIR;
  }
  return null;
}

export function buildDynamicFilterOptions({
  jobStatuses,
  leadStatuses,
  leadSources,
  projectTypes,
}: BuildDynamicFilterOptionsArgs): CalendarDynamicFilterOptions {
  return {
    jobStatus: jobStatuses.map((s) => {
      const code = normalizeJobType(s.job_type);
      return {
        value: String(s.id),
        label: s.title,
        group: code ? PROJECT_TYPE_CATEGORY_LABELS[code] : undefined,
      };
    }),
    leadStatus: leadStatuses.map((s) => ({
      value: String(s.id),
      label: s.title,
    })),
    leadSource: leadSources.map((t) => ({
      value: String(t.id),
      label: t.title,
    })),
    projectType: projectTypes.map((p) => ({
      value: String(p.id),
      label: p.name,
      group: PROJECT_TYPE_CATEGORY_LABELS[p.category],
    })),
  };
}
