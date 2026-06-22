import type {
  TableFilterDefinition,
  TableFilterValue,
} from "@fieldflow360/org-ui";

import type { TaskStatus, TaskType } from "@/api/types";
import type { TeamMember } from "@/api/types/team";
import { TaskPriority as TaskPriorityEnum } from "@/constants/enums";
import { FilterState, FilterType } from "@/shared/ui/common";

export const TASK_TYPES_FILTER_ID = "task_types";
export const TASK_STATUS_FILTER_ID = "task_status";
export const TASK_PRIORITIES_FILTER_ID = "priorities";
export const TASK_ASSIGNEES_FILTER_ID = "assignees";

export function buildTaskFilterDefinitions({
  taskTypes,
  statusOptions,
  teamData,
}: {
  taskTypes: TaskType[];
  statusOptions: TaskStatus[];
  teamData?: TeamMember[];
}): TableFilterDefinition[] {
  const definitions: TableFilterDefinition[] = [];

  if (taskTypes.length > 0) {
    definitions.push({
      id: TASK_TYPES_FILTER_ID,
      label: "Task types",
      multiple: true,
      options: taskTypes.map((type) => ({
        value: String(type.id),
        label: type.type_name,
      })),
    });
  }

  if (statusOptions.length > 0) {
    definitions.push({
      id: TASK_STATUS_FILTER_ID,
      label: "Status",
      multiple: false,
      options: statusOptions.map((status) => ({
        value: String(status.id),
        label: status.name,
      })),
    });
  }

  definitions.push({
    id: TASK_PRIORITIES_FILTER_ID,
    label: "Priority",
    multiple: true,
    options: [
      { value: TaskPriorityEnum.LOW, label: "Low" },
      { value: TaskPriorityEnum.MEDIUM, label: "Medium" },
      { value: TaskPriorityEnum.HIGH, label: "High" },
      { value: TaskPriorityEnum.URGENT, label: "Urgent" },
    ],
  });

  if (teamData && teamData.length > 0) {
    definitions.push({
      id: TASK_ASSIGNEES_FILTER_ID,
      label: "Assignee",
      multiple: false,
      options: teamData.map((member) => ({
        value: String(member.id),
        label:
          member.user.first_name && member.user.last_name
            ? `${member.user.first_name} ${member.user.last_name}`
            : member.user.email,
      })),
    });
  }

  return definitions;
}

export function filterStateToTableFilterValues(
  filters: FilterState
): TableFilterValue[] {
  const values: TableFilterValue[] = [];

  const taskTypes = filters[FilterType.TASK_TYPES];
  if (Array.isArray(taskTypes) && taskTypes.length > 0) {
    values.push({
      filterId: TASK_TYPES_FILTER_ID,
      values: taskTypes.map(String),
    });
  }

  const taskStatus = filters[FilterType.TASK_STATUS];
  if (Array.isArray(taskStatus) && taskStatus.length > 0) {
    values.push({
      filterId: TASK_STATUS_FILTER_ID,
      values: [String(taskStatus[0])],
    });
  }

  const priorities = filters[FilterType.PRIORITIES];
  if (Array.isArray(priorities) && priorities.length > 0) {
    values.push({
      filterId: TASK_PRIORITIES_FILTER_ID,
      values: priorities.map(String),
    });
  }

  const assignees = filters[FilterType.ASSIGNEES];
  if (Array.isArray(assignees) && assignees.length > 0) {
    values.push({
      filterId: TASK_ASSIGNEES_FILTER_ID,
      values: [String(assignees[0])],
    });
  }

  return values;
}

export function mergeTableFilterValuesIntoFilterState(
  current: FilterState,
  filterValues: TableFilterValue[]
): FilterState {
  const next: FilterState = { ...current };

  const readValues = (filterId: string): string[] =>
    filterValues.find((entry) => entry.filterId === filterId)?.values ?? [];

  const taskTypeValues = readValues(TASK_TYPES_FILTER_ID);
  if (taskTypeValues.length > 0) {
    next[FilterType.TASK_TYPES] = taskTypeValues;
  } else {
    delete next[FilterType.TASK_TYPES];
  }

  const statusValues = readValues(TASK_STATUS_FILTER_ID);
  if (statusValues.length > 0) {
    next[FilterType.TASK_STATUS] = statusValues;
  } else {
    delete next[FilterType.TASK_STATUS];
  }

  const priorityValues = readValues(TASK_PRIORITIES_FILTER_ID);
  if (priorityValues.length > 0) {
    next[FilterType.PRIORITIES] = priorityValues;
  } else {
    delete next[FilterType.PRIORITIES];
  }

  const assigneeValues = readValues(TASK_ASSIGNEES_FILTER_ID);
  if (assigneeValues.length > 0) {
    next[FilterType.ASSIGNEES] = assigneeValues;
  } else {
    delete next[FilterType.ASSIGNEES];
  }

  return next;
}
