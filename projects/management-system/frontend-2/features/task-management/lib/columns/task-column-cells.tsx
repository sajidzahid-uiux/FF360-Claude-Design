"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";

import { Flag, Pencil, Trash2 } from "lucide-react";

import type { Task, TaskStatus, TaskType } from "@/api/types";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_FLAG_COLORS,
  TaskPriority,
} from "@/constants/enums";
import { formatTableIsoDate } from "@/shared/lib/table/org-ui";
import { ExpandableDescriptionCell } from "@/shared/ui";
import { Dropdown } from "@/shared/ui/common";
import { Badge, SanitizedInput } from "@/shared/ui/primitives";
import { buildRowActions } from "@/utils/actions";

export function TaskActionsCell({
  task,
  canEdit,
  canDelete,
  onRowAction,
  onDeleteTask,
}: {
  task: Task;
  canEdit: boolean;
  canDelete: boolean;
  onRowAction?: (task: Task, action: string) => void;
  onDeleteTask?: (task: Task) => void;
}) {
  const items = useMemo(
    () =>
      buildRowActions({
        canView: false,
        canEdit,
        canDelete,
        canArchive: false,
        canTrack: false,
        isArchived: false,
        onView: () => {},
        onEdit: () => onRowAction?.(task, "edit"),
        onDelete: () => onDeleteTask?.(task),
      }),
    [task, canEdit, canDelete, onRowAction, onDeleteTask]
  );

  return <Dropdown items={items} />;
}

export function TaskNameCell({ task }: { task: Task }) {
  return (
    <div className="flex max-w-[520px] flex-col gap-1.5">
      <ExpandableDescriptionCell
        description={task.description}
        isOverdue={task.overdue}
        title={task.task_name}
        truncateLength={40}
      />
    </div>
  );
}

