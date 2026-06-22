import type { DropdownOption } from "@fieldflow360/org-ui";

import type { TeamMember } from "@/api/types/team";
import { UserRole } from "@/constants";
import {
  teamMemberDropdownPrimaryLine,
  teamMemberTriggerUsername,
} from "@/features/team/ui/TeamMemberDropdownLabel";
import {
  filterActiveTeamMembers,
  formatRemovedTeamMemberLabel,
  isTeamMemberRemoved,
  sortTeamByAssignmentFlag,
} from "@/utils/team/assignmentOrder";

function designerOptionLabel(
  member: TeamMember,
  prefix: "check" | "remove" | "none"
): string {
  const line = teamMemberDropdownPrimaryLine(member);
  if (prefix === "check") return `✓ ${line}`;
  if (prefix === "remove") return `✗ ${line}`;
  return line;
}

export function buildDesignerMultiPickOptions(
  team: TeamMember[] | null | undefined,
  selectedIds: number[],
  removedSelected: TeamMember[] = []
): DropdownOption<string>[] {
  const removedOptions: DropdownOption<string>[] = removedSelected.map(
    (member) => ({
      value: String(member.id),
      label: `✓ ${formatRemovedTeamMemberLabel(member)}`,
    })
  );

  const members = sortTeamByAssignmentFlag(
    (team ?? []).filter(
      (m) => m.role !== UserRole.VIEWER && !isTeamMemberRemoved(m)
    ),
    "designer"
  );

  if (members.length === 0 && removedOptions.length === 0) {
    return [
      {
        value: "empty",
        label: "No team members available",
        disabled: true,
      },
    ];
  }

  return [
    ...removedOptions,
    ...members.map((member) => ({
      value: String(member.id),
      label: designerOptionLabel(
        member,
        selectedIds.includes(member.id) ? "check" : "none"
      ),
    })),
  ];
}

export function designerMultiPickPlaceholder(
  team: TeamMember[] | undefined,
  selectedIds: number[]
): string {
  if (selectedIds.length === 0) return "Select designers…";
  if (selectedIds.length === 1) {
    const member = team?.find((m) => m.id === selectedIds[0]);
    if (member && isTeamMemberRemoved(member)) {
      return formatRemovedTeamMemberLabel(member);
    }
    return member ? teamMemberTriggerUsername(member) : "1 designer selected";
  }
  return `${selectedIds.length} designers selected`;
}

export function buildJobPrimaryDesignerOptions(
  allTeam: TeamMember[] | undefined,
  designerIds: number[]
): DropdownOption<string>[] {
  const primaryId = designerIds[0];
  const assignedDesigner =
    primaryId != null
      ? (allTeam?.find((m) => m.id === primaryId) as TeamMember | undefined)
      : undefined;

  const otherAssigned = designerIds
    .filter((id) => id !== primaryId)
    .map((id) => {
      const member = allTeam?.find((m) => m.id === id) as
        | TeamMember
        | undefined;
      return member ? { id, member } : null;
    })
    .filter((d): d is { id: number; member: TeamMember } => d != null);

  const availableMembers = sortTeamByAssignmentFlag(
    (allTeam?.filter(
      (member) =>
        member.role !== UserRole.VIEWER &&
        !isTeamMemberRemoved(member) &&
        !designerIds.includes(member.id)
    ) ?? []) as TeamMember[],
    "designer"
  );

  const options: DropdownOption<string>[] = [];

  if (assignedDesigner) {
    options.push({
      value: String(assignedDesigner.id),
      label: designerOptionLabel(assignedDesigner, "check"),
    });
  }

  otherAssigned.forEach(({ id, member }) => {
    options.push({
      value: String(id),
      label: designerOptionLabel(member, "remove"),
    });
  });

  availableMembers.forEach((member) => {
    options.push({
      value: String(member.id),
      label: designerOptionLabel(member, "none"),
    });
  });

  if (options.length === 0) {
    const hasEligible =
      (allTeam?.filter(
        (member) =>
          member.role !== UserRole.VIEWER && !isTeamMemberRemoved(member)
      ).length ?? 0) > 0;
    options.push({
      value: "empty",
      label: hasEligible
        ? "No designers available"
        : "No team members available",
      disabled: true,
    });
  }

  return options;
}

export function jobPrimaryDesignerPlaceholder(
  allTeam: TeamMember[] | undefined,
  designerIds: number[]
): string {
  if (designerIds.length === 0) return "Select designer…";
  const member = allTeam?.find((m) => m.id === designerIds[0]);
  return member ? teamMemberTriggerUsername(member) : "Designer assigned";
}

export function buildOperatorDropdownOptions(
  teamMembers: TeamMember[] | null | undefined,
  selectedRemoved?: TeamMember | null
): DropdownOption<string>[] {
  const members = sortTeamByAssignmentFlag(
    filterActiveTeamMembers(teamMembers),
    "operator"
  );

  const options: DropdownOption<string>[] = [
    { value: "none", label: "None" },
    ...members.map((member) => ({
      value: String(member.id),
      label: teamMemberDropdownPrimaryLine(member),
    })),
  ];

  if (selectedRemoved) {
    options.push({
      value: String(selectedRemoved.id),
      label: formatRemovedTeamMemberLabel(selectedRemoved),
      disabled: true,
    });
  }

  return options;
}

export function resolveOperatorDropdownValue(
  operatorId: string | null | undefined
): string {
  if (!operatorId || operatorId === "none") return "none";
  return operatorId;
}

export function operatorOptionLabelForValue(
  value: string,
  teamMembers: TeamMember[] | null | undefined,
  selectedRemoved?: TeamMember | null
): string {
  if (value === "none") return "None";
  if (selectedRemoved && String(selectedRemoved.id) === value) {
    return formatRemovedTeamMemberLabel(selectedRemoved);
  }
  const member = teamMembers?.find((m) => String(m.id) === value);
  return member ? teamMemberTriggerUsername(member) : "Select operator…";
}

export function parseOperatorDropdownChange(value: string): number | null {
  if (!value || value === "none") return null;
  const id = parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}
