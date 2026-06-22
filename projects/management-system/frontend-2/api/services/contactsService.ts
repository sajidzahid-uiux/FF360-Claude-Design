import type {
  CategoryCreatePayload,
  Contact,
  ContactCategory,
  ContactCreatePayload,
  ContactListParams,
  ContactUpdatePayload,
  ContactsApiResponse,
  Farm,
  FarmCreatePayload,
  FarmUpdatePayload,
  JobHistoryItem,
  JobHistoryListParams,
  JobHistoryResponse,
  PaginatedContactsResponse,
  PaginatedSubContactsResponse,
  SubContactCreateAndLinkPayload,
  SubContactLinkPayload,
  SubContactListParams,
  SubContactSummary,
} from "@/api/types";
import type { ApiSuccessResponse } from "@/api/types/common";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

type ContactApiEnvelope = Contact | { success?: boolean; data?: Contact };

function unwrapCategoryResponse(
  response: ContactCategory | ApiSuccessResponse<ContactCategory>
): ContactCategory {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    "success" in response
  ) {
    return response.data;
  }

  return response;
}

/** Resolve contact id from flat contact or { success, data } API envelope. */
export function resolveContactIdFromApiResponse(
  payload: unknown
): number | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;

  const readId = (value: unknown): number | undefined => {
    if (typeof value === "number" && value > 0) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    }
    return undefined;
  };

  const topLevel = readId(record.id);
  if (topLevel) return topLevel;

  const data = record.data;
  if (!data || typeof data !== "object") return undefined;
  const dataRecord = data as Record<string, unknown>;

  const dataId = readId(dataRecord.id);
  if (dataId) return dataId;

  const nested = dataRecord.contact;
  if (nested && typeof nested === "object") {
    return readId((nested as Record<string, unknown>).id);
  }

  return undefined;
}

function unwrapContactResponse(response: ContactApiEnvelope): Contact {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    response.data &&
    typeof response.data === "object" &&
    "id" in response.data
  ) {
    return response.data;
  }
  const data = (response as { data?: unknown }).data;
  if (data && typeof data === "object") {
    const dataRecord = data as Record<string, unknown>;
    const nested = dataRecord.contact;
    if (nested && typeof nested === "object" && "id" in nested) {
      return nested as Contact;
    }
  }
  if (response && typeof response === "object" && "id" in response) {
    return response;
  }
  throw new Error("Unexpected contact API response shape");
}

function unwrapSubContactResponse(
  response: SubContactSummary | { success?: boolean; data?: SubContactSummary }
): SubContactSummary {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    response.data &&
    typeof response.data === "object" &&
    "id" in response.data
  ) {
    return response.data;
  }
  if (response && typeof response === "object" && "id" in response) {
    return response;
  }
  throw new Error("Unexpected sub-contact API response shape");
}

export class ContactsService {
  // ============================================
  // CONTACTS
  // ============================================

  static async getContacts(
    organizationId: string,
    params: ContactListParams = {}
  ): Promise<PaginatedContactsResponse | Contact[]> {
    const endpoint = API_ENDPOINTS.organizations.contacts.list(organizationId);
    const queryString = apiClient.buildQueryString(params);
    const response = await apiClient.get<
      PaginatedContactsResponse | Contact[] | ContactsApiResponse
    >(`${endpoint}${queryString}`);

    if (
      response &&
      typeof response === "object" &&
      "data" in response &&
      "success" in response
    ) {
      return (response as ContactsApiResponse).data;
    }

    // Return response as-is if it's already in the expected format
    return response as PaginatedContactsResponse | Contact[];
  }

  static async getContact(
    organizationId: string,
    contactId: number | string
  ): Promise<Contact> {
    const endpoint = API_ENDPOINTS.organizations.contacts.detail(
      organizationId,
      contactId
    );
    const response = await apiClient.get<ContactApiEnvelope>(endpoint);
    return unwrapContactResponse(response);
  }

  static async createContact(
    organizationId: string,
    data: ContactCreatePayload
  ): Promise<Contact> {
    const endpoint =
      API_ENDPOINTS.organizations.contacts.create(organizationId);
    const response = await apiClient.post<ContactApiEnvelope>(endpoint, data);
    return unwrapContactResponse(response);
  }

  static async updateContact(
    organizationId: string,
    contactId: number | string,
    data: ContactUpdatePayload
  ): Promise<Contact> {
    const endpoint = API_ENDPOINTS.organizations.contacts.detail(
      organizationId,
      contactId
    );
    const response = await apiClient.patch<ContactApiEnvelope>(endpoint, data);
    return unwrapContactResponse(response);
  }

  static async deleteContact(
    organizationId: string,
    contactId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.contacts.detail(
      organizationId,
      contactId
    );
    return apiClient.delete<void>(endpoint);
  }

  // ============================================
  // CONTACT CATEGORIES
  // ============================================

  static async getCategories(
    organizationId: string
  ): Promise<ContactCategory[]> {
    const endpoint =
      API_ENDPOINTS.organizations.contacts.categories(organizationId);
    return apiClient.get<ContactCategory[]>(endpoint);
  }

