import { useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { TasksService } from "@/api/services";
import type { TaskCreatePayload, TaskIdUpdateArgs } from "@/api/types";
import { QUERY_KEYS } from "@/constants/enums";

import { useRouteIds } from "../useRouteIds";

export const useTaskMutations = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  // Invalidate all task-related queries
  const invalidateTaskQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK] });
  }, [queryClient]);

  const removeSilent = useCallback(
    async (taskId: number | string) => {
      if (!organizationId) throw new Error("Organization ID is required");
      await TasksService.deleteTask(organizationId, taskId);
    },
    [organizationId]
  );

  const create = useMutation({
    mutationFn: (data: TaskCreatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return TasksService.createTask(organizationId, data);
    },
    onSuccess: () => {
      invalidateTaskQueries();
      toast.success("Task created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create task");
    },
  });

  const update = useMutation({
    mutationFn: ({ taskId, data }: TaskIdUpdateArgs) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return TasksService.updateTask(organizationId, taskId, data);
    },
    onSuccess: () => {
      invalidateTaskQueries();
      toast.success("Task updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update task");
    },
  });

  const remove = useMutation({
    mutationFn: (taskId: number | string) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return TasksService.deleteTask(organizationId, taskId);
    },
    onSuccess: () => {
      invalidateTaskQueries();
      toast.success("Task deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });

  return {
    create,
    update,
    remove,
    removeSilent,
    createTask: create,
    updateTask: update,
    deleteTask: remove,
    deleteTaskSilent: removeSilent,
    invalidateTasks: invalidateTaskQueries,
  };
};
