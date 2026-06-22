"use client";

import { Avatar } from "@fieldflow360/org-ui";

import type { AssigneeInfo, Task } from "@/api/types";
import type { TeamMember } from "@/api/types/team";
import {
  formatRemovedTeamMemberLabel,
  isTeamMemberRemoved,
} from "@/utils/team/assignmentOrder";

export const DELETED_ASSIGNEE_LABEL = "Deleted User";

const EMPTY_ASSIGNEE_FIELDS = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
} as const;

/** All assignee member IDs on a task (`assignees` is canonical; merges legacy fields). */
export function getTaskAssigneeIds(task: Task): number[] {
  const ids: number[] = [];

  if (task.assignees?.length) {
    for (const id of task.assignees) {
      if (!ids.includes(id)) ids.push(id);
    }
  } else if (task.assignee != null) {
    ids.push(task.assignee);
  }

  for (const info of task.assignees_info ?? []) {
    if (!ids.includes(info.id)) ids.push(info.id);
  }

  if (ids.length === 0 && task.assignee_info) {
    ids.push(task.assignee_info.id);
  }

  return ids;
}

export function buildTeamMemberIdSet(teamMembers?: TeamMember[]): Set<number> {
  return new Set(
    (teamMembers ?? []).filter((m) => !isTeamMemberRemoved(m)).map((m) => m.id)
  );
}

/** Assignee is on the task but no longer on the org team roster. */
export function isAssigneeDeleted(
  assigneeId: number,
  teamMemberIds: Set<number>
): boolean {
  if (teamMemberIds.size === 0) return false;
  return !teamMemberIds.has(assigneeId);
}

function displayNameFromInfo(info: AssigneeInfo): string {
  const first = info.first_name?.trim() || "";
  const last = info.last_name?.trim() || "";
  if (first || last) return `${first} ${last}`.trim();
  return info.username || info.email || "Unknown";
}

function removedAssigneeLabel(
  info: AssigneeInfo,
  removedMember?: TeamMember
): string {
  if (removedMember) return formatRemovedTeamMemberLabel(removedMember);
  return (
    info.username?.trim() ||
    [info.first_name, info.last_name].filter(Boolean).join(" ") ||
    info.email ||
    `${DELETED_ASSIGNEE_LABEL} - #${info.id}`
  );
}

function displayNameForAssignee(
  info: AssigneeInfo,
  teamMemberIds?: Set<number>,
  removedMember?: TeamMember
): string {
  if (teamMemberIds && isAssigneeDeleted(info.id, teamMemberIds)) {
    return removedAssigneeLabel(info, removedMember);
  }
  return displayNameFromInfo(info);
}

function initialsForAssignee(
  info: AssigneeInfo,
  teamMemberIds?: Set<number>
): string {
  if (teamMemberIds && isAssigneeDeleted(info.id, teamMemberIds)) {
    return "DU";
  }
  const first = info.first_name?.trim() || "";
  const last = info.last_name?.trim() || "";
  if (first || last) {
    return `${first[0] || ""}${last[0] || ""}`.trim().toUpperCase();
  }
  return (info.username || info.email || "UN").slice(0, 2).toUpperCase();
}

/** Resolves assignees for UI from task IDs + `assignees_info` / legacy `assignee_info`. */
export function getTaskAssigneesForDisplay(task: Task): AssigneeInfo[] {
  const infoById = new Map<number, AssigneeInfo>();

  for (const info of task.assignees_info ?? []) {
    infoById.set(info.id, info);
  }
  if (task.assignee_info) {
    infoById.set(task.assignee_info.id, task.assignee_info);
  }

  return getTaskAssigneeIds(task).map(
    (id) =>
      infoById.get(id) ?? {
        id,
        ...EMPTY_ASSIGNEE_FIELDS,
      }
  );
}

export { displayNameForAssignee, initialsForAssignee };

export type TaskAssigneeSelectOption = {
  label: string;
  value: string;
  accessibilityLabel?: string;
};

function teamMemberSelectLabel(member: TeamMember): string {
  const first = member.user?.first_name?.trim();
  const last = member.user?.last_name?.trim();
  if (first && last) return `${first} ${last}`;
  return member.user?.username || member.user?.email || "Unknown";
}

/** Multiselect options: current team + removed assignees still on the task (edit). */
export function buildTaskAssigneeSelectOptions(
  teamMembers: TeamMember[],
  task?: Task | null
): TaskAssigneeSelectOption[] {
  const teamMemberIds = buildTeamMemberIdSet(teamMembers);
  const memberById = new Map<number, TeamMember>();
  for (const m of teamMembers) memberById.set(m.id, m);
  const teamOptions: TaskAssigneeSelectOption[] = teamMembers
    .filter((m) => !isTeamMemberRemoved(m))
    .map((member) => ({
      label: teamMemberSelectLabel(member),
      value: String(member.id),
    }));

  if (!task) return teamOptions;

  const infoById = new Map<number, AssigneeInfo>();
  for (const info of task.assignees_info ?? []) {
    infoById.set(info.id, info);
  }
  if (task.assignee_info) {
    infoById.set(task.assignee_info.id, task.assignee_info);
  }

  const deletedOptions: TaskAssigneeSelectOption[] = getTaskAssigneeIds(task)
    .filter((id) => isAssigneeDeleted(id, teamMemberIds))
    .map((id) => {
      const info = infoById.get(id);
      const removedMember = memberById.get(id);
      const label = info
        ? removedAssigneeLabel(info, removedMember)
        : removedMember
          ? formatRemovedTeamMemberLabel(removedMember)
          : `${DELETED_ASSIGNEE_LABEL} - #${id}`;
      return {
        label,
        value: String(id),
        accessibilityLabel: "No longer on team",
      };
    });

  return [...deletedOptions, ...teamOptions];
}

/** “Assigned to” chip row for task name / detail cells (table row click propagation stopped). */
export function TaskAssigneesInline({
  task,
  teamMembers,
}: {
  task: Task;
  teamMembers?: TeamMember[];
}) {
  const teamMemberIds = buildTeamMemberIdSet(teamMembers);
  const memberById = new Map<number, TeamMember>();
  for (const m of teamMembers ?? []) memberById.set(m.id, m);
  const assignees = getTaskAssigneesForDisplay(task);
  if (assignees.length === 0) return null;

  return (
    <div
      className="text-text-muted flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="font-medium">Assigned to</span>
      {assignees.map((info) => (
        <span
          key={info.id}
          className="bg-bg-surface/60 inline-flex items-center gap-1 rounded-full py-0.5 pr-2 pl-1"
        >
          <Avatar
            alt={displayNameForAssignee(
              info,
              teamMemberIds,
              memberById.get(info.id)
            )}
            fallback={initialsForAssignee(info, teamMemberIds)}
            size={20}
          />
          <span>
            {displayNameForAssignee(
              info,
              teamMemberIds,
              memberById.get(info.id)
            )}
          </span>
        </span>
      ))}
    </div>
  );
}
