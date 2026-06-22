"use client";

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Button,
  Checkbox,
  Dropdown,
  Input,
  Radio,
  Textarea,
  cn,
} from "@fieldflow360/org-ui";
import {
  AlignLeft,
  Calendar,
  Check,
  Flag,
  ListTodo,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import type { Task, TaskStatus, TaskType } from "@/api/types";
import type { TeamMember } from "@/api/types/team";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_FLAG_COLORS,
  TASK_PRIORITY_LABELS,
} from "@/constants/enums";
import {
  type TaskAssigneeSelectOption,
  buildTaskAssigneeSelectOptions,
} from "@/features/task-management/model";
import {
  DEFAULT_TASK_FORM_VALUES,
  TASK_FIELD_LIMITS,
  type TaskFormValues,
} from "@/features/task-management/model/taskForm";
import { useTeamData } from "@/hooks";
import { useTaskTypeMutations } from "@/hooks/mutations";

function CharCount({ current, max }: { current: number; max: number }) {
  return (
    <p className="text-text-muted text-xs">
      {current}/{max}
    </p>
  );
}

export interface TaskFormFieldsProps {
  value: TaskFormValues;
  onChange: Dispatch<SetStateAction<TaskFormValues>>;
  fieldErrors: Record<string, string>;
  onFieldChange?: (field: keyof TaskFormValues) => void;
  taskTypes: TaskType[];
  taskStatuses: TaskStatus[];
  showStatus?: boolean;
  task?: Task | null;
}

function mergeTaskTypesById(types: TaskType[]): TaskType[] {
  const byId = new Map<number, TaskType>();
  for (const type of types) {
    byId.set(type.id, type);
  }
  return Array.from(byId.values());
}

