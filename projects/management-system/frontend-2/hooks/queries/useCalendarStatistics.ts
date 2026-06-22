import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { SchedulingService } from "@/api/services";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";
import type { CalendarStatsCounts } from "@/entities/calendar-item";

import { useRouteIds } from "../useRouteIds";

export function useCalendarStatistics() {
  const { orgId: organizationId } = useRouteIds();

  const query = useQuery({
    queryKey: [QUERY_KEYS.CALENDAR_STATISTICS, organizationId] as const,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return SchedulingService.getStatistics(organizationId);
    },
    enabled: !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  const counts = useMemo<CalendarStatsCounts>(() => {
    if (!query.data) {
      return {
        missingSchedules: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        notStarted: 0,
        leads: 0,
      };
    }
    return {
      missingSchedules:
        query.data.jobs_without_schedule + query.data.leads_without_schedule,
      inProgress: query.data.total_in_progress,
      completed: query.data.total_completed,
      overdue: query.data.total_overdue,
      notStarted: query.data.total_not_started,
      leads: query.data.total_leads,
    };
  }, [query.data]);

  return { ...query, counts };
}
