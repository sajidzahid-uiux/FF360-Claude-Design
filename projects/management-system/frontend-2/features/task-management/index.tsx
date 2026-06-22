// Re-export model types
export {
  DEFAULT_TASK_FORM_VALUES,
  DELETED_ASSIGNEE_LABEL,
  TASK_FIELD_LIMITS,
  TaskAssigneesInline,
  buildTaskAssigneeSelectOptions,
  buildTaskFormValues,
  buildTeamMemberIdSet,
  displayNameForAssignee,
  getTaskAssigneeIds,
  getTaskAssigneesForDisplay,
  initialsForAssignee,
  isAssigneeDeleted,
  taskFormValuesToCreatePayload,
  taskFormValuesToUpdatePayload,
} from "./model";
export type {
  TaskAssigneeSelectOption,
  TaskFilterValues,
  TaskFormValues,
} from "./model";

// Re-export UI components
export {
  AddTaskModal,
  EditTaskModal,
  TaskAssigneesCell,
  TasksTable,
  TypeManagementDialog,
} from "./ui";

export default function TaskManagementFeature() {
  return <></>;
}
