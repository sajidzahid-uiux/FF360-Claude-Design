"use client";

import { useCallback, useMemo } from "react";

import {
  Avatar,
  SearchableDropdown,
  type SearchableDropdownOption,
  cn,
} from "@fieldflow360/org-ui";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import type { AssigneeInfo, Task } from "@/api/types";
import type { TeamMember } from "@/api/types/team";
import {
  buildTeamMemberIdSet,
  displayNameForAssignee,
  getTaskAssigneeIds,
  getTaskAssigneesForDisplay,
  initialsForAssignee,
  isAssigneeDeleted,
} from "@/features/task-management/model";
import { resolveAvatarUrl } from "@/shared/lib";
import { isTeamMemberRemoved } from "@/utils/team/assignmentOrder";

function memberDisplayName(member: TeamMember): string {
  const first = member.user?.first_name?.trim();
  const last = member.user?.last_name?.trim();
  if (first && last) return `${first} ${last}`;
  return member.user?.username || member.user?.email || "Unknown";
}

function AssigneeRow({
  info,
  member,
  teamMemberIds,
}: {
  info: AssigneeInfo;
  member?: TeamMember;
  teamMemberIds: Set<number>;
}) {
  const deleted = isAssigneeDeleted(info.id, teamMemberIds);
  const name = displayNameForAssignee(
    info,
    teamMemberIds,
    deleted ? member : undefined
  );
  const avatarSrc = member && !deleted ? resolveAvatarUrl(member) : undefined;

  return (
    <div className="flex items-center gap-2">
      <Avatar
        alt={name}
        fallback={initialsForAssignee(info, teamMemberIds)}
        size="sm"
        src={avatarSrc}
      />
      <span className={cn("text-sm", deleted && "text-text-muted italic")}>
        {name}
      </span>
    </div>
  );
}

interface TaskAssigneesCellProps {
  task: Task;
  canEdit: boolean;
  teamMembers?: TeamMember[];
  onAssigneesChange?: (task: Task, assigneeIds: number[]) => void;
}

export function TaskAssigneesCell({
  task,
  canEdit,
  teamMembers = [],
  onAssigneesChange,
}: TaskAssigneesCellProps) {
  const teamMemberIds = useMemo(
    () => buildTeamMemberIdSet(teamMembers),
    [teamMembers]
  );
  const assigneesForDisplay = useMemo(
    () => getTaskAssigneesForDisplay(task),
    [task]
  );
  const deletedAssignees = useMemo(
    () =>
      assigneesForDisplay.filter((info) =>
        isAssigneeDeleted(info.id, teamMemberIds)
      ),
    [assigneesForDisplay, teamMemberIds]
  );

  const memberById = useMemo(() => {
    const map = new Map<number, TeamMember>();
    for (const member of teamMembers) {
      map.set(member.id, member);
    }
    return map;
  }, [teamMembers]);

  const dropdownOptions = useMemo((): SearchableDropdownOption<string>[] => {
    const options: SearchableDropdownOption<string>[] = [];

    for (const info of deletedAssignees) {
      options.push({
        value: String(info.id),
        label: displayNameForAssignee(
          info,
          teamMemberIds,
          memberById.get(info.id)
        ),
        description: "No longer on team",
        group: "Removed from team",
      });
    }

    for (const member of teamMembers) {
      if (isTeamMemberRemoved(member)) continue;
      options.push({
        value: String(member.id),
        label: memberDisplayName(member),
        description: member.role_fk?.name,
        group: "Team members",
      });
    }

    return options;
  }, [deletedAssignees, memberById, teamMemberIds, teamMembers]);

  const selectedValues = useMemo(
    () => getTaskAssigneeIds(task).map(String),
    [task]
  );

  const handleValuesChange = useCallback(
    (nextValues: string[]) => {
      const nextIds = nextValues.map((value) => Number(value));
      if (nextIds.length === 0) {
        toast.error("At least one assignee is required.");
        return;
      }
      onAssigneesChange?.(task, nextIds);
    },
    [onAssigneesChange, task]
  );

  if (!canEdit || teamMembers.length === 0) {
    return (
      <div
        className="flex max-w-[220px] flex-col gap-1.5"
        onClick={(event) => event.stopPropagation()}
      >
        {assigneesForDisplay.length === 0 ? (
          <span className="text-text-muted text-sm">Unassigned</span>
        ) : (
          assigneesForDisplay.map((info) => (
            <AssigneeRow
              key={info.id}
              info={info}
              member={memberById.get(info.id)}
              teamMemberIds={teamMemberIds}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div
      className="max-w-[220px] min-w-0"
      onClick={(event) => event.stopPropagation()}
    >
      <SearchableDropdown
        multiple
        className="min-w-0"
        emptyStateText="No members found."
        fullWidth={false}
        menuMinWidth={300}
        options={dropdownOptions}
        searchPlaceholder="Search members..."
        trigger={
          <div className="hover:bg-bg-surface/50 flex w-full min-w-0 items-center justify-between gap-2 rounded-md px-1 py-1 text-left transition-colors">
            {assigneesForDisplay.length === 0 ? (
              <span className="text-text-muted text-sm">Unassigned</span>
            ) : (
              <div className="flex max-w-[200px] flex-wrap items-center gap-1">
                {assigneesForDisplay.slice(0, 3).map((info) => {
                  const member = memberById.get(info.id);
                  const deleted = isAssigneeDeleted(info.id, teamMemberIds);
                  const name = displayNameForAssignee(
                    info,
                    teamMemberIds,
                    deleted ? member : undefined
                  );
                  const avatarSrc =
                    member && !deleted ? resolveAvatarUrl(member) : undefined;
                  return (
                    <Avatar
                      key={info.id}
                      alt={name}
                      className="border-background border-2"
                      fallback={initialsForAssignee(info, teamMemberIds)}
                      size={28}
                      src={avatarSrc}
                      title={name}
                    />
                  );
                })}
                {assigneesForDisplay.length > 3 ? (
                  <span className="text-text-muted text-xs">
                    +{assigneesForDisplay.length - 3}
                  </span>
                ) : null}
              </div>
            )}
            <ChevronDown className="text-text-muted h-4 w-4 shrink-0" />
          </div>
        }
        triggerClassName="w-full min-w-0 p-0"
        values={selectedValues}
        onValuesChange={handleValuesChange}
      />
    </div>
  );
}
