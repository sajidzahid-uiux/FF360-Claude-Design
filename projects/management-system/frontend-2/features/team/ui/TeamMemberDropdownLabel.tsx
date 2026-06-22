"use client";

import type { ReactNode } from "react";

import type { TeamMember } from "@/api/types/team";
import { TEAM_MEMBER_TRIGGER_NAME_MAX } from "@/features/team/constants/teamMemberDropdown";
import { RoleBadge } from "@/features/team/ui/TeamMemberRoleBadges";
import type { DropdownItem } from "@/shared/ui/common";
import { formatTeamMemberName } from "@/utils/team/assignmentOrder";

/** Plain-text line for menu rows (username + email). */
export function teamMemberDropdownPrimaryLine(member: TeamMember): string {
  const u = member.user;
  const email = u.email?.trim() ?? "";
  const username = u.username?.trim() ?? "";
  const displayName = formatTeamMemberName(member);

  if (username && email) return `${username} (${email})`;
  if (displayName && email) return `${displayName} (${email})`;
  return displayName || username || email || "";
}

/** Username-only display for trigger; ellipsis when username / fallback exceeds configured max length. */
export function teamMemberTriggerUsername(member: TeamMember): string {
  const username = member.user.username?.trim() ?? "";
  if (username.length > TEAM_MEMBER_TRIGGER_NAME_MAX) {
    return `${username.slice(0, TEAM_MEMBER_TRIGGER_NAME_MAX)}…`;
  }
  if (username) return username;
  const fallback = formatTeamMemberName(member).trim();
  if (fallback.length > TEAM_MEMBER_TRIGGER_NAME_MAX) {
    return `${fallback.slice(0, TEAM_MEMBER_TRIGGER_NAME_MAX)}…`;
  }
  return fallback;
}

interface TeamMemberDropdownLabelProps {
  member: TeamMember;
  /** `menu`: full line + email; `trigger`: cropped username + badges */
  variant?: "menu" | "trigger";
  showDesignerTag?: boolean;
  showOperatorTag?: boolean;
  leading?: ReactNode;
}

export function TeamMemberDropdownLabel({
  member,
  variant = "menu",
  showDesignerTag = true,
  showOperatorTag = true,
  leading,
}: TeamMemberDropdownLabelProps) {
  const primary =
    variant === "trigger"
      ? teamMemberTriggerUsername(member)
      : teamMemberDropdownPrimaryLine(member);
  const showDesigner = Boolean(showDesignerTag && member.is_designer);
  const showOperator = Boolean(showOperatorTag && member.is_operator);

  const primaryClass =
    variant === "trigger"
      ? "text-text-primary shrink-0 font-normal whitespace-nowrap text-sm"
      : "text-text-primary min-w-0 flex-1 truncate text-sm font-normal";

  return (
    <span className="flex min-h-[1.25rem] w-full max-w-full min-w-0 flex-nowrap items-center gap-2 overflow-hidden">
      {leading !== undefined && leading !== null ? (
        <span className="text-text-muted shrink-0">{leading}</span>
      ) : null}
      <span className={primaryClass}>{primary}</span>
      {showDesigner || showOperator ? (
        <span className="ml-auto flex shrink-0 flex-nowrap items-center gap-1.5">
          {showDesigner ? <RoleBadge>Designer</RoleBadge> : null}
          {showOperator ? <RoleBadge>Operator</RoleBadge> : null}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Use as Dropdown `renderSelectedItem` so the trigger shows cropped username + badges.
 */
export function renderTeamMemberDropdownSelectedItem(
  item: DropdownItem,
  members: TeamMember[]
): ReactNode {
  if ("type" in item && item.type === "separator") return null;
  if ("type" in item && item.type === "header") return item.label;

  if (!("label" in item)) return null;

  const row = item as { id: string; label: ReactNode };
  if (row.id === "none") {
    return <span className="text-sm">None</span>;
  }
  if (row.id === "loading" || row.id === "empty") {
    return row.label;
  }

  const id = parseInt(row.id, 10);
  if (Number.isNaN(id)) return row.label;

  const member = members.find((m) => m.id === id);
  if (!member) return row.label;

  return (
    <span className="flex min-w-0 flex-1 items-center overflow-hidden">
      <TeamMemberDropdownLabel member={member} variant="trigger" />
    </span>
  );
}
