import type { TaskPriority } from "@/constants/enums";

export type TaskStatusName = string;

export interface TaskFilterValues {
  search: string;
  task_types: number[];
  task_status: number | null;
  priorities: TaskPriority[];
  assignee: number | null;
  overdue: boolean | null;
  deadline_start: string;
  deadline_end: string;
}
