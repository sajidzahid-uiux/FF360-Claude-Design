import { JobType } from "@/constants/enums";

import type {
  BaseListParams,
  IdOf,
  JobStatus,
  ObjectType,
  PaginatedResponse,
  Vertex,
} from "./common";
import type { ContactSubtype } from "./contacts";
import type { NotesTabAccess } from "./notes";

// ============================================
// SHARED JOB ENTITIES
// ============================================

export interface ContactInfo {
  id: number;
  full_name: string;
  phone_number: string;
  /** Present on several list/detail payloads alongside `phone_number`. */
  home_phone_number?: string;
  email: string;
  address?: string;
  contact_subtype?: ContactSubtype;
  /** Farm Management parent names when this contact is a sub-contact. */
  farm_management_names?: string[];
  /** Farm Management parent contacts when names are not denormalized. */
  farm_management_contacts?: Array<{
    id?: number;
    full_name?: string;
    phone_number?: string;
  }>;
  /** Sub-contact names when this contact is Farm Management (when provided by list API). */
  sub_contact_names?: string[];
}

/** Minimal contact fields for badges, breadcrumbs, and nested entity display. */
export type ContactSummary = Pick<
  ContactInfo,
  | "id"
  | "full_name"
  | "phone_number"
  | "home_phone_number"
  | "contact_subtype"
  | "farm_management_names"
>;

export type ContactSummaryPartial = Partial<
  Pick<
    ContactInfo,
    | "id"
    | "full_name"
    | "phone_number"
    | "home_phone_number"
    | "contact_subtype"
  >
> & {
  phone_number?: string | null;
  home_phone_number?: string | null;
};

export interface Equipment {
  id: number;
  name: string;
}

export interface JobEstimate {
  id: number;
  estimate_number: string;
}

export interface EquipmentAssignment {
  id: number;
  equipment: number;
  total_hours: number;
}

export interface Member {
  id: number;
  user: {
    username: string;
    email: string;
  };
}

export interface OperatorInfo {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: string;
}

// ============================================
// STAKEHOLDERS (multi-client / multi-farm)
// ============================================

export interface StakeholderContact {
  id: number;
  full_name: string;
  is_primary: boolean;
  phone_number?: string;
  farm_management_names?: string[];
}

export interface StakeholderFarm {
  id: number;
  name: string;
  contact_id: number;
  is_primary: boolean;
  acreage?: number | string;
  longitude?: number | null;
  latitude?: number | null;
  vertices?: Vertex[] | null;
}

export interface StakeholderPayloadFields {
  contact_ids?: number[];
  farm_ids?: number[];
  primary_contact_id?: number | null;
  primary_farm_id?: number | null;
  contact?: number;
  farm?: number;
}

export interface StakeholderPrimaryUpdatePayload {
  primary_contact_id?: number | null;
  primary_farm_id?: number | null;
}

/** PUT/PATCH body for `jobEquipment/{id}/` hour logging (on-site). */
export interface JobEquipmentHoursUpdatePayload {
  start: number;
  end: number;
  equipment: number;
  /** Omit or null for job-level hours; set when logging against a linked farm. */
  farm_id?: number | null;
}

export interface EquipmentHoursFarmBreakdown {
  farm_id: number;
  farm_name: string;
  hours: number;
}

export interface EquipmentHoursBreakdown {
  job_id: number;
  job_level_hours: number;
  farm_hours: EquipmentHoursFarmBreakdown[];
}

// ============================================
// JOB ENTITY
// ============================================

export interface Job {
  id: number;
  title: string;
  description: string;
  po_number: string;
  customer_phone_number: string;
  object_type: ObjectType;
  job_status: JobStatus;
  latitude?: number;
  longitude?: number;
  vertices?: Vertex[];
  progress_bar: number | string;
  on_hold: boolean;
  archived?: boolean;
  job_object_subclass?: string;
  cancelled: boolean;
  created_at: string;
  last_updated: string;
  last_updated_by: string;
  update_by_username: string;
  contact_info: ContactInfo;
  equipments?: EquipmentAssignment[];
  designers?: Member[];
  crew?: Member[];
  acers?: number;
  /** Tiling only: acres specific to this job; separate from farm acreage. */
  job_lead_acre?: number | null;
  ditch?: string;
  outlets?: string[];
  form?: string;
  one_call?: string;
  depth?: number;
  width?: number;
  length?: number;
  converted_from_lead?: boolean;
  job_footage?: number | null;
  raisers_installed?: number | null;

  // Production Tracking - Scheduling
  start_date?: string | null;
  end_date?: string | null;
  extra_days?: number | null;
  total_days?: number | null;

