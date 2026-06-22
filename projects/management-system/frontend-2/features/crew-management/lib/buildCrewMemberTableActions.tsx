import type { TableAction } from "@fieldflow360/org-ui";
import { UserPlus } from "lucide-react";

import type { CrewDirectoryMember, CrewGroupListItem } from "@/api/types";

export interface CrewMemberActionHandlers {
  canEdit: boolean;
  availableGroups: CrewGroupListItem[];
  isAdding: boolean;
  onAddToGroup: (member: CrewDirectoryMember, groupId: number) => void;
}

export function buildCrewMemberTableActions(
  member: CrewDirectoryMember,
  handlers: CrewMemberActionHandlers
): TableAction<CrewDirectoryMember>[] {
  const { canEdit, availableGroups, isAdding, onAddToGroup } = handlers;

  const eligibleGroups = availableGroups.filter(
    (group) => !member.groups.some((memberGroup) => memberGroup.id === group.id)
  );

  if (!canEdit || eligibleGroups.length === 0) {
    return [];
  }

  return eligibleGroups.map((group) => ({
    label: `Add to ${group.name}`,
    icon: <UserPlus aria-hidden className="h-4 w-4" strokeWidth={2} />,
    disabled: isAdding,
    onClick: () => onAddToGroup(member, group.id),
  }));
}
