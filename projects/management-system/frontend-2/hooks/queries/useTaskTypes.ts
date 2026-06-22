import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { TaskTypesService } from "@/api/services";
import type { TaskType, TaskTypeListParams } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

export const useTaskTypes = (params: TaskTypeListParams = {}) => {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(() => {
    const { search = "" } = params;
    return [QUERY_KEYS.TASK_TYPES, organizationId, search];
  }, [organizationId, params]);

  const query = useQuery<TaskType[]>({
    queryKey,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return TaskTypesService.getTaskTypes(organizationId, params);
    },
    enabled: !!organizationId,
    placeholderData: (prev) => prev,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  const taskTypes = useMemo(() => {
    if (!query.data) return [];
    return query.data;
  }, [query.data]);

  const pagination = useMemo(() => {
    if (!query.data) return null;

    return {
      totalCount: query.data.length,
      hasNext: false,
      hasPrevious: false,
      resultsCount: query.data.length,
    };
  }, [query.data]);

  return {
    ...query,
    taskTypes,
    pagination,
  };
};

export const useTaskType = (taskTypeId: number | null) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<TaskType>({
    queryKey: [QUERY_KEYS.TASK_TYPE, organizationId, taskTypeId],
    queryFn: () => {
      if (!organizationId || !taskTypeId) {
        throw new Error("Organization ID and Task Type ID are required");
      }
      return TaskTypesService.getTaskType(organizationId, taskTypeId);
    },
    enabled: !!organizationId && !!taskTypeId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};
