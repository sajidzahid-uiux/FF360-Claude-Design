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

import type { TaskStatus, TaskType } from "@/api/types";
import {
  isTaskFormSubmittable,
  validateTaskFormFields,
} from "@/features/task-management/lib/task-form-validation";
import {
  type TaskFormValues,
  buildTaskFormValues,
  taskFormValuesToCreatePayload,
} from "@/features/task-management/model/taskForm";
import { TaskFormFields } from "@/features/task-management/ui/TaskFormFields";
import { useTaskMutations } from "@/hooks/mutations";

export interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTypes: TaskType[];
  taskStatuses: TaskStatus[];
}

export function AddTaskModal({
  open,
  onOpenChange,
  taskTypes,
  taskStatuses,
}: AddTaskModalProps) {
  const { createTask } = useTaskMutations();
  const [formData, setFormData] = useState<TaskFormValues>(() =>
    buildTaskFormValues({ taskTypes, taskStatuses })
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const wasOpenRef = useRef(false);

  // Reset only when the modal opens/closes — not when taskTypes refetch (e.g. new type).
  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        setFormData(buildTaskFormValues({ taskTypes, taskStatuses }));
        setFieldErrors({});
      }
      wasOpenRef.current = false;
      return;
    }

    if (!wasOpenRef.current) {
      setFormData(buildTaskFormValues({ taskTypes, taskStatuses }));
      setFieldErrors({});
    }
    wasOpenRef.current = true;
  }, [open, taskStatuses, taskTypes]);

  const handleClose = useCallback(() => {
    if (!createTask.isPending) {
      onOpenChange(false);
    }
  }, [createTask.isPending, onOpenChange]);

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

    const errors = validateTaskFormFields(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    try {
      await createTask.mutateAsync(taskFormValuesToCreatePayload(formData));
      onOpenChange(false);
    } catch {
      // Error toast handled by mutation hook
    }
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={open}
      isSubmitting={createTask.isPending}
      maxHeight="calc(100vh - 4rem)"
      submitDisabled={!isTaskFormSubmittable(formData)}
      submitLabel="Add Task"
      title="Add New Task"
      width={720}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <TaskFormFields
        fieldErrors={fieldErrors}
        taskStatuses={taskStatuses}
        taskTypes={taskTypes}
        value={formData}
        onChange={setFormData}
        onFieldChange={handleFieldChange}
      />
    </AppFormModal>
  );
}
