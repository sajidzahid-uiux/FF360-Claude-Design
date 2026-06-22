import type { AxiosRequestConfig } from "axios";

import type {
  MapDataApiResult,
  MapDataParams,
  MapDataResponse,
  MapLegend,
  MapLegendCreatePayload,
  MapLegendUpdatePayload,
  MapPin,
  MapPinCategory,
  MapPinCategoryCreatePayload,
  MapPinCategoryListParams,
  MapPinCategoryUpdatePayload,
  MapPinCreatePayload,
  PaginatedResponse,
} from "@/api/types";
import {
  parseMapDataHttpBody,
  parseMapLegendEntity,
  parseMapLegendsHttpBody,
} from "@/api/utils/parseMapResponses";
import { JobLeadEntityType } from "@/constants";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

function buildMapDataQueryParams(
  params: MapDataParams
): Record<string, string> {
  const queryParams: Record<string, string> = {};

  if (params.job_types) {
    queryParams.job_types = params.job_types;
  }

  const allJobStatuses: string[] = [];
  if (params.job_statuses) allJobStatuses.push(params.job_statuses);
  if (params.tiling_job_statuses) {
    allJobStatuses.push(params.tiling_job_statuses);
  }
  if (params.excavation_job_statuses) {
    allJobStatuses.push(params.excavation_job_statuses);
  }
  if (params.repair_job_statuses) {
    allJobStatuses.push(params.repair_job_statuses);
  }

  if (allJobStatuses.length > 0) {
    const combinedStatuses = allJobStatuses
      .join(",")
      .split(",")
      .map((status) => status.trim())
      .filter((status) => status.length > 0);
    const uniqueStatuses = [...new Set(combinedStatuses)];
    queryParams.job_statuses = uniqueStatuses.join(",");
  }

  if (params.lead_types) queryParams.lead_types = params.lead_types;
  if (params.lead_sources) queryParams.lead_sources = params.lead_sources;
  if (params.lead_statuses) queryParams.lead_statuses = params.lead_statuses;
  if (params.states) queryParams.states = params.states;
  if (params.project_types) queryParams.project_types = params.project_types;

  const assignedTo = params.assigned_to;
  queryParams.assigned_to =
    assignedTo !== undefined && assignedTo !== "" ? assignedTo : "all";

  return queryParams;
}

export class MapService {
  // ============================================
  // MAP DATA
  // ============================================

  static async getAllJobsAndLeads(
    organizationId: string,
    params: {
      job_type?: string;
      lead_type?: string;
      include_archived?: boolean;
    } = {}
  ): Promise<MapDataResponse> {
    const endpoint =
      API_ENDPOINTS.organizations.map.allJobsLeads(organizationId);
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<MapDataResponse>(`${endpoint}${queryString}`);
  }

  static async getMapData(
    organizationId: string,
    params: MapDataParams = {},
    config?: AxiosRequestConfig
  ): Promise<MapDataApiResult> {
    const endpoint = API_ENDPOINTS.organizations.map.mapData(organizationId);
    const queryString = apiClient.buildQueryString(
      buildMapDataQueryParams(params)
    );
    const httpBody = await apiClient.get<unknown>(
      `${endpoint}${queryString}`,
      config
    );
    return parseMapDataHttpBody(httpBody);
  }

  // ============================================
  // MAP LEGENDS
  // ============================================

  static async getMapLegends(organizationId: string): Promise<MapLegend[]> {
    const endpoint = API_ENDPOINTS.organizations.map.legends(organizationId);
    const httpBody = await apiClient.get<unknown>(endpoint);
    return parseMapLegendsHttpBody(httpBody);
  }

  static async createMapLegend(
    organizationId: string,
    data: MapLegendCreatePayload
  ): Promise<MapLegend> {
    const endpoint = API_ENDPOINTS.organizations.map.legends(organizationId);
    const httpBody = await apiClient.post<unknown>(endpoint, data);
    return parseMapLegendEntity(httpBody);
  }

  static async updateMapLegend(
    organizationId: string,
    legendId: number | string,
    data: MapLegendUpdatePayload
  ): Promise<MapLegend> {
    const endpoint = API_ENDPOINTS.organizations.map.legendDetail(
      organizationId,
      legendId
    );
    const httpBody = await apiClient.patch<unknown>(endpoint, data);
    return parseMapLegendEntity(httpBody);
  }

