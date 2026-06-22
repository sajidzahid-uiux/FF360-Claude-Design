import type { ProjectType, ProjectTypeCategory } from "@/api/types";
import { JobOrLeadType } from "@/constants";

const EMPTY_BY_CATEGORY: Record<ProjectTypeCategory, ProjectType[]> = {
  [JobOrLeadType.REPAIR]: [],
  [JobOrLeadType.EXCAVATION]: [],
  [JobOrLeadType.TILING]: [],
};

export function groupProjectTypesByCategory(
  projectTypes: ProjectType[] | null | undefined
): Record<ProjectTypeCategory, ProjectType[]> {
  if (!projectTypes?.length) {
    return { ...EMPTY_BY_CATEGORY };
  }

  const map: Record<ProjectTypeCategory, ProjectType[]> = {
    [JobOrLeadType.REPAIR]: [],
    [JobOrLeadType.EXCAVATION]: [],
    [JobOrLeadType.TILING]: [],
  };

  for (const projectType of projectTypes) {
    const category = projectType.category as ProjectTypeCategory;
    if (
      category === JobOrLeadType.REPAIR ||
      category === JobOrLeadType.EXCAVATION ||
      category === JobOrLeadType.TILING
    ) {
      map[category].push(projectType);
    }
  }

  return map;
}
