import { SortOrder, WallType } from "@/constants";

import type { IdOf } from "./common";
import type { JobId } from "./jobs";

// ---------------------------------------------------------------------------
// Query / request param types
// ---------------------------------------------------------------------------

/** Prefixes for `FilterType.FOOTAGE_CREW` values so member vs group IDs never collide. */
export const FOOTAGE_CREW_FILTER_GROUP_PREFIX = "crew_group:" as const;
export const FOOTAGE_CREW_FILTER_MEMBER_PREFIX = "crew_member:" as const;

/** Alias used by footage page sort UI (`asc` / `desc`). */
export type FootageSortOrder = SortOrder;

export interface FootageAllJobsParams {
  includeArchived?: boolean;
  /** Calendar year; omitted = all years */
  year?: number;
  /** Calendar month 1–12; used together with year */
  month?: number;
  /** Individual crew assignment member ids (`crew_member` query param). */
  crewMembers?: number[];
  /** Crew group ids (`crew_group` query param). */
  crewGroups?: number[];
  /** Backend `sort_order`: `desc` = newest first, `asc` = oldest first (field TBD server-side). */
  sortOrder?: SortOrder;
}

export interface AddDailyProgressLateralBody {
  date: string;
  footage: string;
}

export interface AddDailyProgressMainBody {
  date: string;
  footage: number;
  size?: string;
  pipe_wall_type?: WallType;
}

export interface AddDailyProgressRaisersBody {
  date: string;
  quantity: number;
}

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

export interface FootageContactInfo {
  id: number;
  full_name: string;
}

/** One row from GET .../footage-page/all_jobs/ */
export interface FootageAllJobsApiRow {
  /** Backend field (lowercase "s" in "status") */
  "Job status"?: string;
  "Job Title": string;
  Job_id: number;
  "Total Installed Footage": number;
  "Total Installed Lateral Footage": number;
  "Total Installed Main Footage": number;
  "Total Installed Dual Wall Main Footage"?: number;
  "First Recorded Date": string | null;
  "Last Updated": string | null;
  is_completed: boolean;
  is_cancelled: boolean;
  /** Legacy per-size columns; modern payloads may use only single_wall / dual_wall. */
  "4"?: number;
  "5"?: number;
  "6"?: number;
  "8"?: number;
  "10"?: number;
  "12"?: number;
  "15"?: number;
  "18"?: number;
  "24"?: number;
  "30"?: number;
  "36"?: number;
  "42"?: number;
  "54"?: number;
  "60"?: number;
  comment: string | null;
  "content-type": string;
  single_wall?: Record<string, number>;
  dual_wall?: Record<string, number>;
  contact_info?: FootageContactInfo | null;
  /** Comma-separated crew names */
  crew?: string;
  /** Structured assigned crews */
  crews?: { id?: number; name?: string }[];
}

/** GET .../footage-page/{jobId}/ — detailed stats for one job */
export interface FootageJobData {
  "Customer Name": string;
  "First Recorded Date": string | null;
  "Last Updated": string | null;
  "Total Installed Footage": number;
  "Total Installed Lateral Footage": number;
  "Total Installed Main Footage": number;
  "Total Installed Dual Wall Main Footage": number;
  "Total Installed Raisers": number;
  "Job Status": string;
  contact_info: FootageContactInfo | null;
  single_wall: Record<string, number>;
  dual_wall: Record<string, number>;
}

/** GET .../daily-progress/{jobId}/excel/ */
export interface FootageExcelData {
  Lateral_Progress?: Array<Array<string | number>>;
  "Lateral Progress"?: Array<Array<string | number>>;
  Main_Progress?: Array<Array<string | number>>;
  "Main Progress"?: Array<Array<string | number>>;
  Raisers_Progress?: Array<Array<string | number>>;
  "Raisers Progress"?: Array<Array<string | number>>;
}

