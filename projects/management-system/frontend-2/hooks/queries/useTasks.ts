import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { TasksService } from "@/api/services";
import type { PaginatedTaskResponse, Task, TaskListParams } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

type TasksQueryData = PaginatedTaskResponse | Task[];

const isPaginated = (data: TasksQueryData): data is PaginatedTaskResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    "total_count" in data
  );
};

export const useTasks = (params: TaskListParams = {}) => {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(() => {
    const {
      search = "",
      task_types,
      priorities,
      assignee,
      task_priority,
      task_type,
      task_status,
      overdue,
      deadline_from,
      deadline_to,
      deadline_start,
      deadline_end,
      page = 1,
      page_size = 10,
    } = params;
    return [
      QUERY_KEYS.TASKS,
      organizationId,
      search,
      task_types?.join(",") ?? "",
      priorities?.join(",") ?? "",
      assignee,
      task_priority,
      task_type,
      task_status,
      overdue,
      deadline_from,
      deadline_to,
      deadline_start,
      deadline_end,
      page,
      page_size,
    ];
  }, [organizationId, params]);

  const query = useQuery<TasksQueryData>({
    queryKey,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");

      return TasksService.getTasks(organizationId, params);
    },
    enabled: !!organizationId,
    placeholderData: (prev) => prev,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  const tasks = useMemo(() => {
    if (!query.data) return [];

    const responseData = query.data;

    return isPaginated(responseData) ? responseData.results : responseData;
  }, [query.data]);

  const pagination = useMemo(() => {
    if (!query.data) return null;

    const responseData = query.data;

    if (!isPaginated(responseData)) return null;

    const {
      total_count,
      next,
      previous,
      results,
      total_pages,
      current_page,
      page_size,
    } = responseData;

    return {
      totalCount: total_count,
      totalPages: total_pages,
      currentPage: current_page,
      pageSize: page_size,
      hasNext: !!next,
      hasPrevious: !!previous,
      resultsCount: results.length,
    };
  }, [query.data]);

  return {
    ...query,
    tasks,
    pagination,
  };
};

export const useTask = (taskId: number | null) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<Task>({
    queryKey: [QUERY_KEYS.TASK, organizationId, taskId],
    queryFn: () => {
      if (!organizationId || !taskId) {
        throw new Error("Organization ID and Task ID are required");
      }
      return TasksService.getTask(organizationId, taskId);
    },
    enabled: !!organizationId && !!taskId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};
