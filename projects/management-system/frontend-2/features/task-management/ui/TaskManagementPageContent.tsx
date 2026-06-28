"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ComponentSizeEnum,
  Loader,
  type TableSortRule,
  applyTableSort,
} from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { Task, TaskListParams, TaskStatus, TaskType } from "@/api/types";
import { TeamMember } from "@/api/types/team";
import { TaskPriority as TaskPriorityEnum } from "@/constants/enums";
import {
  AddTaskModal,
  EditTaskModal,
  TasksTable,
  TypeManagementDialog,
} from "@/features/task-management";
import { useDebouncedValue, useDialogManager, useTeamData } from "@/hooks";
import { useTaskMutations, useTaskTypeMutations } from "@/hooks/mutations";
import { useTodoPermission } from "@/hooks/permissions";
import { useTaskStatuses, useTaskTypes, useTasks } from "@/hooks/queries";
import { bulkConfirmationCopy, bulkDeleteSuccessMessage } from "@/shared/lib";
import { useModalStack } from "@/shared/model/use-modal-stack";
import {
  DialogManager,
  FilterState,
  FilterType,
  PageContainer,
  PageRenderer,
} from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";

export default function TaskManagement() {
  const { data: teamData } = useTeamData() as { data?: TeamMember[] };

  // Permissions
  const {
    canRead,
    canEdit,
    canEditStatus,
    canDelete,
    isLoading: permissionsLoading,
  } = useTodoPermission();

  // Task mutations
  const taskMutations = useTaskMutations();
  const taskTypeMutations = useTaskTypeMutations();

  const dialogManager = useDialogManager();
  const { stack, openModal, closeModalKey } = useModalStack();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<(string | number)[]>(
    []
  );
  const [sortRules, setSortRules] = useState<TableSortRule[]>([]);

  const [filters, setFilters] = useState<FilterState>({});

  // Debounce search to reduce API calls
  const debouncedSearch = useDebouncedValue(searchTerm);

  // Convert filter values to API params
  const taskListParams = useMemo<TaskListParams>(() => {
    const taskTypes = Array.isArray(filters[FilterType.TASK_TYPES])
      ? filters[FilterType.TASK_TYPES]
      : [];
    const taskStatus =
      Array.isArray(filters[FilterType.TASK_STATUS]) &&
      filters[FilterType.TASK_STATUS].length > 0
        ? filters[FilterType.TASK_STATUS][0]
        : null;
    const priorities = Array.isArray(filters[FilterType.PRIORITIES])
      ? filters[FilterType.PRIORITIES]
      : [];
    const assignee =
      Array.isArray(filters[FilterType.ASSIGNEES]) &&
      filters[FilterType.ASSIGNEES].length > 0
        ? filters[FilterType.ASSIGNEES][0]
        : null;
    const deadlineRange = filters[FilterType.DEADLINE_RANGE];

    return {
      page: 1,
      page_size: 100,

      ...(debouncedSearch ? { search: debouncedSearch } : {}),

      ...(taskTypes.length ? { task_types: taskTypes.map(Number) } : {}),
      ...(taskStatus !== null ? { task_status: Number(taskStatus) } : {}),
      ...(priorities.length
        ? { priorities: priorities as TaskPriorityEnum[] }
        : {}),
      ...(assignee !== null ? { assignee: Number(assignee) } : {}),

      ...(deadlineRange &&
      typeof deadlineRange === "object" &&
      "startValue" in deadlineRange &&
      deadlineRange.startValue
        ? { deadline_start: deadlineRange.startValue }
        : {}),
      ...(deadlineRange &&
      typeof deadlineRange === "object" &&
      "endValue" in deadlineRange &&
      deadlineRange.endValue
        ? { deadline_end: deadlineRange.endValue }
        : {}),
    };
  }, [debouncedSearch, filters]);

  // Fetch tasks and task types from API (not using mock data)
  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksErrorRaw,
  } = useTasks(taskListParams);
  const { taskTypes, isLoading: taskTypesLoading } = useTaskTypes({});
  const taskTypesRef = useRef(taskTypes);

  useEffect(() => {
    taskTypesRef.current = taskTypes;
  }, [taskTypes]);
  const { data: taskStatusesData } = useTaskStatuses();

  // Convert API Task type to model Task type if needed
  const convertedTasks = useMemo(() => {
    return tasks.map((task) => ({
      ...task,
      // Ensure task_status is always a number (model requirement)
      task_status: task.task_status ?? 0,
      // Ensure task_status_info exists
      task_status_info: task.task_status_info ?? {
        id: 0,
        name: "Unknown",
        is_default: false,
      },
    })) as Task[];
  }, [tasks]);

  const isAddTaskOpen = stack.some((f) => f.key === "add-task");
  const editTaskFrame = stack.find((f) => f.key === "edit-task");
  const editingTask = useMemo<Task | null>(() => {
    if (!editTaskFrame) return null;
    const id = Number(editTaskFrame.params.id);
    return convertedTasks.find((t) => t.id === id) ?? null;
  }, [editTaskFrame, convertedTasks]);

  const handleDeleteTask = useCallback(
    (task: Task) => {
      const taskName = task.task_name || `Task #${task.id}`;
      dialogManager.openConfirmationDialog({
        title: "Delete Task",
        confirmationType: "delete",
        itemTitle: taskName,
        variant: "destructive",
        confirmButtonText: "Delete",
        onConfirm: async () => {
          try {
            await taskMutations.deleteTask.mutateAsync(task.id);
            toast.success("Task deleted successfully");
            dialogManager.closeDialog();
          } catch (error: unknown) {
            console.error("Failed to delete task:", error);
            toast.error("Failed to delete task");
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [dialogManager, taskMutations.deleteTask]
  );

  const handleBulkDelete = useCallback(
    (ids: (string | number)[]) => {
      const numericIds = ids
        .map((id) => (typeof id === "string" ? Number.parseInt(id, 10) : id))
        .filter((id) => !Number.isNaN(id));

      if (numericIds.length === 0) return;

      const count = numericIds.length;
      const { title, description, confirmButtonText } = bulkConfirmationCopy({
        count,
        entitySingular: "task",
        entityPlural: "tasks",
        action: "delete",
      });

      dialogManager.openConfirmationDialog({
        title,
        description,
        variant: "destructive",
        confirmButtonText,
        onConfirm: async () => {
          try {
            await Promise.allSettled(
              numericIds.map((id) => taskMutations.deleteTaskSilent(id))
            );
            taskMutations.invalidateTasks();
            toast.success(
              bulkDeleteSuccessMessage(count, "task", "tasks", {
                pastTense: "deleted successfully",
              })
            );
            setSelectedTaskIds([]);
            dialogManager.closeDialog();
          } catch (error: unknown) {
            console.error("Failed to delete tasks:", error);
            toast.error("Failed to delete tasks");
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [dialogManager, taskMutations]
  );

  const handleAddTaskClick = useCallback(() => {
    openModal("add-task");
  }, [openModal]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSelectChange = useCallback((ids: (string | number)[]) => {
    setSelectedTaskIds(ids);
  }, []);

  const handleStatusChange = useCallback(
    (task: Task, newStatusId: number) => {
      taskMutations.updateTask.mutate({
        taskId: task.id,
        data: { task_status: newStatusId },
      });
    },
    [taskMutations.updateTask]
  );

  const handleAssigneesChange = useCallback(
    (task: Task, assigneeIds: number[]) => {
      taskMutations.updateTask.mutate({
        taskId: task.id,
        data: { assignees: assigneeIds },
      });
    },
    [taskMutations.updateTask]
  );

  const handleTypeChange = useCallback(
    (task: Task, newTypeId: number) => {
      taskMutations.updateTask.mutate({
        taskId: task.id,
        data: { task_type: newTypeId },
      });
    },
    [taskMutations.updateTask]
  );

  const handleAddType = useCallback(
    (name: string, color: string) => {
      taskTypeMutations.createTaskType.mutate({
        type_name: name,
        type_color: color,
      });
    },
    [taskTypeMutations.createTaskType]
  );

  const handleEditType = useCallback(
    (id: number, name: string, color: string) => {
      taskTypeMutations.updateTaskType.mutate({
        taskTypeId: id,
        data: {
          type_name: name,
          type_color: color,
        },
      });
    },
    [taskTypeMutations.updateTaskType]
  );

  const openTaskTypeFormDialog = useCallback(
    (type: TaskType | null) => {
      dialogManager.openDialog({
        type: "component",
        component: TypeManagementDialog,
        props: {
          taskTypes: taskTypes || [],
          editingTypeId: type?.id ?? null,
          onAddType: handleAddType,
          onEditType: handleEditType,
        },
      });
    },
    [dialogManager, taskTypes, handleAddType, handleEditType]
  );

  const openDeleteTypeConfirmation = useCallback(
    (type: TaskType) => {
      dialogManager.openConfirmationDialog({
        title: "Delete Task Type",
        confirmationType: "delete",
        itemTitle: type.type_name,
        variant: "destructive",
        confirmButtonText: "Delete",
        onConfirm: async () => {
          try {
            await taskTypeMutations.deleteTaskType.mutateAsync(type.id);
            dialogManager.closeDialog();
          } catch (error: unknown) {
            toast.error("Failed to delete task type");
            throw error;
          }
        },
      });
    },
    [dialogManager, taskTypeMutations.deleteTaskType]
  );

  const handlePriorityChange = useCallback(
    (task: Task, newPriority: TaskPriorityEnum) => {
      taskMutations.updateTask.mutate({
        taskId: task.id,
        data: { task_priority: newPriority },
      });
    },
    [taskMutations.updateTask]
  );

  const handleDateChange = useCallback(
    (task: Task, field: "created_at" | "deadline", newDate: string) => {
      // Only deadline can be updated (created_at is read-only)
      if (field === "deadline") {
        taskMutations.updateTask.mutate({
          taskId: task.id,
          data: { deadline: newDate },
        });
      }
    },
    [taskMutations]
  );

  // Tasks are now filtered server-side via API params
  // Additional client-side filtering for task_status (since it's skipped in API params)
  const filteredTasks = useMemo(() => {
    let result = convertedTasks;

    const taskStatus =
      Array.isArray(filters[FilterType.TASK_STATUS]) &&
      filters[FilterType.TASK_STATUS].length > 0
        ? Number(filters[FilterType.TASK_STATUS][0])
        : null;
    const priorities = Array.isArray(filters[FilterType.PRIORITIES])
      ? filters[FilterType.PRIORITIES]
      : [];
    const taskTypes = Array.isArray(filters[FilterType.TASK_TYPES])
      ? filters[FilterType.TASK_TYPES].map(Number)
      : [];

    // Client-side task status filter (since API integration is skipped)
    if (taskStatus !== null) {
      result = result.filter(
        (task) =>
          task.task_status_info && task.task_status_info.id === taskStatus
      );
    }

    // Client-side multiple priorities filter (API only supports single priority)
    if (priorities.length > 1) {
      result = result.filter((task) =>
        priorities.includes(task.task_priority as TaskPriorityEnum)
      );
    }

    // Client-side multiple task types filter (if API doesn't support array)
    // Note: This might not be needed if API supports array, but keeping for safety
    if (taskTypes.length > 1) {
      result = result.filter(
        (task) =>
          task.task_type_info && taskTypes.includes(task.task_type_info.id)
      );
    }

    return result;
  }, [convertedTasks, filters]);

  const sortedTasks = useMemo(
    () =>
      applyTableSort(filteredTasks, sortRules, (task, columnKey) => {
        switch (columnKey) {
          case "task_name":
            return task.task_name ?? "";
          case "created_at":
            return task.created_at ?? "";
          case "deadline":
            return task.deadline ?? "";
          default:
            return "";
        }
      }),
    [filteredTasks, sortRules]
  );

  const statusOptions = useMemo(() => {
    if (taskStatusesData && taskStatusesData.length > 0) {
      return taskStatusesData;
    }
    // Fallback: derive from tasks if API data unavailable
    const seen = new Map<number, TaskStatus>();
    convertedTasks.forEach((t) => {
      if (t.task_status_info) {
        seen.set(t.task_status_info.id, {
          id: t.task_status_info.id,
          organization: t.organization,
          name: t.task_status_info.name,
          is_default: t.task_status_info.is_default,
          created_at: t.created_at,
        });
      }
    });
    return Array.from(seen.values());
  }, [taskStatusesData, convertedTasks]);

  const openEditTaskDialog = useCallback(
    (task: Task) => {
      openModal("edit-task", { id: String(task.id) });
    },
    [openModal]
  );

  const handleRowDoubleClick = useCallback(
    (task: Task) => {
      if (!canEdit) return;
      openEditTaskDialog(task);
    },
    [canEdit, openEditTaskDialog]
  );

  const tasksError =
    tasksErrorRaw instanceof Error
      ? tasksErrorRaw
      : tasksErrorRaw
        ? new Error(String(tasksErrorRaw))
        : null;

  const isLoading = tasksLoading || taskTypesLoading;

  if (permissionsLoading) {
    return (
      <PageContainer>
        <Loader size={ComponentSizeEnum.MD} text="Loading permissions…" />
      </PageContainer>
    );
  }

  return (
    <PageRenderer
      renderChildrenWhenEmpty
      data={sortedTasks}
      description="View and manage your tasks here."
      emptyState={{
        title: "No tasks found",
        description: "Try adjusting your search or filters to find tasks.",
      }}
      error={tasksError}
      isLoading={isLoading}
      loadingMessage="Loading tasks…"
      title="To-Do List"
    >
      {() => {
        if (!canRead) {
          return (
            <AccessDeniedView message="You do not have permission to view the To-Do List page." />
          );
        }

        return (
          <>
            <TasksTable
              canDelete={canDelete}
              canEdit={canEdit}
              canEditStatus={canEditStatus}
              data={sortedTasks}
              filters={filters}
              isLoading={isLoading}
              search={{
                value: searchTerm,
                onChange: handleSearch,
                placeholder: "Search tasks…",
              }}
              selectable={canDelete}
              selectedIds={selectedTaskIds}
              sortRules={sortRules}
              statusOptions={statusOptions}
              taskTypes={(taskTypes || []) as TaskType[]}
              teamData={teamData}
              onAdd={canEdit ? handleAddTaskClick : undefined}
              onAssigneesChange={handleAssigneesChange}
              onBulkDelete={handleBulkDelete}
              onDateChange={handleDateChange}
              onDelete={handleDeleteTask}
              onDeleteTypeWithConfirm={openDeleteTypeConfirmation}
              onEdit={openEditTaskDialog}
              onFiltersChange={setFilters}
              onOpenTaskTypeForm={openTaskTypeFormDialog}
              onPriorityChange={handlePriorityChange}
              onRowDoubleClick={handleRowDoubleClick}
              onSelectChange={handleSelectChange}
              onSortRulesChange={setSortRules}
              onStatusChange={handleStatusChange}
              onTypeChange={handleTypeChange}
            />
            <AddTaskModal
              open={isAddTaskOpen}
              taskStatuses={statusOptions}
              taskTypes={(taskTypes || []) as TaskType[]}
              onOpenChange={(open: boolean) => {
                if (!open) {
                  closeModalKey("add-task");
                }
              }}
            />
            <EditTaskModal
              open={editingTask != null}
              task={editingTask}
              taskStatuses={statusOptions}
              taskTypes={(taskTypes || []) as TaskType[]}
              onOpenChange={(open: boolean) => {
                if (!open) {
                  closeModalKey("edit-task");
                }
              }}
            />
            <DialogManager manager={dialogManager} />
          </>
        );
      }}
    </PageRenderer>
  );
}
