import {
  JobLeadTypeRouteSegment,
  JobLeadTypeSegment,
  JobOrLeadType,
  jobOrLeadTypeToJobLeadTypeSegment,
  toJobLeadTypeRouteSegment,
} from "@/constants";

/** Calendar UI category slugs (filters, permissions, bar styling). */
export const CalendarItemCategoryValue = {
  TILE: "tile",
  EXCAVATION: "excavation",
  REPAIR: "repair",
} as const;

export const CALENDAR_ITEM_CATEGORIES = [
  CalendarItemCategoryValue.TILE,
  CalendarItemCategoryValue.EXCAVATION,
  CalendarItemCategoryValue.REPAIR,
] as const;

export type CalendarItemCategory = (typeof CALENDAR_ITEM_CATEGORIES)[number];

export const CALENDAR_CATEGORY_LABELS: Record<CalendarItemCategory, string> = {
  [CalendarItemCategoryValue.TILE]: "Tile",
  [CalendarItemCategoryValue.EXCAVATION]: "Excavation",
  [CalendarItemCategoryValue.REPAIR]: "Repair",
};

/** Scheduling `type` code (`T` / `E` / `R`) → calendar UI category. */
export const JOB_OR_LEAD_TYPE_TO_CALENDAR_CATEGORY: Record<
  JobOrLeadType,
  CalendarItemCategory
> = {
  [JobOrLeadType.TILING]: CalendarItemCategoryValue.TILE,
  [JobOrLeadType.EXCAVATION]: CalendarItemCategoryValue.EXCAVATION,
  [JobOrLeadType.REPAIR]: CalendarItemCategoryValue.REPAIR,
};

export const CALENDAR_CATEGORY_TO_JOB_OR_LEAD_TYPE: Record<
  CalendarItemCategory,
  JobOrLeadType
> = {
  [CalendarItemCategoryValue.TILE]: JobOrLeadType.TILING,
  [CalendarItemCategoryValue.EXCAVATION]: JobOrLeadType.EXCAVATION,
  [CalendarItemCategoryValue.REPAIR]: JobOrLeadType.REPAIR,
};

/** Calendar filter category (`tile`) → scheduling/API segment (`tiling`). */
export const CALENDAR_CATEGORY_TO_JOB_LEAD_SEGMENT: Record<
  CalendarItemCategory,
  JobLeadTypeSegment
> = {
  [CalendarItemCategoryValue.TILE]: jobOrLeadTypeToJobLeadTypeSegment(
    JobOrLeadType.TILING
  ),
  [CalendarItemCategoryValue.EXCAVATION]: jobOrLeadTypeToJobLeadTypeSegment(
    JobOrLeadType.EXCAVATION
  ),
  [CalendarItemCategoryValue.REPAIR]: jobOrLeadTypeToJobLeadTypeSegment(
    JobOrLeadType.REPAIR
  ),
};

export function calendarCategoryFromJobOrLeadType(
  type: JobOrLeadType
): CalendarItemCategory {
  return JOB_OR_LEAD_TYPE_TO_CALENDAR_CATEGORY[type];
}

export function jobOrLeadTypeFromCalendarCategory(
  category: CalendarItemCategory
): JobOrLeadType {
  return CALENDAR_CATEGORY_TO_JOB_OR_LEAD_TYPE[category];
}

export function jobLeadSegmentFromCalendarCategory(
  category: CalendarItemCategory
): JobLeadTypeSegment {
  return CALENDAR_CATEGORY_TO_JOB_LEAD_SEGMENT[category];
}

export function calendarCategoryToRouteSegment(
  category: CalendarItemCategory
): JobLeadTypeRouteSegment {
  return toJobLeadTypeRouteSegment(
    jobLeadSegmentFromCalendarCategory(category)
  );
}
