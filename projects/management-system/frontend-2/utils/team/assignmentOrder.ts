import type { TeamMember } from "@/api/types/team";

export type TeamAssignmentOrder = "designer" | "operator";

const flagKey: Record<TeamAssignmentOrder, keyof TeamMember> = {
  designer: "is_designer",
  operator: "is_operator",
};

export const isTeamMemberRemoved = (member: TeamMember): boolean =>
  Boolean(member.is_removed);

export const filterActiveTeamMembers = <T extends TeamMember>(
  team: T[] | null | undefined
): T[] => (team ?? []).filter((m) => !isTeamMemberRemoved(m));

/** Label for an assigned/linked member who is no longer on the team. */
export const formatRemovedTeamMemberLabel = (member: TeamMember): string =>
  member.user?.username?.trim() ||
  [member.user?.first_name, member.user?.last_name].filter(Boolean).join(" ") ||
  member.user?.email ||
  `Deleted User - #${member.id}`;

/** Members with the flag set first; rest keep stable relative order. */
export const sortTeamByAssignmentFlag = (
  team: TeamMember[] = [],
  order: TeamAssignmentOrder
): TeamMember[] => {
  const key = flagKey[order];
  return [...team].sort(
    (a, b) => Number(Boolean(b[key])) - Number(Boolean(a[key]))
  );
};

/** Display name only (no role suffix). Use in badges UI and plain-text fields. */
export const formatTeamMemberName = ({ user }: TeamMember): string =>
  [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
  user?.username ||
  "";

/**
 * Shown in dropdowns: name plus optional Designer/Operator tags for quick scanning.
 */
export const buildTeamMemberLabel = (
  m: TeamMember,
  showDesignerTag: boolean,
  showOperatorTag: boolean
): string => {
  const tags = [
    showDesignerTag && m.is_designer && "Designer",
    showOperatorTag && m.is_operator && "Operator",
  ].filter(Boolean);

  const name = formatTeamMemberName(m);

  return tags.length ? `${name} (${tags.join(", ")})` : name;
};
