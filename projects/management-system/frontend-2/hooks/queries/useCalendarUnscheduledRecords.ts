import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { SchedulingService } from "@/api/services";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";
import {
  type CalendarItem,
  mapSchedulingItemToCalendarItem,
} from "@/entities/calendar-item";

import { useRouteIds } from "../useRouteIds";

interface UnscheduledArgs {
  enabled?: boolean;
}

const UNSCHEDULED_RANGE_YEARS = 5;

function buildRange() {
  const today = new Date();
  const start = new Date(today.getFullYear() - UNSCHEDULED_RANGE_YEARS, 0, 1);
  const end = new Date(today.getFullYear() + UNSCHEDULED_RANGE_YEARS, 11, 31);
  return {
    start_date: format(start, "yyyy-MM-dd"),
    end_date: format(end, "yyyy-MM-dd"),
  };
}

export function useCalendarUnscheduledRecords({
  enabled = true,
}: UnscheduledArgs = {}) {
  const { orgId: organizationId } = useRouteIds();

  const range = useMemo(buildRange, []);

  const query = useQuery({
    queryKey: [
      QUERY_KEYS.CALENDAR_UNSCHEDULED,
      organizationId,
      range.start_date,
      range.end_date,
    ] as const,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return SchedulingService.getItems(organizationId, {
        ...range,
        has_scheduled: false,
      });
    },
    enabled: enabled && !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  const items = useMemo<CalendarItem[]>(() => {
    if (!query.data) return [];
    return query.data
      .map((item) =>
        mapSchedulingItemToCalendarItem(item, { allowEmptyDates: true })
      )
      .filter((i): i is CalendarItem => i !== null);
  }, [query.data]);

  return { ...query, items };
}
