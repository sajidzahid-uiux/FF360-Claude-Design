import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { TaskStatusesService } from "@/api/services";
import type { TaskStatus, TaskStatusListParams } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

export const useTaskStatuses = (params: TaskStatusListParams = {}) => {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(() => {
    const { page, page_size } = params;
    return [
      QUERY_KEYS.TASK_STATUSES,
      organizationId,
      page ?? null,
      page_size ?? null,
    ];
  }, [organizationId, params]);

  const query = useQuery<TaskStatus[]>({
    queryKey,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return TaskStatusesService.getTaskStatuses(organizationId, params);
    },
    enabled: !!organizationId,
    placeholderData: (prev) => prev,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  const taskStatuses = useMemo(() => query.data || [], [query.data]);

  return {
    ...query,
    taskStatuses,
  };
};
