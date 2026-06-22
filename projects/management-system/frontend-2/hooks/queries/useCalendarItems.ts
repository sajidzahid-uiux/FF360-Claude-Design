import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { endOfMonth, endOfWeek, format, startOfMonth } from "date-fns";

import { SchedulingService } from "@/api/services";
import type { SchedulingItemsListParams } from "@/api/types";
import {
  CACHE_TIME,
  JOB_LEAD_TYPE_SEGMENTS_ALL,
  QUERY_KEYS,
  ResourceType,
} from "@/constants";
import {
  CALENDAR_CATEGORY_TO_JOB_LEAD_SEGMENT,
  type CalendarItem,
  type CalendarItemCategory,
  getWeekStart,
  mapSchedulingItemToCalendarItem,
} from "@/entities/calendar-item";
import type { CalendarFiltersState } from "@/features/calendar-filter";
import type { CalendarTimelineScale } from "@/features/calendar-view-switch";

import { useRouteIds } from "../useRouteIds";

interface CalendarItemsQueryArgs {
  scale: CalendarTimelineScale;
  activeDate: Date;
  filters: CalendarFiltersState;
  /** When true, fetch unscheduled items (start_date/end_date null) in the same date range. */
  hasScheduled?: boolean;
}

function toIdList(values: string[]): number[] | undefined {
  if (values.length === 0) return undefined;
  const numeric = values.map(Number).filter((n) => Number.isFinite(n));
  return numeric.length > 0 ? numeric : undefined;
}

function buildSchedulingParams(
  startDate: string,
  endDate: string,
  filters: CalendarFiltersState,
  hasScheduled: boolean,
  scale: CalendarTimelineScale
): SchedulingItemsListParams {
  const showJobs =
    filters.kind.length === 0 || filters.kind.includes(ResourceType.JOB);
  const showLeads =
    filters.kind.length === 0 || filters.kind.includes(ResourceType.LEAD);
  const onlyJobs =
    filters.kind.length === 1 && filters.kind[0] === ResourceType.JOB;
  const onlyLeads =
    filters.kind.length === 1 && filters.kind[0] === ResourceType.LEAD;
  const hasCategoryFilter = filters.category.length > 0;

  const selectedCategories = hasCategoryFilter
    ? filters.category.flatMap((c) => {
        if (!(c in CALENDAR_CATEGORY_TO_JOB_LEAD_SEGMENT)) return [];
        return [
          CALENDAR_CATEGORY_TO_JOB_LEAD_SEGMENT[c as CalendarItemCategory],
        ];
      })
    : [...JOB_LEAD_TYPE_SEGMENTS_ALL];

  const params: SchedulingItemsListParams = {
    start_date: startDate,
    end_date: endDate,
    has_scheduled: hasScheduled,
    view_type: scale === "week" ? "weekly" : "monthly",
  };

  if (showJobs && (hasCategoryFilter || onlyJobs)) {
    params.job_types = selectedCategories;
  }
  if (showLeads && (hasCategoryFilter || onlyLeads)) {
    params.lead_types = selectedCategories;
  }

  const jobStatuses = toIdList(filters.jobStatus);
  if (jobStatuses) params.job_statuses = jobStatuses;

  const leadStatuses = toIdList(filters.leadStatus);
  if (leadStatuses) params.lead_statuses = leadStatuses;

  const leadSources = toIdList(filters.leadSource);
  if (leadSources) params.lead_sources = leadSources;

  const projectTypes = toIdList(filters.projectType);
  if (projectTypes) params.project_types = projectTypes;

  return params;
}

function rangeForScale(
  scale: CalendarTimelineScale,
  activeDate: Date
): { start: string; end: string } {
  if (scale === "week") {
    const weekStart = getWeekStart(activeDate);
    return {
      start: format(weekStart, "yyyy-MM-dd"),
      end: format(endOfWeek(weekStart, { weekStartsOn: 0 }), "yyyy-MM-dd"),
    };
  }
  return {
    start: format(startOfMonth(activeDate), "yyyy-MM-dd"),
    end: format(endOfMonth(activeDate), "yyyy-MM-dd"),
  };
}

export function useCalendarItems({
  scale,
  activeDate,
  filters,
  hasScheduled = true,
}: CalendarItemsQueryArgs) {
  const { orgId: organizationId } = useRouteIds();

  const { start, end } = useMemo(
    () => rangeForScale(scale, activeDate),
    [scale, activeDate]
  );

  const params = useMemo(
    () => buildSchedulingParams(start, end, filters, hasScheduled, scale),
    [start, end, filters, hasScheduled, scale]
  );

  const query = useQuery({
    queryKey: [
      QUERY_KEYS.CALENDAR_ITEMS,
      organizationId,
      params.start_date,
      params.end_date,
      params.has_scheduled,
      params.view_type,
      params.job_types?.join(",") ?? "",
      params.lead_types?.join(",") ?? "",
      params.job_statuses?.join(",") ?? "",
      params.lead_statuses?.join(",") ?? "",
      params.lead_sources?.join(",") ?? "",
      params.project_types?.join(",") ?? "",
    ] as const,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return SchedulingService.getItems(organizationId, params);
    },
    enabled: !!organizationId,
    placeholderData: (prev) => prev,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  const items = useMemo<CalendarItem[]>(() => {
    if (!query.data) return [];
    return query.data
      .map((item) => mapSchedulingItemToCalendarItem(item))
      .filter((i): i is CalendarItem => i !== null);
  }, [query.data]);

  return { ...query, items };
}
