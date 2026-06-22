import type { SchedulingCalendarStatus, SchedulingItem } from "@/api/types";
import { ResourceType } from "@/constants";

import type {
  CalendarBarStatus,
  CalendarItem,
  CalendarWorkflowTone,
} from "../model/types";
import { calendarCategoryFromJobOrLeadType } from "./jobLeadTypeMapping";

/**
 * `calendar_status` is server-computed and stable; tone is derived from it
 * rather than from the org's free-form `status.color`. See
 * `CALENDAR_BACKEND_GAPS.md` (gap 4) for the rationale.
 */
const CALENDAR_STATUS_TO_TONE: Record<
  SchedulingCalendarStatus,
  CalendarWorkflowTone
> = {
  in_progress: "blue",
  not_started: "blue-dark",
  overdue: "amber-dark",
  lead: "amber",
  completed: "green",
};

const CALENDAR_STATUS_TO_BAR: Record<
  SchedulingCalendarStatus,
  CalendarBarStatus
> = {
  in_progress: "inprogress",
  not_started: "not_started",
  overdue: "overdue",
  lead: "lead",
  completed: "completed",
};

interface MapSchedulingItemOptions {
  allowEmptyDates?: boolean;
}

export function mapSchedulingItemToCalendarItem(
  item: SchedulingItem,
  options: MapSchedulingItemOptions = {}
): CalendarItem | null {
  const { allowEmptyDates = false } = options;
  if (!allowEmptyDates && (!item.start_date || !item.end_date)) return null;

  // No type code = no category mapping. Drop the item rather than render it
  // as Drainage Tiling (the previous silent default), which would also point
  // its details link at the wrong route.
  if (!item.type) return null;
  const category = calendarCategoryFromJobOrLeadType(item.type);

  const farmName = item.farm_name?.trim() || undefined;
  const location = farmName || item.contact_info?.address?.trim() || "";

  const client = item.contact_info?.full_name?.trim() || undefined;

  const tone = CALENDAR_STATUS_TO_TONE[item.calendar_status] ?? "blue";
  const barStatus =
    CALENDAR_STATUS_TO_BAR[item.calendar_status] ?? "inprogress";
  const label = item.status?.title?.trim() || "No Status";
  const color = item.status?.color?.trim() || undefined;

  const projectType = item.project_type
    ? {
        id: item.project_type.id,
        name: item.project_type.name.trim(),
        color: item.project_type.color,
      }
    : undefined;

  const leadSource =
    item.entity_type === ResourceType.LEAD
      ? item.lead_source?.trim() || undefined
      : undefined;

  return {
    id: item.id,
    kind: item.entity_type,
    title: item.title,
    location,
    client,
    farmName,
    calendarStatus: item.calendar_status,
    category,
    projectType,
    leadSource,
    startDate: item.start_date ?? "",
    endDate: item.end_date ?? "",
    extraDays: item.extra_days ?? undefined,
    workflowStatus: { label, tone, color },
    barStatus,
    isCompleted: item.is_completed,
    isCancelled: item.is_cancelled,
  };
}
