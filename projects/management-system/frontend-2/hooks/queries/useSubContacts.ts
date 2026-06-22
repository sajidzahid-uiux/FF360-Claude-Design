import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { ContactsService } from "@/api/services";
import type {
  PaginatedSubContactsResponse,
  SubContactListParams,
  SubContactSummary,
} from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

type SubContactsQueryData = PaginatedSubContactsResponse | SubContactSummary[];

const isPaginated = (
  data: SubContactsQueryData
): data is PaginatedSubContactsResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    "total_count" in data
  );
};

export const useSubContacts = (
  parentContactId: number | null,
  params: SubContactListParams = {},
  enabled = true
) => {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => [
      QUERY_KEYS.SUB_CONTACTS,
      organizationId,
      parentContactId,
      params.page ?? 1,
      params.page_size ?? 100,
      params.search ?? "",
    ],
    [organizationId, parentContactId, params]
  );

  const query = useQuery<SubContactsQueryData>({
    queryKey,
    queryFn: () => {
      if (!organizationId || !parentContactId) {
        throw new Error("Organization ID and parent contact ID are required");
      }
      return ContactsService.getSubContacts(
        organizationId,
        parentContactId,
        params
      );
    },
    enabled: !!organizationId && !!parentContactId && enabled,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  const subContacts = useMemo(() => {
    if (!query.data) return [];
    return isPaginated(query.data) ? query.data.results : query.data;
  }, [query.data]);

  const pagination = useMemo(() => {
    if (!query.data || !isPaginated(query.data)) return null;
    const {
      total_count,
      total_pages,
      current_page,
      page_size,
      next,
      previous,
      results,
    } = query.data;
    return {
      totalCount: total_count,
      totalPages: total_pages,
      currentPage: current_page,
      pageSize: page_size,
      hasNext: !!next,
      hasPrevious: !!previous,
      resultsCount: results.length,
    };
  }, [query.data]);

  return {
    ...query,
    subContacts,
    pagination,
  };
};
