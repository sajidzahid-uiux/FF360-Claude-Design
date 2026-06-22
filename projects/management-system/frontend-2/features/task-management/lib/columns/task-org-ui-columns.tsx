"use client";

import {
  type Column,
  type TableAction,
  TableActions,
  TableHeaderLabel,
  Trash2,
} from "@fieldflow360/org-ui";
import {
  Calendar,
  CheckCircle2,
  Flag,
  Pencil,
  Tags,
  User,
  Users,
} from "lucide-react";

import type { Task, TaskStatus, TaskType } from "@/api/types";
import type { TeamMember } from "@/api/types/team";
import { TaskPriority } from "@/constants/enums";
import { TaskAssigneesCell } from "@/features/task-management";
import { orgUiIsoDateColumn } from "@/shared/lib/table/org-ui";

import {
  TaskDeadlineCell,
  TaskNameCell,
  TaskPriorityCell,
  TaskStatusCell,
  TaskTypeCell,
} from "./task-column-cells";
import {
  type TaskOrgUiColumnHandlers,
  buildTaskRowActions,
} from "./task-org-ui-row-actions";

export type { TaskOrgUiColumnHandlers };

export interface TaskOrgUiColumnsOptions extends TaskOrgUiColumnHandlers {
  canEditStatus: boolean;
  taskStatuses?: TaskStatus[];
  taskTypes?: TaskType[];
  teamMembers?: TeamMember[];
  onStatusChange?: (task: Task, newStatusId: number) => void;
  onTypeChange?: (task: Task, newTypeId: number) => void;
  onOpenTaskTypeForm?: (type: TaskType | null) => void;
  onDeleteTypeWithConfirm?: (type: TaskType) => void;
  onPriorityChange?: (task: Task, newPriority: TaskPriority) => void;
  onDateChange?: (
    task: Task,
    field: "created_at" | "deadline",
    newDate: string
  ) => void;
  onAssigneesChange?: (task: Task, assigneeIds: number[]) => void;
  onRowDoubleClick?: (task: Task) => void;
}

function buildTaskTableActions(
  task: Task,
  handlers: TaskOrgUiColumnHandlers
): TableAction<Task>[] {
  const iconByKey = {
    edit: <Pencil aria-hidden className="h-4 w-4" strokeWidth={2} />,
    delete: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
  } as const;

  return buildTaskRowActions(task, handlers).map((action) => ({
    label: action.label,
    icon: iconByKey[action.key],
    variant: action.variant,
    onClick: action.onClick,
  }));
}

export function getTaskOrgUiColumns(
  options: TaskOrgUiColumnsOptions
): Column<Task>[] {
  const {
    canEdit,
    canEditStatus,
    canDelete,
    onEdit,
    onDelete,
    taskStatuses,
    taskTypes,
    teamMembers,
    onStatusChange,
    onTypeChange,
    onOpenTaskTypeForm,
    onDeleteTypeWithConfirm,
    onPriorityChange,
    onDateChange,
    onAssigneesChange,
    onRowDoubleClick,
  } = options;

  const rowHandlers: TaskOrgUiColumnHandlers = {
    canEdit,
    canDelete,
    onEdit,
    onDelete,
  };

  const showActions = canEdit || canDelete;

  return [
    {
      key: "task_name",
      label: "Task Name",
      sortable: true,
      header: <TableHeaderLabel truncate icon={User} label="Task Name" />,
      width: "300px",
      render: (task) => (
        <div
          className={canEdit && onRowDoubleClick ? "cursor-default" : undefined}
          onDoubleClick={() => {
            if (canEdit && onRowDoubleClick) {
              onRowDoubleClick(task);
            }
          }}
        >
          <TaskNameCell task={task} />
        </div>
      ),
    },
    {
      key: "assignee_info",
      label: "Assignees",
      header: <TableHeaderLabel truncate icon={Users} label="Assignees" />,
      width: "220px",
      render: (task) => (
        <TaskAssigneesCell
          canEdit={canEdit}
          task={task}
          teamMembers={teamMembers}
          onAssigneesChange={onAssigneesChange}
        />
      ),
    },
    {
      key: "task_status_info",
      label: "Status",
      header: <TableHeaderLabel truncate icon={CheckCircle2} label="Status" />,
      width: "120px",
      render: (task) => (
        <TaskStatusCell
          canEdit={canEdit}
          canEditStatus={canEditStatus}
          task={task}
          taskStatuses={taskStatuses}
          onStatusChange={onStatusChange}
        />
      ),
    },
    {
      key: "task_type_info",
      label: "Type",
      header: <TableHeaderLabel truncate icon={Tags} label="Type" />,
      width: "100px",
      render: (task) => (
        <TaskTypeCell
          canEdit={canEdit}
          task={task}
          taskTypes={taskTypes}
          onDeleteTypeWithConfirm={onDeleteTypeWithConfirm}
          onOpenTaskTypeForm={onOpenTaskTypeForm}
          onTypeChange={onTypeChange}
        />
      ),
    },
    {
      key: "task_priority",
      label: "Priority",
      header: <TableHeaderLabel truncate icon={Flag} label="Priority" />,
      width: "100px",
      render: (task) => (
        <TaskPriorityCell
          canEdit={canEdit}
          task={task}
          onPriorityChange={onPriorityChange}
        />
      ),
    },
    orgUiIsoDateColumn<Task>({
      key: "created_at",
      label: "Created at",
      sortable: true,
      width: "130px",
      getValue: (task) => task.created_at,
    }),
    {
      key: "deadline",
      label: "Deadline",
      sortable: true,
      header: <TableHeaderLabel truncate icon={Calendar} label="Deadline" />,
      width: "130px",
      render: (task) => (
        <TaskDeadlineCell
          canEdit={canEdit}
          deadline={task.deadline}
          task={task}
          onDateChange={onDateChange}
        />
      ),
    },
    ...(showActions
      ? [
          {
            key: "actions",
            label: "Actions",
            hideable: false,
            header: "",
            width: "80px",
            align: "right" as const,
            render: (task: Task) => (
              <TableActions
                actions={buildTaskTableActions(task, rowHandlers)}
                item={task}
                maxVisibleActions={0}
              />
            ),
          },
        ]
      : []),
  ];
}