  // Production Tracking - Operator (Repair & Excavation)
  operator?: number | null;
  operator_info?: OperatorInfo | null;

  // Production Tracking - Project Status (Tiling)
  comp_cam_project?: boolean;
  locate_completed?: boolean;
  topo?: string | null;
  topo_completed?: boolean;
  locate_expire_date?: string | null;

  // Production Tracking - Metrics (Tiling, Read-Only)
  main_footage_ran?: number | null;
  lateral_footage_ran?: number | null;
  target_feet_per_day?: number | null;
  remained_raisers_installed?: number | null;

  material_status?: string | null;

  // Estimate Fields
  estimate_number?: string | number | null;

  // Payment Status (Tile only)
  payment_status?: number | null;

  canAccessOnSiteTracking?: boolean;

  notesTabAccess?: NotesTabAccess;

  // Farm Information
  farm_name?: string;
  farm_id?: number;

  /** Multi-client / multi-farm (detail endpoints) */
  contacts_count?: number;
  farms_count?: number;
  contacts?: StakeholderContact[];
  farms?: StakeholderFarm[];

  // Project type (for crew group auto-assignment)
  project_type?: number | null;
}

// ============================================
// JOB PAYLOADS
// ============================================

export interface JobCreatePayload {
  description?: string;
  job_status: number;
  equipments?: Array<{ equipment: number }>;
  designers?: number[];
  crew?: number[];
  acers?: number;
  job_lead_acre?: number | null;
  ditch?: string;
  outlets?: string[];
  form?: string;
  one_call?: string;
  contact?: number;
  farm?: number;
  contact_ids?: number[];
  farm_ids?: number[];
  primary_contact_id?: number | null;
  primary_farm_id?: number | null;
  depth?: number;
  width?: number;
  length?: number;
  job_footage?: number | null;
  raisers_installed?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  extra_days?: number | null;
  operator?: number | null;
  comp_cam_project?: boolean;
  locate_completed?: boolean;
  topo_completed?: boolean;
  locate_expire_date?: string | null;
  material_status?: string | null;
  project_type?: number | null;
}

