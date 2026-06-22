import type { TeamMember } from "@/api/types";

export function isOwner(teamMember: TeamMember | null | undefined): boolean {
  return teamMember?.owner === true;
}

function getOwnerProtectionWarning(memberName: string = "This member"): string {
  return `${memberName} is the organization owner and their role cannot be changed.`;
}

export function canChangeRole(teamMember: TeamMember | null | undefined): {
  allowed: boolean;
  reason?: string;
} {
  if (!teamMember) {
    return { allowed: false, reason: "Team member not found" };
  }

  if (isOwner(teamMember)) {
    return {
      allowed: false,
      reason: getOwnerProtectionWarning(
        `${teamMember.user.first_name} ${teamMember.user.last_name}`.trim()
      ),
    };
  }

  return { allowed: true };
}

function isTeamMemberAccountActive(teamMember: TeamMember): boolean {
  return teamMember.is_active !== false;
}

export function canEditMemberProfile(
  teamMember: TeamMember | null | undefined
): {
  allowed: boolean;
  reason?: string;
} {
  if (!teamMember) {
    return { allowed: false, reason: "Team member not found" };
  }

  if (isOwner(teamMember)) {
    return {
      allowed: false,
      reason: "Cannot edit profile information for an organization owner.",
    };
  }

  if (teamMember.is_removed || teamMember.user?.id == null) {
    return {
      allowed: false,
      reason: "Cannot edit profile for a removed team member.",
    };
  }

  if (!isTeamMemberAccountActive(teamMember)) {
    return {
      allowed: false,
      reason: "Cannot edit profile for an inactive user.",
    };
  }

  return { allowed: true };
}
