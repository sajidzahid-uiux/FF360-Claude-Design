import type { TaskFormValues } from "@/features/task-management/model/taskForm";

export function validateTaskFormFields(
  values: TaskFormValues
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.task_name.trim()) {
    errors.task_name = "Task name is required.";
  }

  if (!values.task_type) {
    errors.task_type = "Select a task type.";
  }

  if (values.assignees.length === 0) {
    errors.assignees = "Assign at least one team member.";
  }

  return errors;
}

export function isTaskFormSubmittable(values: TaskFormValues): boolean {
  return (
    values.task_name.trim().length > 0 &&
    Boolean(values.task_type) &&
    values.assignees.length > 0
  );
}
