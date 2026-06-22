import type { SchedulingCalendarStatus } from "@/api/types";
import { JobLeadEntityType, ResourceType } from "@/constants";

import type { CalendarItemCategory } from "./calendarCategories";

/**
 * Canonical enum lists — single source of truth for both the typed union and
 * the runtime values. Adding a new kind/status/category? Edit the array and
 * TypeScript will surface every site that needs to handle the new variant.
 */
export const CALENDAR_ITEM_KINDS = [
  ResourceType.JOB,
  ResourceType.LEAD,
] as const;
export type CalendarItemKind = (typeof CALENDAR_ITEM_KINDS)[number];

export {
  CALENDAR_CATEGORY_LABELS,
  CALENDAR_ITEM_CATEGORIES,
  CalendarItemCategoryValue,
} from "./calendarCategories";
export type { CalendarItemCategory };

export const CALENDAR_BAR_STATUSES = [
  "overdue",
  "inprogress",
  "completed",
  "lead",
  "not_started",
] as const;
export type CalendarBarStatus = (typeof CALENDAR_BAR_STATUSES)[number];

export const CALENDAR_TAB_COUNTER_VALUES = [
  JobLeadEntityType.LEADS,
  JobLeadEntityType.JOBS,
] as const;
export type CalendarTabCounterValue = JobLeadEntityType;

export const CALENDAR_WORKFLOW_TONES = [
  "blue",
  "blue-dark",
  "amber",
  "amber-dark",
  "green",
] as const;

/** Tab/counter totals mapped from `SchedulingStatisticsResponse`. */
export interface CalendarStatsCounts {
  missingSchedules: number;
  inProgress: number;
  completed: number;
  overdue: number;
  notStarted: number;
  leads: number;
}

/**
 * Workflow status pill colors. Maps to specific Figma swatches:
 * - `blue`        — #2c80ff (e.g. Inproduction)
 * - `blue-dark`   — #155dfc (e.g. Design Inprogress)
 * - `amber`       — #fe9a00 (e.g. Inprogress)
 * - `amber-dark`  — #e17100 (e.g. In progress - Installation)
 * - `green`       — #008236 (e.g. Completed)
 */
export type CalendarWorkflowTone = (typeof CALENDAR_WORKFLOW_TONES)[number];

export interface CalendarItemProjectType {
  id: number;
  name: string;
  color: string;
}

export interface CalendarWorkflowStatus {
  label: string;
  tone: CalendarWorkflowTone;
  color?: string;
}

export interface CalendarItem {
  id: number;
  kind: CalendarItemKind;
  title: string;
  location: string;
  /** Client / company associated with the item — surfaced in the details popover. */
  client?: string;
  /** Farm name when the item is linked to a farm. Falls through `location` if address fallback was used. */
  farmName?: string;
  category: CalendarItemCategory;
  pattern?: string;
  /** Project type when provided by scheduling API (jobs and leads). */
  projectType?: CalendarItemProjectType;
  /** Lead source title (leads only). */
  leadSource?: string;
  /** ISO `yyyy-MM-dd` or full datetime `yyyy-MM-ddTHH:mm:ss` (time shifts bar within day). */
  startDate: string;
  /** ISO `yyyy-MM-dd` or full datetime `yyyy-MM-ddTHH:mm:ss` (time shifts bar within day). */
  endDate: string;
  extraDays?: number;
  /** Workflow status pill on the left card. */
  workflowStatus: CalendarWorkflowStatus;
  /** Timeline bar color/label (overdue/inprogress/completed). */
  barStatus: CalendarBarStatus;
  /** Mirrors `SchedulingItem.calendar_status` when mapped from API. */
  calendarStatus?: SchedulingCalendarStatus;
  isCompleted?: boolean;
  isCancelled?: boolean;
}
