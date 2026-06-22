import { JobType, SortOrder } from "@/constants/enums";

import type { OrganizationLeadStatusSetting } from "./settings";

export { JobType, SortOrder };

// ============================================
// PAGINATION
// ============================================

export interface PaginatedResponse<T> {
  results: T[];
  total_count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
  page_size: number;
}

export interface PaginatedResponseAlt<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    timestamp?: string;
    details?: Record<string, string[]>;
  };
}

// ============================================
// COMMON PARAMS
// ============================================

export interface BaseListParams {
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: SortOrder;
}

// ============================================
// SHARED ENTITIES
// ============================================

export interface Vertex {
  lat: number;
  lng: number;
}

export interface Author {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string | null;
}

// ============================================
// ORGANIZATION MEMBER
// ============================================

export interface OrganizationMemberRole {
  id: number;
  name: string;
  is_admin: boolean;
  is_default: boolean;
  organization: number | null;
}

export interface OrganizationMember {
  id?: number;
  user: {
    email: string;
    id?: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  role_fk?: OrganizationMemberRole;
  role_id?: number;
  owner?: boolean;
}

// ============================================
// STATUS TYPES
// ============================================

export interface Status {
  id: number;
  title: string;
  color: string;
}

// Re-export JobStatus and LeadStatus as aliases for clarity
export type JobStatus = Status;
export type LeadStatus = Status;

/**
 * Job workflow status row from organization job-status settings
 * (`job_type` identifies tiling / excavation / repair, e.g. `"T"` or enum values).
 */
export interface OrganizationJobStatus extends Status {
  job_type: JobType | "T" | "E" | "R";
  order: number;
  is_default: boolean;
  editable: boolean;
  type?: string;
}

/** Job or lead status option in entity detail dropdowns. */
export type EntityStatusOption =
  | OrganizationJobStatus
  | OrganizationLeadStatusSetting
  | (Status & {
      is_default?: boolean;
      editable?: boolean;
      order?: number;
      job_type?: string;
    });

// ============================================
// SHARED MUTATION ARG HELPERS
// ============================================

/** Primary key from a backend entity serializer (`id: number`). */
export type IdOf<T extends { id: number }> = Pick<T, "id">["id"];

/** `id` field when the backend allows non-numeric keys (e.g. composite log ids). */
export type EntityIdField<T extends { id: unknown }> = Pick<T, "id">["id"];

export interface IdUpdatePayload<
  TPayload,
  TEntity extends { id: number } = { id: number },
> {
  id: IdOf<TEntity>;
  data: TPayload;
}

export type IdNumberUpdatePayload<
  TPayload,
  TEntity extends { id: number } = { id: number },
> = IdUpdatePayload<TPayload, TEntity>;

export interface RoleIdUpdatePayload<
  TPayload,
  TRole extends { id: number } = { id: number },
> {
  roleId: IdOf<TRole>;
  payload: TPayload;
}

export interface CrewGroupIdUpdatePayload<
  TPayload,
  TCrewGroup extends { id: number } = { id: number },
> {
  crewGroupId: IdOf<TCrewGroup>;
  data: TPayload;
}

// ============================================
// OBJECT TYPES
// ============================================

export type ObjectType = JobType;
