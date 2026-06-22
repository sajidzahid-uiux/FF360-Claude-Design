import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { ContactsService } from "@/api/services";
import type { ContactCategory } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

export interface ContactCategoryListParams {
  search?: string;
}

export const useContactCategories = (params?: ContactCategoryListParams) => {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => [QUERY_KEYS.CONTACT_CATEGORIES, organizationId, params?.search || ""],
    [organizationId, params?.search]
  );

  const query = useQuery<ContactCategory[]>({
    queryKey,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.getCategories(organizationId);
    },
    enabled: !!organizationId,
    staleTime: CACHE_TIME.LONG,
    gcTime: CACHE_TIME.GC,
  });

  return {
    ...query,
    categories: query.data ?? [],
  };
};
