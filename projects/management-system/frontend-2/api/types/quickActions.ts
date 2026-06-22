import type { JobLeadTypeSegment } from "@/constants";

import type { IdOf } from "./common";

// ============================================
// QUICK ACTION FILE ATTACHMENT
// ============================================

export interface QuickActionFile {
  id: number;
  title: string;
  description?: string;
  url: string;
  uploaded_at: string;
}

// ============================================
// CONVERSION (from API: list/detail include conversion)
// ============================================

export type QuickActionConversionType = "contact" | "lead" | "job" | null;

export interface QuickActionLinkedContact {
  id: number;
  full_name: string;
  email?: string | null;
  phone_number?: string | null;
  farms?: QuickActionLinkedFarm[];
}

/** Farm on a linked contact (`QuickActionLinkedContact.farms`). */
export interface QuickActionLinkedFarm {
  id: number;
  name: string;
}

/** Farm row in convert-to-lead/job picker; `created_at` when available. */
export type QuickActionFarmSelectOption = QuickActionLinkedFarm & {
  created_at?: string;
};

export interface QuickActionLinkedLead {
  id: number;
  type: string;
  lead_type_id: number;
}

export interface QuickActionConversion {
  done: boolean;
  conversion_type: QuickActionConversionType;
  converted_at: string;
  contact?: QuickActionLinkedContact;
  lead?: QuickActionLinkedLead;
  lead_done?: boolean;
}

// ============================================
// QUICK ACTION
// ============================================

export interface QuickAction {
  id: number;
  name: string | null;
  phone_number: string | null;
  email: string | null;
  description: string | null;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  files: QuickActionFile[];
  /** From API when converted; use conversion.done for "Done" state. */
  conversion?: QuickActionConversion | null;
  /** Derived: true when conversion?.done is true (for backward compat). */
  done?: boolean;
  /** Derived from conversion_type for View Details section title. */
  converted_to?: QuickActionConversionType;
}

// ============================================
// LIST PARAMS
// ============================================

export interface QuickActionListParams {
  search?: string;
}

// ============================================
// CREATE PAYLOAD
// At least one of these must be provided.
// file_ids contains IDs from the org-level
// file upload endpoint.
// ============================================

export interface QuickActionCreatePayload {
  name?: string;
  phone_number?: string;
  email?: string;
  description?: string;
  file_ids?: number[];
}

// ============================================
// UPDATE PAYLOAD (PATCH, partial)
// ============================================

export interface QuickActionUpdatePayload {
  name?: string;
  phone_number?: string;
  email?: string;
  description?: string;
}

export interface QuickActionIdUpdateArgs {
  id: IdOf<QuickAction>;
  payload: QuickActionUpdatePayload;
}

export interface QuickActionDeleteArgs {
  id: IdOf<QuickAction>;
  silent?: boolean;
}

export interface QuickActionFileUploadArgs {
  file: File;
  title?: string;
}

// ============================================
// FILE UPLOAD PAYLOAD (org-level files endpoint)
// POST /ms/organizations/{org_id}/files/
// ============================================

export interface OrgFileUploadPayload {
  file: File;
  title: string;
  description?: string;
}

export interface OrgFileUploadResponse {
  id: number;
  title: string;
  description?: string;
  file: string;
  uploaded_at: string;
}

// ============================================
// CONVERT TO CONTACT
// ============================================

/** Contact match from lookup (id, full_name, email, phone_number). */
export interface QuickActionContactMatch {
  id: number;
  full_name: string;
  email?: string | null;
  phone_number?: string | null;
}

/** GET .../convert-to-contact/lookup/ response payload. */
export interface QuickActionContactLookupResponse {
  done: boolean;
  /** When done: false and matches found. */
  matches?: QuickActionContactMatch[];
  /** When done: true (already converted). */
  contact?: QuickActionLinkedContact;
  message?: string;
}

/** POST .../convert-to-contact/ — link to existing contact. */
export interface QuickActionConvertToContactLinkPayload {
  contact_id: number;
}

/** POST .../convert-to-contact/ — create new contact and link. */
export interface QuickActionConvertToContactCreatePayload {
  name: string;
  email?: string;
  phone_number?: string;
}

export type QuickActionConvertToContactPayload =
  | QuickActionConvertToContactLinkPayload
  | QuickActionConvertToContactCreatePayload;

/** POST .../convert-to-contact/ response payload. */
export interface QuickActionConvertToContactResponse {
  done: boolean;
  contact: QuickActionLinkedContact;
  message?: string;
}

// ============================================
// CONVERT TO LEAD
// ============================================

/** Convert-to-lead / convert-to-job API slug (`tiling` | `excavation` | `repair`). */
export type QuickActionJobLeadTypeApi = JobLeadTypeSegment;

export interface QuickActionConvertToLeadPayload {
  lead_type: QuickActionJobLeadTypeApi;
  lead_source: number;
  description?: string;
  farm_id?: number;
  /** Designer IDs; send empty array when not used. */
  designers?: number[];
}

export interface QuickActionConvertToLeadResponse {
  lead_done: boolean;
  lead: QuickActionLinkedLead;
  message?: string;
}

// ============================================
// CONVERT TO JOB
// ============================================

export interface QuickActionConvertToJobPayload {
  job_type: QuickActionJobLeadTypeApi;
  /** Project type id as string (API field `project_type`). */
  project_type: string;
  description?: string;
  farm_id?: number;
}

export interface QuickActionConvertToJobResponse {
  job_done: boolean;
  job: {
    id: number;
    type: string;
    project_type_id?: number;
  };
  message?: string;
}
