import { useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/api/client";
import { TaskTypesService } from "@/api/services";
import type { TaskTypeCreatePayload, TaskTypeIdUpdateArgs } from "@/api/types";
import { QUERY_KEYS } from "@/constants/enums";

import { useRouteIds } from "../useRouteIds";

export const useTaskTypeMutations = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  // Invalidate all task type-related queries
  const invalidateTaskTypeQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_TYPES] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_TYPE] });
    // Also invalidate tasks since they reference task types
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
  }, [queryClient]);

  const create = useMutation({
    mutationFn: (data: TaskTypeCreatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return TaskTypesService.createTaskType(organizationId, data);
    },
    onSuccess: () => {
      invalidateTaskTypeQueries();
      toast.success("Task type created successfully");
    },
    onError: (error: Error) => {
      // Handle specific validation errors
      const errorMessage = error.message || "Failed to create task type";
      if (errorMessage.includes("already exists")) {
        toast.error("Task type with this name already exists");
      } else if (errorMessage.includes("Color must be")) {
        toast.error(
          "Invalid color format. Please use a hex color code (e.g., #FF5733)"
        );
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const update = useMutation({
    mutationFn: ({ taskTypeId, data }: TaskTypeIdUpdateArgs) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return TaskTypesService.updateTaskType(organizationId, taskTypeId, data);
    },
    onSuccess: () => {
      invalidateTaskTypeQueries();
      toast.success("Task type updated successfully");
    },
    onError: (error: Error) => {
      // Handle specific validation errors
      const errorMessage = error.message || "Failed to update task type";
      if (errorMessage.includes("already exists")) {
        toast.error("Task type with this name already exists");
      } else if (errorMessage.includes("Color must be")) {
        toast.error(
          "Invalid color format. Please use a hex color code (e.g., #FF5733)"
        );
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const remove = useMutation({
    mutationFn: (taskTypeId: number | string) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return TaskTypesService.deleteTaskType(organizationId, taskTypeId);
    },
    onSuccess: () => {
      invalidateTaskTypeQueries();
      toast.success("Task type deleted successfully");
    },
    onError: (error: unknown) => {
      // Handle array error responses (e.g., ["Cannot delete task type..."])
      let errorMessage =
        "Failed to delete task type. It may be in use by existing tasks.";

      if (error instanceof ApiError) {
        // Use ApiError's getUserMessage method for structured errors
        errorMessage = error.getUserMessage();
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });

  return {
    create,
    update,
    remove,
    createTaskType: create,
    updateTaskType: update,
    deleteTaskType: remove,
  };
};
