import type {
  SchedulingItem,
  SchedulingItemEntityType,
  SchedulingItemPatchPayload,
  SchedulingItemsListParams,
  SchedulingItemsListResponse,
  SchedulingStatisticsResponse,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class SchedulingService {
  static async getStatistics(
    organizationId: string
  ): Promise<SchedulingStatisticsResponse> {
    const endpoint =
      API_ENDPOINTS.organizations.scheduling.statistics(organizationId);
    return apiClient.get<SchedulingStatisticsResponse>(endpoint);
  }

  static async getItems(
    organizationId: string,
    params: SchedulingItemsListParams
  ): Promise<SchedulingItemsListResponse> {
    const endpoint =
      API_ENDPOINTS.organizations.scheduling.items(organizationId);
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<SchedulingItemsListResponse>(
      `${endpoint}${queryString}`
    );
  }

  static async getItem(
    organizationId: string,
    itemId: number | string,
    entityType: SchedulingItemEntityType
  ): Promise<SchedulingItem> {
    const endpoint = API_ENDPOINTS.organizations.scheduling.itemDetail(
      organizationId,
      itemId
    );
    const queryString = apiClient.buildQueryString({
      entity_type: entityType,
    });
    return apiClient.get<SchedulingItem>(`${endpoint}${queryString}`);
  }

  /**
   * Live view at `views.py:15978` requires `?entity_type=job|lead` (the public
   * API doc omits this — see `CALENDAR_BACKEND_GAPS.md`). Sending it
   * unconditionally keeps the call valid against either contract.
   */
  static async updateItemSchedule(
    organizationId: string,
    itemId: number | string,
    entityType: SchedulingItemEntityType,
    payload: SchedulingItemPatchPayload
  ): Promise<SchedulingItem> {
    const endpoint = API_ENDPOINTS.organizations.scheduling.itemDetail(
      organizationId,
      itemId
    );
    const queryString = apiClient.buildQueryString({
      entity_type: entityType,
    });
    return apiClient.patch<SchedulingItem>(
      `${endpoint}${queryString}`,
      payload
    );
  }
}
