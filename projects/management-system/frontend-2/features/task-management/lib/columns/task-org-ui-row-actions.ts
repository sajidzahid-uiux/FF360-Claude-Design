import type { Task } from "@/api/types";

export interface TaskOrgUiColumnHandlers {
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export type TaskRowActionKey = "edit" | "delete";

export interface TaskRowActionDescriptor {
  key: TaskRowActionKey;
  label: string;
  variant?: "danger";
}

export function getTaskRowActionDescriptors(
  handlers: Pick<TaskOrgUiColumnHandlers, "canEdit" | "canDelete">
): TaskRowActionDescriptor[] {
  const actions: TaskRowActionDescriptor[] = [];

  if (handlers.canEdit) {
    actions.push({ key: "edit", label: "Edit" });
  }
  if (handlers.canDelete) {
    actions.push({ key: "delete", label: "Delete", variant: "danger" });
  }

  return actions;
}

export function buildTaskRowActions(
  task: Task,
  handlers: TaskOrgUiColumnHandlers
): Array<TaskRowActionDescriptor & { onClick: () => void }> {
  return getTaskRowActionDescriptors(handlers).map((descriptor) => {
    const onClick =
      descriptor.key === "edit"
        ? () => handlers.onEdit(task)
        : () => handlers.onDelete(task);

    return {
      ...descriptor,
      onClick,
    };
  });
}
