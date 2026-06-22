import type { OrderPipeCategoriesResponse } from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export interface OrderPipeCategoriesParams {
  provider_id?: number | string;
}

export class OrderPipeService {
  static async getCategories(
    params: OrderPipeCategoriesParams = {}
  ): Promise<OrderPipeCategoriesResponse> {
    const endpoint = API_ENDPOINTS.orderPipe.categories();
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<OrderPipeCategoriesResponse>(
      `${endpoint}${queryString}`
    );
  }
}
