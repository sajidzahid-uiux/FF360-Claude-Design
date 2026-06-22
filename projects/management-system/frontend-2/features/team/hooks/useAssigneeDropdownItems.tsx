"use client";

import { useMemo } from "react";

import type { TeamMember } from "@/api/types/team";
import type { DropdownItem } from "@/shared/ui/common";
import {
  formatRemovedTeamMemberLabel,
  isTeamMemberRemoved,
} from "@/utils/team/assignmentOrder";

type AssignedId = number | string | null | undefined;

interface Options {
  /** Prepend a "None" entry to allow unassigning. Default true. */
  includeNone?: boolean;
}

/**
 * Items for a single-select "Assigned to" dropdown.
 * Hides removed members from new selection, and keeps an already-assigned
 * removed member visible as a disabled "Deleted User – username" row so the
 * assignment stays explicit.
 */
export const useAssigneeDropdownItems = (
  teamMembers: TeamMember[] | null | undefined,
  assignedId: AssignedId,
  { includeNone = true }: Options = {}
): DropdownItem[] =>
  useMemo(() => {
    const id = Number(assignedId);
    const assignedRemoved = teamMembers?.find(
      (m) => m.id === id && isTeamMemberRemoved(m)
    );

    return [
      ...(includeNone
        ? [{ id: "none", label: "None" } satisfies DropdownItem]
        : []),
      ...(assignedRemoved
        ? [
            {
              id: String(assignedRemoved.id),
              label: formatRemovedTeamMemberLabel(assignedRemoved),
              disabled: true,
            } satisfies DropdownItem,
          ]
        : []),
      ...(teamMembers ?? [])
        .filter((m) => !isTeamMemberRemoved(m))
        .map((m) => ({
          id: String(m.id),
          label: m.user.username,
        })),
    ];
  }, [teamMembers, assignedId, includeNone]);