/** Comment record returned by the generic comments endpoint */
export interface FootageComment {
  id: number;
  object_id: number | string;
  text?: string;
}

/** GET .../footage-page/all/ — organisation-wide totals (AllFootageAPIView) */
export interface FootageOrganizationTotals {
  "Total Installed Footage": number;
  "Total Installed Lateral Footage": number;
  "Total Installed Main Footage": number;
  "Total Installed Dual Wall Main Footage": number;
  "Total Installed Raisers": number;
  single_wall: Record<string, number>;
  dual_wall: Record<string, number>;
}

/** Nested member on daily-progress create responses (MemberSerializer — shape varies) */
export type FootageDailyProgressCreatedBy = Record<string, unknown>;

/** POST .../daily-progress/{jobId}/lateral/ — ModelViewSet create body */
export interface FootageDailyProgressLateralResponse {
  id: number;
  job: number;
  date: string;
  footage: number;
  created_by?: FootageDailyProgressCreatedBy;
}

/** POST .../daily-progress/{jobId}/main/ */
export interface FootageDailyProgressMainResponse {
  id: number;
  job: number;
  date: string;
  footage: number;
  size: string;
  pipe_wall_type: string;
  created_by?: FootageDailyProgressCreatedBy;
}

/** POST .../daily-progress/{jobId}/raisers/ */
export interface FootageDailyProgressRaisersResponse {
  id: number;
  job: number;
  date: string;
  quantity: number;
  created_by?: FootageDailyProgressCreatedBy;
}

/** POST/PATCH .../comments/ — CommentSerializer subset (footage page uses FormData flow). */
export interface FootageCommentMutationResponse {
  id: number;
  text: string;
  object_id: number;
  content_type: number;
  created_at: string;
  comment_flag: string;
  sharing_comment: boolean;
  member: Record<string, unknown>;
  /** Generic FK representation; may be empty object at runtime */
  content_object: Record<string, unknown>;
  mentioned_members: number[];
}

// ---------------------------------------------------------------------------
// Installed-footage UI (formatted table + filters; not the wire contract)
// ---------------------------------------------------------------------------

/** Filter mode used by the footage-page filter panel */
export type FootageDateFilterMode = "month" | "year";

/** Table row shape for the installed footage page (formatted from API data) */
export interface FormattedFootageData {
  id: number;
  name: string;
  job_id: number;
  first_recorded: string;
  last_updated: string;
  total_lateral_footage: string;
  total_main_footage: string;
  job_status: string;
  excel_sheet: boolean;
  note: string;
  content_type: string;
  "4": number;
  "5": number;
  "6": number;
  "8": number;
  "10": number;
  "12": number;
  "15": number;
  "18": number;
  "24": number;
  "30": number;
  "36": number;
  "42": number;
  "54": number;
  "60": number;
  single_wall: Record<string, number>;
  dual_wall: Record<string, number>;
  crew_display: string;
  first_recorded_ms: number;
  last_updated_ms: number;
  is_completed: boolean;
  is_cancelled: boolean;
}

// ---------------------------------------------------------------------------
// Footage mutation args
// ---------------------------------------------------------------------------

export interface FootageJobIdArgs {
  jobId: JobId;
}

export interface FootageDailyProgressLateralArgs {
  jobId: JobId;
  data: AddDailyProgressLateralBody;
}

export interface FootageDailyProgressMainArgs {
  jobId: JobId;
  data: AddDailyProgressMainBody;
}

export interface FootageDailyProgressRaisersArgs {
  jobId: JobId;
  data: AddDailyProgressRaisersBody;
}

export interface FootageCommentCreateArgs {
  jobId: JobId;
  text: string;
  model: string;
}

export interface FootageCommentListArgs {
  jobId: JobId;
  model: string;
}

export interface FootageCommentUpdateArgs {
  jobId: JobId;
  commentId: IdOf<FootageComment>;
  text: string;
  model: string;
}
