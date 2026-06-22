"use client";

import { useMemo } from "react";

import type { TeamMember } from "@/api/types/team";
import { TeamMemberDropdownLabel } from "@/features/team/ui/TeamMemberDropdownLabel";
import {
  filterActiveTeamMembers,
  sortTeamByAssignmentFlag,
} from "@/utils/team/assignmentOrder";

export const useOperatorDropDownItems = (teamMembers?: TeamMember[] | null) => {
  return useMemo(
    () =>
      sortTeamByAssignmentFlag(
        filterActiveTeamMembers(teamMembers),
        "operator"
      ).map((member) => ({
        id: String(member.id),
        label: <TeamMemberDropdownLabel member={member} />,
      })),
    [teamMembers]
  );
};
