"use client";

import type { ReactNode } from "react";

import type { TeamMember } from "@/api/types";
import {
  TeamMemberDropdownLabel,
  teamMemberDropdownPrimaryLine,
} from "@/features/team/ui/TeamMemberDropdownLabel";
import {
  isTeamMemberRemoved,
  sortTeamByAssignmentFlag,
} from "@/utils/team/assignmentOrder";

export type DesignerSelectOption = {
  label: ReactNode;
  value: number;
  accessibilityLabel: string;
};

/**
 * Options for designer multi-selects: excludes view-only ("R") and removed
 * members, prioritizes members flagged as designers, labels show role badges
 * like other designer dropdowns.
 */
export function mapTeamMembersToDesignerSelectOptions(
  members: TeamMember[] | undefined
): DesignerSelectOption[] {
  const filtered =
    members?.filter(
      (member) => member.role !== "R" && !isTeamMemberRemoved(member)
    ) ?? [];
  return sortTeamByAssignmentFlag(filtered, "designer").map((member) => ({
    label: <TeamMemberDropdownLabel member={member} />,
    value: member.id,
    accessibilityLabel: teamMemberDropdownPrimaryLine(member),
  }));
}
