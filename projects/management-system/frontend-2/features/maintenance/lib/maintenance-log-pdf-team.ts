import type { TeamMember } from "@/api/types";

export function buildTeamMemberUsernameMap(
  teamData: TeamMember[]
): Map<number, string> {
  const map = new Map<number, string>();

  for (const member of teamData) {
    map.set(member.id, member.user.username);
  }

  return map;
}

export function formatMaintenanceLogAssignees(
  assignedTo: number[] | null,
  teamMap: Map<number, string>
): string {
  if (!assignedTo?.length) {
    return "Unassigned";
  }

  const names = assignedTo.map((id) => teamMap.get(id) ?? `ID: ${id}`);
  return names.join(", ") || "Unassigned";
}
