import type {
  Task,
  TaskCreatePayload,
  TaskStatus,
  TaskType,
} from "@/api/types";
import { TaskPriority } from "@/constants/enums";

import { getTaskAssigneeIds } from "./assigneesDisplay";

export const TASK_FIELD_LIMITS = {
  task_name: 200,
  description: 500,
} as const;

export interface TaskFormValues {
  task_name: string;
  deadline: string;
  task_type: string;
  task_status: string;
  assignees: string[];
  task_priority: TaskPriority;
  description: string;
}

export const DEFAULT_TASK_FORM_VALUES: TaskFormValues = {
  task_name: "",
  deadline: "",
  task_type: "",
  task_status: "",
  assignees: [],
  task_priority: TaskPriority.HIGH,
  description: "",
};

function formatDeadlineForInput(deadline: string | null | undefined): string {
  if (!deadline) return "";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

function resolveDefaultTaskTypeId(
  taskTypes: TaskType[],
  task?: Task | null
): string {
  if (task?.task_type) return String(task.task_type);
  if (taskTypes.length === 0) return "";
  const personalType = taskTypes.find(
    (type) => type.type_name.toLowerCase() === "personal"
  );
  return String((personalType ?? taskTypes[0]).id);
}

function resolveDefaultTaskStatusId(
  taskStatuses: TaskStatus[],
  task?: Task | null
): string {
  if (task?.task_status) return String(task.task_status);
  if (taskStatuses.length === 0) return "";
  const initialStatus =
    taskStatuses.find((status) => status.is_default) ?? taskStatuses[0];
  return String(initialStatus.id);
}

export function buildTaskFormValues({
  taskTypes,
  taskStatuses,
  task = null,
}: {
  taskTypes: TaskType[];
  taskStatuses: TaskStatus[];
  task?: Task | null;
}): TaskFormValues {
  if (!task) {
    return {
      ...DEFAULT_TASK_FORM_VALUES,
      task_type: resolveDefaultTaskTypeId(taskTypes),
      task_status: resolveDefaultTaskStatusId(taskStatuses),
    };
  }

  return {
    task_name: task.task_name ?? "",
    deadline: formatDeadlineForInput(task.deadline),
    task_type: resolveDefaultTaskTypeId(taskTypes, task),
    task_status: resolveDefaultTaskStatusId(taskStatuses, task),
    assignees: getTaskAssigneeIds(task).map(String),
    task_priority: (task.task_priority as TaskPriority) ?? TaskPriority.HIGH,
    description: task.description ?? "",
  };
}

export function taskFormValuesToCreatePayload(
  values: TaskFormValues
): TaskCreatePayload {
  const assigneeIds = values.assignees
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => !Number.isNaN(id) && id > 0);

  return {
    task_name: values.task_name.trim(),
    deadline: values.deadline || null,
    task_type: Number.parseInt(values.task_type, 10),
    task_status: values.task_status
      ? Number.parseInt(values.task_status, 10)
      : undefined,
    assignees: assigneeIds,
    task_priority: values.task_priority,
    description: values.description.trim() || undefined,
  };
}

export function taskFormValuesToUpdatePayload(
  values: TaskFormValues
): TaskCreatePayload {
  return taskFormValuesToCreatePayload(values);
}
