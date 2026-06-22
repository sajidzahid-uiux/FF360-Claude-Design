import type { BaseListParams, IdOf, PaginatedResponse, Vertex } from "./common";

// ============================================
// CONTACT CATEGORY
// ============================================

export interface ContactCategory {
  id: number;
  name: string;
  color?: string;
  is_default?: boolean;
  created_at?: string;
  contact_count?: number;
}

export interface CategoryCreatePayload {
  name: string;
  color?: string;
}

export type CategoryUpdatePayload = Partial<CategoryCreatePayload>;

// ============================================
// FARM
// ============================================

export interface Farm {
  id: number;
  name: string;
  acreage?: number | string;
  latitude?: number | string;
  longitude?: number | string;
  vertices?: Array<[number, number]> | Vertex[];
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at: string;
  last_updated?: string;
}

export interface FarmCreatePayload {
  name: string;
  acreage?: number;
  latitude?: number | string;
  longitude?: number | string;
  vertices?: Array<[number, number]> | number[][];
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export type FarmUpdatePayload = Partial<FarmCreatePayload>;

export interface FarmListParams {
  search?: string;
}

// ============================================
// CONTACT
// ============================================

export type ContactSubtype = "standard" | "farm_management";

export interface ContactDetail {
  id?: number;
  name: string;
  phone_number?: string;
  label?: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubContactLinkArgs {
  contactId: IdOf<Contact>;
  currentSubContactIds: Array<IdOf<SubContactSummary>>;
}

export interface SubContactUnlinkArgs {
  subContactId: IdOf<SubContactSummary>;
  currentSubContactIds: Array<IdOf<SubContactSummary>>;
}

export interface SubContactSummary {
  id: number;
  full_name: string;
  phone_number?: string;
  email?: string;
  categories?: ContactCategory[];
  contact_subtype?: ContactSubtype;
  created_at?: string;
}

/** Parent farm management contact linked to a standard sub-contact. */
export interface FarmManagementContactRef {
  id: number;
  full_name: string;
}

export type FarmManagementContactNameEntry = string | FarmManagementContactRef;

export interface Contact {
  id: number;
  full_name: string;
  contact_subtype?: ContactSubtype;
  email?: string;
  phone_number?: string;
  home_phone_number?: string;
  company_name?: string;
  description?: string;
  website_link?: string;
  street_address?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  longitude?: number;
  latitude?: number;
  vertices?: number[][];
  notes?: string;
  categories: ContactCategory[];
  contact_details?: ContactDetail[];
  sub_contacts?: SubContactSummary[];
  farm_management_contact_names?: FarmManagementContactNameEntry[];
  farms?: Farm[];
  created_at: string;
  last_updated?: string;
}

export interface ContactCreatePayload {
  full_name?: string;
  contact_subtype?: ContactSubtype;
  email?: string;
  phone_number?: string;
  home_phone_number?: string;
  company_name?: string;
  description?: string;
  website_link?: string;
  street_address?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  longitude?: number;
  latitude?: number;
  vertices?: number[][];
  notes?: string;
  categories?: number[];
  category_ids?: number[];
  contact_details?: ContactDetail[];
  /** Farm Management create: existing standard contact IDs to link as sub-contacts. */
  sub_contacts?: number[];
  /** Standard create: Farm Management contact IDs to link under. */
  farm_management_contact_ids?: number[];
}

export type ContactUpdatePayload = Partial<ContactCreatePayload>;

export interface ContactListParams extends BaseListParams {
  category?: number | string;
  categories?: number | number[];
  contact_subtype?: ContactSubtype;
  /** Standard contacts not linked to any Farm Management contact. */
  unlinked_only?: boolean;
  sort?: "az" | "za";
}

// ============================================
// SUB-CONTACTS
// ============================================

export interface SubContactLinkPayload {
  contact_id: IdOf<Contact>;
}

export interface SubContactCreateAndLinkPayload {
  full_name: string;
  category_ids: number[];
  email?: string;
  phone_number?: string;
  home_phone_number?: string;
  company_name?: string;
  description?: string;
  website_link?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  longitude?: number;
  latitude?: number;
  vertices?: number[][];
  contact_details?: ContactDetail[];
}

export type SubContactListParams = BaseListParams;

export type PaginatedSubContactsResponse = PaginatedResponse<SubContactSummary>;

export interface JobHistoryListParams extends BaseListParams {
  assigned_to?: string;
}

// ============================================
// RESPONSES
// ============================================

export type PaginatedContactsResponse = PaginatedResponse<Contact>;

export interface ContactResponse {
  success: boolean;
  data: Contact[];
  message?: string;
  timestamp?: string;
}

export interface ContactsApiResponse {
  success: boolean;
  data: PaginatedContactsResponse | Contact[];
  message?: string;
  timestamp?: string;
}

// ============================================
// JOB HISTORY (Contact-related)
// ============================================

export interface JobProgress {
  current_step: number;
  total_steps: number;
  percentage: number;
}

export interface JobHistoryItem {
  id: number;
  job_name: string;
  job_type: string;
  job_status: string;
  job_status_color?: string;
  job_progress: JobProgress;
  created_at: string;
  updated_at: string;
  farm_name?: string;
  farm_id?: number;
}

export interface JobHistoryResponse {
  success: boolean;
  message: string;
  data: JobHistoryItem[];
}