export function TaskTypeCell({
  task,
  canEdit,
  taskTypes,
  onTypeChange,
  onOpenTaskTypeForm,
  onDeleteTypeWithConfirm,
}: {
  task: Task;
  canEdit: boolean;
  taskTypes?: TaskType[];
  onTypeChange?: (task: Task, newTypeId: number) => void;
  onOpenTaskTypeForm?: (type: TaskType | null) => void;
  onDeleteTypeWithConfirm?: (type: TaskType) => void;
}) {
  const typeInfo = task.task_type_info;

  const typeItems = useMemo(() => {
    const items: Array<{
      id: string;
      label: ReactNode;
      className?: string;
      disabled?: boolean;
      onSelect?: () => void;
    }> =
      taskTypes && taskTypes.length > 0
        ? taskTypes.map((type: TaskType) => {
            const isCurrentType = type.id === task.task_type;
            const isDefaultType = type.type_name === "Personal";

            return {
              id: `type-${type.id}`,
              label: (
                <div className="group/type hover:bg-bg-hover flex w-full items-center justify-between gap-2 rounded-sm pr-1">
                  <div className="flex min-w-0 flex-1 items-center">
                    <div
                      className="mr-2 h-3 w-3 flex-shrink-0 rounded"
                      style={{ backgroundColor: type.type_color }}
                    />
                    <span title={type.type_name}>
                      {type.type_name.length > 10
                        ? `${type.type_name.slice(0, 10)}...`
                        : type.type_name}
                    </span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/type:opacity-100">
                    <button
                      aria-label="Edit type"
                      className="hover:bg-bg-hover cursor-pointer rounded bg-transparent p-1 transition-colors"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onOpenTaskTypeForm?.(type);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    {!isDefaultType && !isCurrentType && (
                      <button
                        aria-label="Delete type"
                        className="text-feedback-error hover:bg-feedback-error-soft cursor-pointer rounded bg-transparent p-1 transition-colors"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDeleteTypeWithConfirm?.(type);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ),
              className: isCurrentType ? "bg-accent" : "",
              onSelect: () => {
                if (!isCurrentType) {
                  onTypeChange?.(task, type.id);
                }
              },
            };
          })
        : [{ id: "no-types", label: "No types available", disabled: true }];

    return items;
  }, [
    taskTypes,
    task,
    onTypeChange,
    onOpenTaskTypeForm,
    onDeleteTypeWithConfirm,
  ]);

  const typeFooter = (
    <button
      className="hover:bg-bg-hover flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors"
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onOpenTaskTypeForm?.(null);
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span>+ Add New Type</span>
    </button>
  );

  if (!typeInfo) {
    return <span className="text-text-muted text-sm">-</span>;
  }

  if (!canEdit) {
    return (
      <Badge
        className="inline-block max-w-[20ch] truncate"
        style={{
          backgroundColor: typeInfo.type_color,
          color: "white",
          border: "none",
        }}
        title={typeInfo.type_name}
      >
        {typeInfo.type_name}
      </Badge>
    );
  }

  return (
    <Dropdown
      align="end"
      footer={typeFooter}
      items={typeItems}
      mode="select"
      trigger={
        <button
          className="transition-opacity hover:opacity-70"
          title={typeInfo.type_name}
          type="button"
          onClick={(e) => e.stopPropagation()}
        >
          <Badge
            className="inline-block max-w-[20ch] truncate"
            style={{
              backgroundColor: typeInfo.type_color,
              color: "white",
              border: "none",
            }}
          >
            {typeInfo.type_name}
          </Badge>
        </button>
      }
      width={256}
    />
  );
}

export function TaskStatusCell({
  task,
  canEdit,
  canEditStatus,
  taskStatuses,
  onStatusChange,
}: {
  task: Task;
  canEdit: boolean;
  canEditStatus: boolean;
  taskStatuses?: TaskStatus[];
  onStatusChange?: (task: Task, newStatusId: number) => void;
}) {
  const statusInfo = task.task_status_info;
  const statusLabel = statusInfo?.name ?? "—";

  if (!canEdit && !canEditStatus) {
    return <span className="text-sm">{statusLabel}</span>;
  }

  const statusItems =
    taskStatuses && taskStatuses.length > 0
      ? taskStatuses.map((status: TaskStatus) => {
          const isCurrentStatus = status.id === task.task_status;

          return {
            id: `status-${status.id}`,
            label: status.name,
            className: isCurrentStatus ? "bg-accent" : "",
            onSelect: () => {
              if (!isCurrentStatus) {
                onStatusChange?.(task, status.id);
              }
            },
          };
        })
      : [
          {
            id: "no-statuses",
            label: "No statuses available",
            disabled: true,
          },
        ];

  return (
    <Dropdown
      align="start"
      items={statusItems}
      mode="select"
      trigger={
        <button
          className="text-sm transition-opacity hover:opacity-70"
          type="button"
          onClick={(e) => e.stopPropagation()}
        >
          {statusLabel}
        </button>
      }
    />
  );
}

export function TaskPriorityCell({
  task,
  canEdit,
  onPriorityChange,
}: {
  task: Task;
  canEdit: boolean;
  onPriorityChange?: (task: Task, newPriority: TaskPriority) => void;
}) {
  const priority = task.task_priority as TaskPriority;

  if (!canEdit) {
    return (
      <Flag className={`h-4 w-4 ${TASK_PRIORITY_FLAG_COLORS[priority]}`} />
    );
  }

  const priorityItems = TASK_PRIORITIES.map((p) => {
    const isCurrentPriority = p === priority;

    return {
      id: `priority-${p}`,
      label: <span className="capitalize">{p}</span>,
      icon: <Flag className={`mr-2 h-4 w-4 ${TASK_PRIORITY_FLAG_COLORS[p]}`} />,
      className: isCurrentPriority ? "bg-accent" : "",
      onSelect: () => {
        if (!isCurrentPriority) {
          onPriorityChange?.(task, p);
        }
      },
    };
  });

  return (
    <Dropdown
      align="start"
      items={priorityItems}
      mode="select"
      trigger={
        <button
          className="transition-opacity hover:opacity-70"
          type="button"
          onClick={(e) => e.stopPropagation()}
        >
          <Flag className={`h-4 w-4 ${TASK_PRIORITY_FLAG_COLORS[priority]}`} />
        </button>
      }
    />
  );
}

export function TaskDeadlineCell({
  task,
  deadline,
  canEdit,
  onDateChange,
}: {
  task: Task;
  deadline: string | null;
  canEdit: boolean;
  onDateChange?: (
    task: Task,
    field: "created_at" | "deadline",
    newDate: string
  ) => void;
}) {
  const formattedDeadline = deadline
    ? new Date(deadline).toISOString().split("T")[0]
    : "";
  const isOverdue = task.overdue;
  const [localValue, setLocalValue] = useState(formattedDeadline);

  useEffect(() => {
    setLocalValue(formattedDeadline);
  }, [formattedDeadline]);

  if (!canEdit) {
    return (
      <span className={`text-sm ${isOverdue ? "text-feedback-error" : ""}`}>
        {formattedDeadline || "-"}
      </span>
    );
  }

  return (
    <SanitizedInput
      className={`hover:bg-bg-hover cursor-pointer rounded border-none bg-transparent px-2 py-1 text-sm outline-none ${
        isOverdue ? "text-feedback-error" : ""
      }`}
      type="date"
      value={localValue}
      onBlur={() => {
        if (localValue && localValue !== formattedDeadline) {
          onDateChange?.(task, "deadline", localValue);
        }
      }}
      onChange={(e) => {
        setLocalValue(e.target.value);
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

export function formatTaskDate(dateValue: string): string {
  return formatTableIsoDate(dateValue);
}
