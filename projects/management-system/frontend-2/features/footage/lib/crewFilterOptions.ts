import { useRef } from "react";

import type { CrewGroupListItem, TeamMember } from "@/api/types";
import {
  FOOTAGE_CREW_FILTER_GROUP_PREFIX,
  FOOTAGE_CREW_FILTER_MEMBER_PREFIX,
} from "@/api/types/footage";
import { filterActiveTeamMembers } from "@/utils/team/assignmentOrder";

export type CrewFilterOption = { id: string; label: string };

const labelCollator = new Intl.Collator(undefined, { sensitivity: "base" });

export const buildCrewFilterOptions = (
  crewGroups: CrewGroupListItem[],
  teamMembers: TeamMember[]
): CrewFilterOption[] => {
  const result: CrewFilterOption[] = [];

  for (const g of crewGroups) {
    result.push({
      id: `${FOOTAGE_CREW_FILTER_GROUP_PREFIX}${g.id}`,
      label: `Crew: ${g.name}`,
    });
  }

  for (const m of filterActiveTeamMembers(teamMembers)) {
    const name = m.user?.username?.trim() || String(m.id);
    result.push({
      id: `${FOOTAGE_CREW_FILTER_MEMBER_PREFIX}${m.id}`,
      label: `Member: ${name}`,
    });
  }

  return result;
};

export const createCrewOptionsSelector = () => {
  let prevGroups: CrewGroupListItem[] | null = null;
  let prevMembers: TeamMember[] | null = null;
  let prevResult: CrewFilterOption[] = [];

  return (groups: CrewGroupListItem[], members: TeamMember[]) => {
    if (groups === prevGroups && members === prevMembers) {
      return prevResult;
    }

    const result = buildCrewFilterOptions(groups, members);
    result.sort((a, b) => labelCollator.compare(a.label, b.label));

    prevGroups = groups;
    prevMembers = members;
    prevResult = result;

    return result;
  };
};

export function useCrewFilterOptions(
  crewGroups: CrewGroupListItem[],
  teamMembers: TeamMember[]
) {
  const selectorRef = useRef(createCrewOptionsSelector());
  return selectorRef.current(crewGroups, teamMembers);
}