export interface JobFarmInfoUpdatePayload {
  id?: number;
  name?: string;
  acreage?: number | string;
  vertices?: Vertex[] | unknown;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export interface JobUpdatePayload extends Omit<
  Partial<JobCreatePayload>,
  "one_call"
> {
  title?: string;
  customer_phone_number?: string;
  job_status?: number;
  cancelled?: boolean;
  on_hold?: boolean;
  estimate_sent?: boolean;
  contract_sent?: boolean;
  one_call?: string | boolean;
  farm_info?: JobFarmInfoUpdatePayload;
  estimate_number?: string | number | null;
  material_status?: string | null;
}

export interface JobMapUpdatePayload {
  xmlmap?: File | null;
  shpmap?: File | null;
  kmlmap?: File | null;
  xmlmap_v2?: File[];
  shpmap_v2?: File[];
  kmlmap_v2?: File[];
}

export interface JobListParams extends BaseListParams {
  job_type?: string | string[];
  job_status?: string;
  trashed?: boolean;
  archived?: boolean;
  on_hold?: boolean;
  not_coordination?: boolean;
  exclude_completed?: boolean;
  exclude_cancelled?: boolean;
  from_date?: string;
  to_date?: string;
  /** me | all | member id — also applied via useJobAssignedToFilter when omitted */
  assigned_to?: string;
  persist_save?: boolean;
  /** Filter jobs linked to sub-contacts of this Farm Management contact. */
  farm_management_id?: number;
}

// ============================================
// JOB RESPONSES
// ============================================

export interface JobResponse {
  success: boolean;
  data: Job | Job[];
  message?: string;
  timestamp?: string;
}

export type PaginatedJobResponse = PaginatedResponse<Job>;

/**
 * Item from GET .../invoices/jobs_active_invoices/?job_id=
 * Full payload varies by backend; UI uses `paid`, `id`, and dynamic patch fields.
 */
export interface JobActiveInvoice {
  id?: number;
  paid?: boolean;
  checked_by_admin?: boolean;
  sent_to_client?: boolean;
}

// ============================================
// CORE POINTS
// ============================================

export interface CorePoint {
  id: number;
  organization: number;
  job: number | null;
  lead: number | null;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export type CorePointSummary = Pick<
  CorePoint,
  "id" | "name" | "description" | "latitude" | "longitude"
>;

export interface CorePointCreatePayload {
  name?: string;
  description?: string;
  latitude: number;
  longitude: number;
}

export interface CorePointUpdatePayload {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface CorePointListParams {
  search?: string;
  page?: number;
  page_size?: number;
}

// ============================================
// JOB FINANCIALS
// ============================================

export interface FinancialMachineAssignment {
  id: number;
  job: number;
  job_equipment: number;
  machine_name: string;
  budget_hours?: string | null;
  machine_rate?: string | null;
  machine_labor_cost_per_hour?: string | null;
  actual_hours?: string | number;
  budget_hours_cost?: string | null;
  actual_hours_cost?: string | null;
  budget_total_cost?: string | null;
  actual_total_cost?: string | null;
  machine_budget_profit?: string | null;
  machine_actual_profit?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobFinancial {
  id: number;
  job: number;
  created_at: string;
  updated_at: string;

  // Common fields
  sales_price?: string | null;
  budget_profit?: string | null;
  actual_profit?: string | null;
  machine_budget_profit_total?: string | number;
  machine_actual_profit_total?: string | number;
  machine_assignments?: FinancialMachineAssignment[];

  // Tiling-specific
  labor_rate?: string | null;
  budget_hours?: string | null;
  actual_hours?: string | number;
  labor_budget?: string | null;
  actual_cost?: string | null;
  budget_material?: string | null;
  actual_material?: string | null;
  overhead_per_foot?: string | null;
  overhead?: string | null;

  // Excavation-specific
  budget_labor_hours?: string | null;
  actual_labor_hours?: string | number;
  budget_operator_hours?: string | null;
  actual_operator_hours?: string | null;
  material_description?: string | null;
  material_price?: string | null;
  miles?: string | null;
  miles_rate?: string | null;
  total_miles_cost?: string | null;
  travel_hours?: string | null;
  travel_rate?: string | null;
  total_travel_cost?: string | null;
  total_cost?: string | null;

  // Payment status (tiling only)
  payment_status?: number | null;
}

export interface JobFinancialUpdatePayload {
  sales_price?: string | null;
  labor_rate?: string | null;
  budget_hours?: string | null;
  budget_material?: string | null;
  actual_material?: string | null;
  overhead_per_foot?: string | null;
  budget_labor_hours?: string | null;
  budget_operator_hours?: string | null;
  actual_operator_hours?: string | null;
  material_description?: string | null;
  material_price?: string | null;
  miles?: string | null;
  miles_rate?: string | null;
  travel_hours?: string | null;
  travel_rate?: string | null;
  payment_status?: number | null;
}

export interface FinancialMachineAssignmentCreatePayload {
  job_equipment: number;
  budget_hours?: string | null;
  machine_rate?: string | null;
  machine_labor_cost_per_hour?: string | null;
}

export interface FinancialMachineAssignmentUpdatePayload {
  budget_hours?: string | null;
  machine_rate?: string | null;
  machine_labor_cost_per_hour?: string | null;
}

// ============================================
// JOB MUTATION ARGS
// ============================================

export type JobId = IdOf<Job>;
export type CorePointId = IdOf<CorePoint>;
export type FinancialMachineAssignmentId = IdOf<FinancialMachineAssignment>;

export interface JobTypedIdArgs {
  id: JobId;
  jobType?: JobType;
}

export interface JobTypedEntityIdArgs {
  id: JobId;
  jobType?: JobType;
}

export interface JobTrashIdArgs {
  id: JobId;
  jobType?: JobType;
}

export interface JobPatchArgs {
  id: JobId;
  updatedJob: JobUpdatePayload;
  notApproved?: boolean;
  jobType?: JobType;
}

export interface JobEstimateUpdateArgs {
  id: JobId;
  estimateNumber: string | null;
  jobType?: JobType;
}

export interface JobIdArgs {
  id: JobId;
}

export interface JobCorePointCreateArgs {
  jobId: JobId;
  data: CorePointCreatePayload;
}

export interface JobCorePointUpdateArgs {
  jobId: JobId;
  coreId: CorePointId;
  data: CorePointUpdatePayload;
}

export interface JobCorePointDeleteArgs {
  jobId: JobId;
  coreId: CorePointId;
}

export interface JobFinancialUpdateArgs {
  jobId: JobId;
  jobType: JobType;
  data: JobFinancialUpdatePayload;
}

export interface FinancialMachineAssignmentCreateArgs {
  jobId: JobId;
  jobType: JobType;
  data: FinancialMachineAssignmentCreatePayload;
}

export interface FinancialMachineAssignmentUpdateArgs {
  jobId: JobId;
  jobType: JobType;
  assignmentId: FinancialMachineAssignmentId;
  data: FinancialMachineAssignmentUpdatePayload;
}

export interface FinancialMachineAssignmentDeleteArgs {
  jobId: JobId;
  jobType: JobType;
  assignmentId: FinancialMachineAssignmentId;
}
