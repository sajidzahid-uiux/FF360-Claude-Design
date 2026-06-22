import type {
  Vendor,
  VendorFavoriteCreatePayload,
  VendorFavoritesResponse,
  VendorListParams,
  VendorsResponse,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class VendorsService {
  // ============================================
  // LIST VENDORS
  // ============================================

  static async getVendors(
    organizationId: string,
    params: VendorListParams = {}
  ): Promise<VendorsResponse> {
    const endpoint = API_ENDPOINTS.organizations.vendors.list(organizationId);
    const queryString = apiClient.buildQueryString(params, {
      repeatArrays: false,
    });
    return apiClient.get<VendorsResponse>(`${endpoint}${queryString}`);
  }

  // ============================================
  // FAVORITE VENDORS
  // ============================================

  static async getFavoriteVendors(
    organizationId: string
  ): Promise<VendorFavoritesResponse | VendorsResponse> {
    const endpoint =
      API_ENDPOINTS.organizations.vendors.favorites(organizationId);
    return apiClient.get<VendorFavoritesResponse | VendorsResponse>(endpoint);
  }

  static async addFavoriteVendor(
    organizationId: string,
    payload: VendorFavoriteCreatePayload
  ): Promise<Vendor> {
    const endpoint =
      API_ENDPOINTS.organizations.vendors.favorites(organizationId);
    return apiClient.post<Vendor>(endpoint, payload);
  }

  static async removeFavoriteVendor(
    organizationId: string,
    favoriteId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.vendors.favoriteDetail(
      organizationId,
      favoriteId
    );
    return apiClient.delete<void>(endpoint);
  }
}
