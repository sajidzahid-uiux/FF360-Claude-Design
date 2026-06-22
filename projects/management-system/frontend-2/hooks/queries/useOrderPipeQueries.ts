import { useQuery } from "@tanstack/react-query";

import { OrderPipeService } from "@/api/services";
import type { OrderPipeCategoriesResponse } from "@/api/types";
import { CACHE_TIME } from "@/constants";

export const ORDER_PIPE_CATEGORIES_QUERY_KEY = "order-pipe-categories";

export interface UseOrderPipeCategoriesOptions {
  /** When set, only categories for this provider are returned */
  providerId?: number | null;
  enabled?: boolean;
}

export function useOrderPipeCategories(
  options: UseOrderPipeCategoriesOptions = {}
) {
  const { providerId, enabled = true } = options;

  const queryKey = [
    ORDER_PIPE_CATEGORIES_QUERY_KEY,
    providerId ?? "all",
  ] as const;

  const query = useQuery<OrderPipeCategoriesResponse>({
    queryKey,
    queryFn: () =>
      OrderPipeService.getCategories(
        providerId != null ? { provider_id: providerId } : {}
      ),
    enabled,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  return {
    ...query,
    categories: query.data ?? [],
  };
}
