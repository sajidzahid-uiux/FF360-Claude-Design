"use client";

import { useMemo } from "react";

import type { CrewAssignment } from "@/api/types";
import { Dropdown } from "@/shared/ui/common";
import { buildRowActions } from "@/utils/actions";

interface CrewAssignmentActionsProps {
  assignment: CrewAssignment;
  canManageCrew: boolean;
  disabled?: boolean;
  onDeactivate: (assignment: CrewAssignment) => void;
  onReactivate: (assignment: CrewAssignment) => void;
}

/**
 * Reusable component for crew assignment actions dropdown menu.
 * Follows DRY principle by centralizing the deactivate/reactivate UI logic.
 */
export function CrewAssignmentActions({
  assignment,
  canManageCrew,
  disabled = false,
  onDeactivate,
  onReactivate,
}: CrewAssignmentActionsProps) {
  const items = useMemo(
    () =>
      buildRowActions({
        canView: false,
        canEdit: false,
        canDelete: false,
        canArchive: false,
        canTrack: false,
        isArchived: false,
        canActivate: true,
        isActive: assignment.is_active,
        onView: () => {},
        onActivate: () => onReactivate(assignment),
        onDeactivate: () => onDeactivate(assignment),
      }),
    [assignment, onReactivate, onDeactivate]
  );

  if (!canManageCrew || disabled) {
    return null;
  }

  return (
    <div className="absolute top-2 right-2">
      <Dropdown items={items} />
    </div>
  );
}