export function TaskFormFields({
  value,
  onChange,
  fieldErrors,
  onFieldChange,
  taskTypes,
  taskStatuses,
  showStatus = false,
  task = null,
}: TaskFormFieldsProps) {
  const { data: teamData } = useTeamData() as { data?: TeamMember[] };
  const taskTypeMutations = useTaskTypeMutations();
  const [newTaskTypeName, setNewTaskTypeName] = useState("");

  const formData = value ?? DEFAULT_TASK_FORM_VALUES;

  const allTaskTypes = useMemo(
    () => mergeTaskTypesById(taskTypes),
    [taskTypes]
  );

  const taskTypeOptions = useMemo(
    () =>
      allTaskTypes.map((type) => ({
        value: String(type.id),
        label: type.type_name,
      })),
    [allTaskTypes]
  );

  const taskStatusOptions = useMemo(
    () =>
      taskStatuses.map((status) => ({
        value: String(status.id),
        label: status.name,
      })),
    [taskStatuses]
  );

  const assigneeOptions: TaskAssigneeSelectOption[] = useMemo(
    () => buildTaskAssigneeSelectOptions(teamData ?? [], task),
    [teamData, task]
  );

  const updateField = useCallback(
    <K extends keyof TaskFormValues>(
      field: K,
      nextValue: TaskFormValues[K]
    ) => {
      onChange((previous) => ({
        ...(previous ?? DEFAULT_TASK_FORM_VALUES),
        [field]: nextValue,
      }));
      onFieldChange?.(field);
    },
    [onChange, onFieldChange]
  );

  const toggleAssignee = useCallback(
    (memberId: string, checked: boolean) => {
      const nextAssignees = checked
        ? [...formData.assignees, memberId]
        : formData.assignees.filter((id) => id !== memberId);
      updateField("assignees", nextAssignees);
    },
    [formData.assignees, updateField]
  );

  const handleAddTaskType = useCallback(async () => {
    const trimmed = newTaskTypeName.trim();
    if (!trimmed) {
      toast.error("Please enter a task type name");
      return;
    }

    const existingType = allTaskTypes.find(
      (type) => type.type_name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existingType) {
      toast.error(`Task type "${trimmed}" already exists`);
      updateField("task_type", String(existingType.id));
      setNewTaskTypeName("");
      return;
    }

    try {
      const result = await taskTypeMutations.createTaskType.mutateAsync({
        type_name: trimmed,
        type_color: "#3b82f6",
      });

      updateField("task_type", String(result.id));
      setNewTaskTypeName("");
    } catch {
      toast.error("Failed to add task type");
    }
  }, [
    allTaskTypes,
    newTaskTypeName,
    taskTypeMutations.createTaskType,
    updateField,
  ]);

  return (
    <div className="space-y-4">
      <Input
        error={fieldErrors.task_name}
        label="Task Name"
        leftIcon={<ListTodo aria-hidden className="h-4 w-4" strokeWidth={2} />}
        maxLength={TASK_FIELD_LIMITS.task_name}
        placeholder="Task name"
        value={formData.task_name}
        onChange={(event) => updateField("task_name", event.target.value)}
      />

      <Input
        label="Deadline"
        leftIcon={<Calendar aria-hidden className="h-4 w-4" strokeWidth={2} />}
        placeholder="Pick a date"
        type="date"
        value={formData.deadline}
        onChange={(event) => updateField("deadline", event.target.value)}
      />

      <div className="space-y-2">
        <Dropdown
          error={fieldErrors.task_type}
          label="Task Type"
          options={taskTypeOptions}
          placeholder={
            taskTypeOptions.length > 0
              ? "Select task type"
              : "No types available"
          }
          value={formData.task_type || undefined}
          onChange={(next) => updateField("task_type", next)}
        />
        <div className="flex gap-2">
          <Input
            className="min-w-0 flex-1"
            disabled={taskTypeMutations.createTaskType.isPending}
            placeholder="Add new task type"
            value={newTaskTypeName}
            onChange={(event) => setNewTaskTypeName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleAddTaskType();
              }
            }}
          />
          <Button
            iconOnly
            aria-label="Add task type"
            disabled={
              taskTypeMutations.createTaskType.isPending ||
              !newTaskTypeName.trim()
            }
            leftIcon={<Check aria-hidden className="h-4 w-4" strokeWidth={2} />}
            onClick={() => void handleAddTaskType()}
          />
        </div>
      </div>

      {showStatus && taskStatusOptions.length > 0 ? (
        <Dropdown
          label="Task Status"
          options={taskStatusOptions}
          placeholder="Select status"
          value={formData.task_status || undefined}
          onChange={(next) => updateField("task_status", next)}
        />
      ) : null}

      <div className="space-y-2">
        <p className="text-text-primary text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <Users aria-hidden className="h-4 w-4" strokeWidth={2} />
            Assignees
          </span>
        </p>
        {fieldErrors.assignees ? (
          <p className="text-feedback-error text-sm">{fieldErrors.assignees}</p>
        ) : (
          <p className="text-text-muted text-xs">
            Select one or more team members.
          </p>
        )}
        <div className="border-border-subtle max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
          {assigneeOptions.length === 0 ? (
            <p className="text-text-muted px-2 py-3 text-sm">
              No team members available.
            </p>
          ) : (
            assigneeOptions.map((option) => {
              const inputId = `task-assignee-${option.value}`;
              const checked = formData.assignees.includes(option.value);

              return (
                <label
                  key={option.value}
                  className="hover:bg-bg-hover/40 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors"
                  htmlFor={inputId}
                >
                  <Checkbox
                    checked={checked}
                    id={inputId}
                    onChange={(event) =>
                      toggleAssignee(option.value, event.target.checked)
                    }
                  />
                  <span className="text-text-primary text-sm">
                    {option.label}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-text-primary text-sm font-medium">
          Task Priority
        </legend>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          {TASK_PRIORITIES.map((priority) => (
            <div key={priority} className="flex items-center gap-2">
              <Flag
                aria-hidden
                className={cn("h-4 w-4", TASK_PRIORITY_FLAG_COLORS[priority])}
                fill="currentColor"
              />
              <Radio
                checked={formData.task_priority === priority}
                label={TASK_PRIORITY_LABELS[priority]}
                name="task_priority"
                value={priority}
                onChange={() => updateField("task_priority", priority)}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <label
          className="text-text-primary block text-sm font-medium"
          htmlFor="task-description"
        >
          <span className="inline-flex items-center gap-2">
            <AlignLeft aria-hidden className="h-4 w-4" strokeWidth={2} />
            Description
          </span>
        </label>
        <Textarea
          id="task-description"
          maxLength={TASK_FIELD_LIMITS.description}
          placeholder="Description"
          value={formData.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
        <CharCount
          current={formData.description.length}
          max={TASK_FIELD_LIMITS.description}
        />
      </div>
    </div>
  );
}
