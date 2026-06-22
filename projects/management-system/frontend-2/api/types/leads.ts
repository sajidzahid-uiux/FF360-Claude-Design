import { LeadType } from "@/constants/enums";

import type {
  BaseListParams,
  IdOf,
  LeadStatus,
  ObjectType,
  PaginatedResponse,
  Status,
  Vertex,
} from "./common";
import type {
  ContactInfo,
  CorePointCreatePayload,
  CorePointId,
  CorePointUpdatePayload,
  JobId,
  Member,
  OperatorInfo,
  StakeholderContact,
  StakeholderFarm,
} from "./jobs";
import type { NotesTabAccess } from "./notes";

// ============================================
// LEAD TYPE
// ============================================

export type LeadTypeInfo = Status;

// ============================================
// LEAD ENTITY
// ============================================

export interface Lead {
  id: number;
  title: string;
  description: string;
  po_number: string;
  customer_phone_number: string;
  object_type: ObjectType;
  lead_status: LeadStatus;
  lead_type: LeadTypeInfo;
  latitude?: number;
  longitude?: number;
  vertices?: Vertex[];
  created_at: string;
  last_updated: string;
  contact_info: ContactInfo;
  designers?: Member[];
  acers?: number;
  /** Tiling only: acres specific to this lead/job record; separate from farm acreage. */
  job_lead_acre?: number | null;
  one_call?: string;
  farm_name?: string;
  farm_id?: number;

  /** Multi-client / multi-farm (detail endpoints) */
  contacts_count?: number;
  farms_count?: number;
  contacts?: StakeholderContact[];
  farms?: StakeholderFarm[];

  // Financial & Scheduling
  sales_price?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  extra_days?: number | null;
  completed_days?: number | null;
  total_days?: number | null;

  // Operator (Excavation)
  operator?: number | null;
  operator_info?: OperatorInfo | null;

  // Project Status (Tile)
  comp_cam_project?: boolean;
  locate_completed?: boolean;
  topo_completed?: boolean;
  locate_expire_date?: string | null;

  // Estimate Fields
  estimate_number?: string | number | null;
  estimate_sent?: boolean;
  contract_sent?: boolean;

  // Payment Status (Tile only)
  payment_status?: number | null;

  /** Optional progress label (e.g. "3/10") from some list endpoints */
  progress_bar?: string;

  notesTabAccess?: NotesTabAccess;
}

// ============================================
// LEAD PAYLOADS
// ============================================

export interface LeadCreatePayload {
  description?: string;
  lead_type: number;
  lead_status: number;
  designers?: number[];
  acers?: number;
  job_lead_acre?: number | null;
  one_call?: string;
  contact?: number;
  farm?: number;
  contact_ids?: number[];
  farm_ids?: number[];
  primary_contact_id?: number | null;
  primary_farm_id?: number | null;
  sales_price?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  extra_days?: number | null;
  operator?: number | null;
  comp_cam_project?: boolean;
  locate_completed?: boolean;
  topo_completed?: boolean;
  locate_expire_date?: string | null;
  payment_status?: number | null;
}

export interface LeadFarmInfoUpdatePayload {
  id?: number;
  name?: string;
  acreage?: number | string;
  vertices?: Vertex[] | unknown;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export interface LeadUpdatePayload extends Partial<LeadCreatePayload> {
  title?: string;
  customer_phone_number?: string;
  lead_status?: number;
  job_footage?: number | null;
  raisers_installed?: number | null;
  farm_info?: LeadFarmInfoUpdatePayload;
  material_status?: string | null;
  estimate_number?: string | number | null;
  estimate_sent?: boolean;
  contract_sent?: boolean;
  payment_status?: number | null;
}

export interface LeadMapUpdatePayload {
  xmlmap?: File | null;
  shpmap?: File | null;
  kmlmap?: File | null;
  xmlmap_v2?: File[];
  shpmap_v2?: File[];
  kmlmap_v2?: File[];
}

export interface LeadListParams extends BaseListParams {
  lead_type?: string;
  actual_lead_type?: string;
  lead_status?: string;
  trashed?: boolean;
  archived?: boolean;
  not_coordination?: boolean;
  /** Filter leads linked to sub-contacts of this Farm Management contact. */
  farm_management_id?: number;
}

// ============================================
// LEAD RESPONSES
// ============================================

export interface LeadResponse {
  success: boolean;
  data: Lead | Lead[];
  message?: string;
  timestamp?: string;
}

export type PaginatedLeadResponse = PaginatedResponse<Lead>;

// ============================================
// CONVERT LEAD TO JOB
// ============================================

export interface ConvertLeadToJobPayload {
  job_status: number;
  equipments?: Array<{ equipment: number }>;
  crew?: number[];
  designers?: number[];
}

export interface ConvertLeadToJobResponse {
  success: boolean;
  data: {
    id: number;
  };
  message?: string;
  timestamp?: string;
}

// ============================================
// LEAD MUTATION ARGS
// ============================================

export type LeadId = IdOf<Lead>;
export type JobOrLeadId = JobId | LeadId;

export interface LeadTypedIdArgs {
  id: LeadId;
  leadType?: LeadType;
  suppressToast?: boolean;
}

export interface LeadTypedEntityIdArgs {
  id: LeadId;
  leadType?: LeadType;
}

export interface LeadTrashIdArgs {
  id: LeadId;
  leadType?: LeadType;
  suppressToast?: boolean;
}

export interface LeadPatchArgs {
  id: LeadId;
  leadType: LeadType;
  updatedLead: LeadUpdatePayload;
}

export interface ConvertLeadToJobArgs {
  id: LeadId;
  leadType: LeadType;
  convertToJobRequest: ConvertLeadToJobPayload;
}

export interface LeadCorePointCreateArgs {
  leadId: LeadId;
  data: CorePointCreatePayload;
}

export interface LeadCorePointUpdateArgs {
  leadId: LeadId;
  coreId: CorePointId;
  data: CorePointUpdatePayload;
}

export interface LeadCorePointDeleteArgs {
  leadId: LeadId;
  coreId: CorePointId;
}
