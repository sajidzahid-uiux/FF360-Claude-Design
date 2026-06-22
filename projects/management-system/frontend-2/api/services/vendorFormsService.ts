import type {
  CanProceedResponse,
  DeliveryLocation,
  DeliveryLocationCreatePayload,
  DeliveryLocationUpdatePayload,
  GenerateInvoiceResponse,
  PipeDropPayload,
  VendorFormCreatePayload,
  VendorFormListParams,
  VendorFormUpdatePayload,
  VendorFormV2,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class VendorFormsService {
  // ============================================
  // LIST VENDOR FORMS
  // ============================================

  static async getVendorForms(
    organizationId: string,
    params: VendorFormListParams = {}
  ): Promise<VendorFormV2[]> {
    const endpoint =
      API_ENDPOINTS.organizations.vendorFormsV2.list(organizationId);
    const queryString = apiClient.buildQueryString(params, {
      repeatArrays: true,
    });
    return apiClient.get<VendorFormV2[]>(`${endpoint}${queryString}`);
  }

  // ============================================
  // GET SINGLE VENDOR FORM
  // ============================================

  static async getVendorForm(
    organizationId: string,
    vendorFormId: number | string
  ): Promise<VendorFormV2> {
    const endpoint = API_ENDPOINTS.organizations.vendorFormsV2.detail(
      organizationId,
      vendorFormId
    );
    return apiClient.get<VendorFormV2>(endpoint);
  }

  // ============================================
  // CREATE VENDOR FORM
  // ============================================

  static async createVendorForm(
    organizationId: string,
    payload: VendorFormCreatePayload
  ): Promise<VendorFormV2> {
    const endpoint =
      API_ENDPOINTS.organizations.vendorFormsV2.create(organizationId);
    return apiClient.post<VendorFormV2>(endpoint, payload);
  }

  // ============================================
  // UPDATE VENDOR FORM
  // ============================================

  static async updateVendorForm(
    organizationId: string,
    vendorFormId: number | string,
    payload: VendorFormUpdatePayload
  ): Promise<VendorFormV2> {
    const endpoint = API_ENDPOINTS.organizations.vendorFormsV2.detail(
      organizationId,
      vendorFormId
    );
    return apiClient.patch<VendorFormV2>(endpoint, payload);
  }

  static async deleteVendorForm(
    organizationId: string,
    vendorFormId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.vendorFormsV2.detail(
      organizationId,
      vendorFormId
    );
    return apiClient.delete(endpoint);
  }

  // ============================================
  // GET PIPE DROP PAYLOAD
  // ============================================

  static async getPipeDropPayload(
    organizationId: string,
    vendorFormId: number | string
  ): Promise<PipeDropPayload> {
    const endpoint = API_ENDPOINTS.organizations.vendorFormsV2.pipeDropPayload(
      organizationId,
      vendorFormId
    );
    return apiClient.get<PipeDropPayload>(endpoint);
  }

  // ============================================
  // CAN PROCEED
  // ============================================

  static async getCanProceed(
    organizationId: string,
    vendorFormId: number | string
  ): Promise<CanProceedResponse> {
    const endpoint = API_ENDPOINTS.organizations.vendorFormsV2.canProceed(
      organizationId,
      vendorFormId
    );
    return apiClient.get<CanProceedResponse>(endpoint);
  }

  // ============================================
  // DELIVERY LOCATIONS
  // ============================================

  static async getDeliveryLocations(
    organizationId: string,
    vendorFormId: number | string
  ): Promise<DeliveryLocation[]> {
    const endpoint =
      API_ENDPOINTS.organizations.vendorFormsV2.deliveryLocations(
        organizationId,
        vendorFormId
      );
    return apiClient.get<DeliveryLocation[]>(endpoint);
  }

  static async createDeliveryLocation(
    organizationId: string,
    vendorFormId: number | string,
    payload: DeliveryLocationCreatePayload
  ): Promise<DeliveryLocation> {
    const endpoint =
      API_ENDPOINTS.organizations.vendorFormsV2.deliveryLocations(
        organizationId,
        vendorFormId
      );
    return apiClient.post<DeliveryLocation>(endpoint, payload);
  }

  static async getDeliveryLocation(
    organizationId: string,
    vendorFormId: number | string,
    locationId: number | string
  ): Promise<DeliveryLocation> {
    const endpoint =
      API_ENDPOINTS.organizations.vendorFormsV2.deliveryLocationDetail(
        organizationId,
        vendorFormId,
        locationId
      );
    return apiClient.get<DeliveryLocation>(endpoint);
  }

  static async updateDeliveryLocation(
    organizationId: string,
    vendorFormId: number | string,
    locationId: number | string,
    payload: DeliveryLocationUpdatePayload
  ): Promise<PipeDropPayload> {
    const endpoint =
      API_ENDPOINTS.organizations.vendorFormsV2.deliveryLocationDetail(
        organizationId,
        vendorFormId,
        locationId
      );
    return apiClient.patch<PipeDropPayload>(endpoint, payload);
  }

  static async deleteDeliveryLocation(
    organizationId: string,
    vendorFormId: number | string,
    locationId: number | string
  ): Promise<PipeDropPayload> {
    const endpoint =
      API_ENDPOINTS.organizations.vendorFormsV2.deliveryLocationDetail(
        organizationId,
        vendorFormId,
        locationId
      );
    return apiClient.delete<PipeDropPayload>(endpoint);
  }

  // ============================================
  // GENERATE INVOICE
  // ============================================

  static async generateInvoice(
    organizationId: string,
    vendorFormId: number | string
  ): Promise<GenerateInvoiceResponse> {
    const endpoint = API_ENDPOINTS.organizations.vendorFormsV2.generateInvoice(
      organizationId,
      vendorFormId
    );
    return apiClient.post<GenerateInvoiceResponse>(endpoint, {});
  }
}
