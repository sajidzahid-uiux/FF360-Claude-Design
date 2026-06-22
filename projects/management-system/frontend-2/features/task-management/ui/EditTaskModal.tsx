"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { AppFormModal } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { Task, TaskStatus, TaskType } from "@/api/types";
import {
  isTaskFormSubmittable,
  validateTaskFormFields,
} from "@/features/task-management/lib/task-form-validation";
import {
  type TaskFormValues,
  buildTaskFormValues,
  taskFormValuesToUpdatePayload,
} from "@/features/task-management/model/taskForm";
import { TaskFormFields } from "@/features/task-management/ui/TaskFormFields";
import { useTaskMutations } from "@/hooks/mutations";

export interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  taskTypes: TaskType[];
  taskStatuses: TaskStatus[];
}

export function EditTaskModal({
  open,
  onOpenChange,
  task,
  taskTypes,
  taskStatuses,
}: EditTaskModalProps) {
  const { updateTask } = useTaskMutations();
  const [formData, setFormData] = useState<TaskFormValues>(() =>
    buildTaskFormValues({ taskTypes, taskStatuses, task })
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const loadedTaskIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setFieldErrors({});
      loadedTaskIdRef.current = null;
      return;
    }

    if (task && task.id !== loadedTaskIdRef.current) {
      setFormData(buildTaskFormValues({ taskTypes, taskStatuses, task }));
      loadedTaskIdRef.current = task.id;
    }
  }, [open, task, taskStatuses, taskTypes]);

  const handleClose = useCallback(() => {
    if (!updateTask.isPending) {
      onOpenChange(false);
    }
  }, [onOpenChange, updateTask.isPending]);

  const handleFieldChange = useCallback((field: keyof TaskFormValues) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!task) return;

    const errors = validateTaskFormFields(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        data: taskFormValuesToUpdatePayload(formData),
      });
      onOpenChange(false);
    } catch {
      // Error toast handled by mutation hook
    }
  };

  if (!open || !task) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={open}
      isSubmitting={updateTask.isPending}
      maxHeight="calc(100vh - 4rem)"
      submitDisabled={!isTaskFormSubmittable(formData)}
      submitLabel="Save Changes"
      title="Edit Task"
      width={720}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <TaskFormFields
        showStatus
        fieldErrors={fieldErrors}
        task={task}
        taskStatuses={taskStatuses}
        taskTypes={taskTypes}
        value={formData}
        onChange={setFormData}
        onFieldChange={handleFieldChange}
      />
    </AppFormModal>
  );
}
