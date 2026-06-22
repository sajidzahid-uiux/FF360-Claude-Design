"use client";

import { User, Users } from "lucide-react";

import type { CrewAssignment } from "@/api/types";
import { Badge } from "@/shared/ui/primitives";

import { CrewAssignmentActions } from "./CrewAssignmentActions";

interface CrewAssignmentCardProps {
  assignment: CrewAssignment;
  canManageCrew: boolean;
  disabled?: boolean;
  onDeactivate: (assignment: CrewAssignment) => void;
  onReactivate: (assignment: CrewAssignment) => void;
}

/**
 * Reusable component for rendering crew assignment cards (both groups and individuals).
 * Follows DRY principle by centralizing the assignment card rendering logic.
 */
export function CrewAssignmentCard({
  assignment,
  canManageCrew,
  disabled = false,
  onDeactivate,
  onReactivate,
}: CrewAssignmentCardProps) {
  const isGroup = assignment.assignment_type === "crew_group";
  const Icon = isGroup ? Users : User;
  const displayName = isGroup
    ? assignment.crew_group_name || "Unknown Group"
    : assignment.member_name || "Unknown Member";

  return (
    <div
      className={`hover:bg-accent/50 relative flex flex-col gap-3 rounded-lg border p-3 ${
        !assignment.is_active ? "bg-bg-surface/50 opacity-60" : ""
      }`}
    >
      <CrewAssignmentActions
        assignment={assignment}
        canManageCrew={canManageCrew}
        disabled={disabled}
        onDeactivate={onDeactivate}
        onReactivate={onReactivate}
      />

      <div className="flex min-w-0 flex-1 items-start gap-3 pr-8">
        <Icon
          className={`h-5 w-5 flex-shrink-0 ${
            assignment.is_active ? "text-text-muted" : "text-text-muted/50"
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`truncate font-medium ${
                !assignment.is_active ? "text-text-muted" : ""
              }`}
            >
              {displayName}
            </p>
            {!assignment.is_active && (
              <Badge className="flex-shrink-0 text-xs" variant="secondary">
                Inactive
              </Badge>
            )}
          </div>
          {isGroup ? (
            <p
              className={`mt-1 text-sm break-words sm:break-normal ${
                assignment.is_active ? "text-text-muted" : "text-text-muted/70"
              }`}
            >
              Assigned by {assignment.assigned_by_username} •{" "}
              {new Date(assignment.assigned_at).toLocaleDateString()}
              {assignment.deactivated_at && (
                <>
                  {" "}
                  • Deactivated{" "}
                  {new Date(assignment.deactivated_at).toLocaleDateString()}
                </>
              )}
            </p>
          ) : (
            <div
              className={`mt-1 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-2 ${
                assignment.is_active ? "text-text-muted" : "text-text-muted/70"
              }`}
            >
              <span className="truncate">{assignment.member_email}</span>
              {assignment.member_role_display && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <Badge className="w-fit text-xs" variant="secondary">
                    {assignment.member_role_display}
                  </Badge>
                </>
              )}
              <span className="hidden sm:inline">•</span>
              <span className="break-words sm:break-normal">
                Assigned by {assignment.assigned_by_username} •{" "}
                {new Date(assignment.assigned_at).toLocaleDateString()}
                {assignment.deactivated_at && (
                  <>
                    {" "}
                    • Deactivated{" "}
                    {new Date(assignment.deactivated_at).toLocaleDateString()}
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
