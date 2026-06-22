import type { JobOrLeadType, ResourceType } from "@/constants/enums";

import type { IdOf } from "./common";
import type { ProjectType } from "./projectTypes";

/**
 * Polymorphic item returned by `/ms/organizations/{org}/scheduling/items/`.
 * Backend serializer: `SchedulingItemSerializer`.
 */
export type SchedulingItemEntityType = ResourceType;

/** Job/lead category code on the unified scheduling endpoint (`JobOrLeadType`). */
export type SchedulingItemTypeCode = JobOrLeadType;

/**
 * Server-computed status used to drive bar color and pill tone on the calendar.
 * Stable enum (does not depend on the org's free-text Status.title).
 */
export type SchedulingCalendarStatus =
  | "in_progress"
  | "overdue"
  | "completed"
  | "not_started"
  | "lead";

export interface SchedulingItemContactInfo {
  id: number;
  full_name: string;
  phone_number?: string | null;
  home_phone_number?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface SchedulingItemStatus {
  id: number;
  title: string;
  color: string;
}

export interface SchedulingItem {
  id: number;
  entity_type: SchedulingItemEntityType;
  type: SchedulingItemTypeCode | null;
  title: string;
  start_date: string | null;
  end_date: string | null;
  extra_days: number | null;
  project_type: ProjectType | null;
  status: SchedulingItemStatus | null;
  contact_info: SchedulingItemContactInfo | null;
  farm_name: string | null;
  farm_id: number | null;
  lead_source: string | null;
  url: string;
  is_completed: boolean;
  is_cancelled: boolean;
  is_archived: boolean;
  calendar_status: SchedulingCalendarStatus;
}

export interface SchedulingItemsListParams {
  /** Required. YYYY-MM-DD. */
  start_date: string;
  /** Required. YYYY-MM-DD. */
  end_date: string;
  view_type?: "monthly" | "weekly";
  /** When false, returns items with NULL start_date or end_date. Default true. */
  has_scheduled?: boolean;
  /** Comma-joined backend job-type slugs: tiling, excavation, repair. */
  job_types?: string[];
  /** Comma-joined Status IDs (jobs). */
  job_statuses?: number[];
  /** Comma-joined backend lead-type slugs. */
  lead_types?: string[];
  /** Comma-joined LeadStatus IDs. */
  lead_statuses?: number[];
  /** Comma-joined LeadTypes (source) IDs. */
  lead_sources?: number[];
  /** Comma-joined ProjectType IDs. */
  project_types?: number[];
  page?: number;
  page_size?: number;
}

/**
 * Without `page` / `page_size` the endpoint returns a bare array. With either,
 * it returns a paginated envelope. Calendar list is fetched without paging so
 * the whole month/week renders in one pass.
 */
export type SchedulingItemsListResponse = SchedulingItem[];

export interface SchedulingStatisticsResponse {
  jobs_without_schedule: number;
  leads_without_schedule: number;
  total_overdue: number;
  total_in_progress: number;
  total_completed: number;
  total_not_started: number;
  total_leads: number;
}

export interface SchedulingItemPatchPayload {
  start_date?: string | null;
  end_date?: string | null;
  extra_days?: number;
}

export interface SchedulingItemUpdateArgs {
  itemId: IdOf<SchedulingItem>;
  entityType: SchedulingItemEntityType;
  payload: SchedulingItemPatchPayload;
}