  static async deleteMapLegend(
    organizationId: string,
    legendId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.map.legendDetail(
      organizationId,
      legendId
    );
    return apiClient.delete<void>(endpoint);
  }

  // ============================================
  // MAP PINS
  // ============================================

  private static getPinsEndpoint(
    resource: JobLeadEntityType,
    organizationId: string,
    resourceId: string | number
  ): string {
    return resource === JobLeadEntityType.JOBS
      ? API_ENDPOINTS.organizations.jobs.pins(organizationId, resourceId)
      : API_ENDPOINTS.organizations.leads.pins(organizationId, resourceId);
  }

  private static getPinDetailEndpoint(
    resource: JobLeadEntityType,
    organizationId: string,
    resourceId: string | number,
    pinId: string | number
  ): string {
    return resource === JobLeadEntityType.JOBS
      ? API_ENDPOINTS.organizations.jobs.pinDetail(
          organizationId,
          resourceId,
          pinId
        )
      : API_ENDPOINTS.organizations.leads.pinDetail(
          organizationId,
          resourceId,
          pinId
        );
  }

  static async getPins(
    organizationId: string,
    resource: JobLeadEntityType,
    resourceId: string | number,
    params: { page?: number; page_size?: number } = {}
  ): Promise<PaginatedResponse<MapPin> | MapPin[]> {
    const endpoint = MapService.getPinsEndpoint(
      resource,
      organizationId,
      resourceId
    );
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<PaginatedResponse<MapPin> | MapPin[]>(
      `${endpoint}${queryString}`
    );
  }

  static async createPin(
    organizationId: string,
    resource: JobLeadEntityType,
    resourceId: string | number,
    data: MapPinCreatePayload
  ): Promise<MapPin> {
    const endpoint = MapService.getPinsEndpoint(
      resource,
      organizationId,
      resourceId
    );
    return apiClient.post<MapPin>(endpoint, data);
  }

  static async deletePin(
    organizationId: string,
    resource: JobLeadEntityType,
    resourceId: string | number,
    pinId: string | number
  ): Promise<void> {
    const endpoint = MapService.getPinDetailEndpoint(
      resource,
      organizationId,
      resourceId,
      pinId
    );
    return apiClient.delete<void>(endpoint);
  }

  // ============================================
  // PIN CATEGORIES
  // ============================================

  static async getPinCategories(
    organizationId: string,
    params: MapPinCategoryListParams = {},
    useSettingsPrefix = false
  ): Promise<PaginatedResponse<MapPinCategory> | MapPinCategory[]> {
    const endpoint = useSettingsPrefix
      ? API_ENDPOINTS.organizations.settingsPinCategories(organizationId)
      : API_ENDPOINTS.organizations.pinCategories(organizationId);
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<PaginatedResponse<MapPinCategory> | MapPinCategory[]>(
      `${endpoint}${queryString}`
    );
  }

  static async createPinCategory(
    organizationId: string,
    data: MapPinCategoryCreatePayload,
    useSettingsPrefix = false
  ): Promise<MapPinCategory> {
    const endpoint = useSettingsPrefix
      ? API_ENDPOINTS.organizations.settingsPinCategories(organizationId)
      : API_ENDPOINTS.organizations.pinCategories(organizationId);
    return apiClient.post<MapPinCategory>(endpoint, data);
  }

  static async updatePinCategory(
    organizationId: string,
    categoryId: number | string,
    data: MapPinCategoryUpdatePayload,
    useSettingsPrefix = false
  ): Promise<MapPinCategory> {
    const endpoint = useSettingsPrefix
      ? API_ENDPOINTS.organizations.settingsPinCategoryDetail(
          organizationId,
          categoryId
        )
      : API_ENDPOINTS.organizations.pinCategoryDetail(
          organizationId,
          categoryId
        );
    return apiClient.patch<MapPinCategory>(endpoint, data);
  }

  static async deletePinCategory(
    organizationId: string,
    categoryId: number | string,
    useSettingsPrefix = false
  ): Promise<void> {
    const endpoint = useSettingsPrefix
      ? API_ENDPOINTS.organizations.settingsPinCategoryDetail(
          organizationId,
          categoryId
        )
      : API_ENDPOINTS.organizations.pinCategoryDetail(
          organizationId,
          categoryId
        );
    return apiClient.delete<void>(endpoint);
  }
}