  static async createCategory(
    organizationId: string,
    data: CategoryCreatePayload
  ): Promise<ContactCategory> {
    const endpoint =
      API_ENDPOINTS.organizations.contacts.categories(organizationId);
    const response = await apiClient.post<
      ContactCategory | ApiSuccessResponse<ContactCategory>
    >(endpoint, data);
    return unwrapCategoryResponse(response);
  }

  static async updateCategory(
    organizationId: string,
    categoryId: number | string,
    data: Partial<CategoryCreatePayload>
  ): Promise<ContactCategory> {
    const endpoint = API_ENDPOINTS.organizations.contacts.categoryDetail(
      organizationId,
      categoryId
    );
    const response = await apiClient.patch<
      ContactCategory | ApiSuccessResponse<ContactCategory>
    >(endpoint, data);
    return unwrapCategoryResponse(response);
  }

  static async deleteCategory(
    organizationId: string,
    categoryId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.contacts.categoryDetail(
      organizationId,
      categoryId
    );
    return apiClient.delete<void>(endpoint);
  }

  // ============================================
  // FARMS
  // ============================================

  static async getFarms(
    organizationId: string,
    contactId: number | string
  ): Promise<Farm[]> {
    const endpoint = API_ENDPOINTS.organizations.farms.list(
      organizationId,
      contactId
    );
    return apiClient.get<Farm[]>(endpoint);
  }

  static async getFarm(
    organizationId: string,
    contactId: number | string,
    farmId: number | string
  ): Promise<Farm> {
    const endpoint = API_ENDPOINTS.organizations.farms.detail(
      organizationId,
      contactId,
      farmId
    );
    return apiClient.get<Farm>(endpoint);
  }

  static async createFarm(
    organizationId: string,
    contactId: number | string,
    data: FarmCreatePayload
  ): Promise<Farm> {
    const endpoint = API_ENDPOINTS.organizations.farms.create(
      organizationId,
      contactId
    );
    return apiClient.post<Farm>(endpoint, data);
  }

  static async updateFarm(
    organizationId: string,
    contactId: number | string,
    farmId: number | string,
    data: FarmUpdatePayload
  ): Promise<Farm> {
    const endpoint = API_ENDPOINTS.organizations.farms.detail(
      organizationId,
      contactId,
      farmId
    );
    return apiClient.patch<Farm>(endpoint, data);
  }

  static async deleteFarm(
    organizationId: string,
    contactId: number | string,
    farmId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.farms.detail(
      organizationId,
      contactId,
      farmId
    );
    return apiClient.delete<void>(endpoint);
  }

  // ============================================
  // JOB HISTORY
  // ============================================

  static async getJobHistory(
    organizationId: string,
    contactId: number | string,
    params: JobHistoryListParams = {}
  ): Promise<JobHistoryItem[]> {
    const endpoint = API_ENDPOINTS.organizations.contacts.jobHistory(
      organizationId,
      contactId
    );
    const queryString = apiClient.buildQueryString(params);
    const response = await apiClient.get<JobHistoryResponse | JobHistoryItem[]>(
      `${endpoint}${queryString}`
    );
    if (Array.isArray(response)) return response;
    if (response && typeof response === "object" && "data" in response) {
      return (response as JobHistoryResponse).data;
    }
    return [];
  }

  // ============================================
  // SUB-CONTACTS
  // ============================================

  static async getSubContacts(
    organizationId: string,
    contactId: number | string,
    params: SubContactListParams = {}
  ): Promise<SubContactSummary[] | PaginatedSubContactsResponse> {
    const endpoint = API_ENDPOINTS.organizations.contacts.subContacts.list(
      organizationId,
      contactId
    );
    const queryString = apiClient.buildQueryString(params);
    const response = await apiClient.get<
      | SubContactSummary[]
      | PaginatedSubContactsResponse
      | { data: SubContactSummary[] }
    >(`${endpoint}${queryString}`);

    if (
      response &&
      typeof response === "object" &&
      "data" in response &&
      Array.isArray((response as { data: SubContactSummary[] }).data)
    ) {
      return (response as { data: SubContactSummary[] }).data;
    }

    return response as SubContactSummary[] | PaginatedSubContactsResponse;
  }

  static async linkSubContact(
    organizationId: string,
    contactId: number | string,
    data: SubContactLinkPayload
  ): Promise<SubContactSummary> {
    const endpoint = API_ENDPOINTS.organizations.contacts.subContacts.link(
      organizationId,
      contactId
    );
    const response = await apiClient.post<
      SubContactSummary | { success?: boolean; data?: SubContactSummary }
    >(endpoint, data);
    return unwrapSubContactResponse(response);
  }

  static async unlinkSubContact(
    organizationId: string,
    contactId: number | string,
    subContactId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.contacts.subContacts.unlink(
      organizationId,
      contactId,
      subContactId
    );
    return apiClient.delete<void>(endpoint);
  }

  static async createAndLinkSubContact(
    organizationId: string,
    contactId: number | string,
    data: SubContactCreateAndLinkPayload
  ): Promise<SubContactSummary> {
    const endpoint =
      API_ENDPOINTS.organizations.contacts.subContacts.createAndLink(
        organizationId,
        contactId
      );
    const response = await apiClient.post<
      SubContactSummary | { success?: boolean; data?: SubContactSummary }
    >(endpoint, data);
    return unwrapSubContactResponse(response);
  }
}
