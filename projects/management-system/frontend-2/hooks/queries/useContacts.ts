import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { ContactsService } from "@/api/services";
import type {
  Contact,
  ContactListParams,
  PaginatedContactsResponse,
} from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

type ContactsQueryData = PaginatedContactsResponse | Contact[];

const isPaginated = (
  data: ContactsQueryData
): data is PaginatedContactsResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    "total_count" in data
  );
};

/**
 * Optional query-level overrides so callers (e.g. the Map page) can opt into
 * softer caching without forcing that behaviour on the dedicated Contacts
 * list page, which wants always-fresh data.
 */
export type UseContactsQueryOverrides = {
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean | "always";
  refetchOnWindowFocus?: boolean | "always";
};

export const useContacts = (
  params: ContactListParams = {},
  enabled: boolean = true,
  queryOverrides: UseContactsQueryOverrides = {}
) => {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(() => {
    const {
      search = "",
      categories,
      contact_subtype,
      unlinked_only,
      page = 1,
      page_size = 100,
      sort,
    } = params;
    const categoriesKey = categories
      ? Array.isArray(categories)
        ? categories.sort().join(",")
        : String(categories)
      : "";
    return [
      QUERY_KEYS.CONTACTS,
      organizationId,
      search,
      categoriesKey,
      contact_subtype || "",
      unlinked_only ? "true" : "",
      page,
      page_size,
      sort || "",
    ];
  }, [organizationId, params]);

  const query = useQuery<ContactsQueryData>({
    queryKey,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.getContacts(organizationId, params);
    },
    enabled: !!organizationId && enabled,
    placeholderData: (prev) => prev,
    staleTime: queryOverrides.staleTime ?? 0,
    refetchOnMount: queryOverrides.refetchOnMount ?? "always",
    refetchOnWindowFocus: queryOverrides.refetchOnWindowFocus ?? true,
    gcTime: queryOverrides.gcTime ?? CACHE_TIME.GC,
  });

  const contacts = useMemo(() => {
    if (!query.data) return [];

    const responseData = query.data;

    return isPaginated(responseData) ? responseData.results : responseData;
  }, [query.data]);

  const pagination = useMemo(() => {
    if (!query.data) return null;

    const responseData = query.data;

    if (!isPaginated(responseData)) return null;

    const {
      total_count,
      next,
      previous,
      results,
      total_pages,
      current_page,
      page_size,
    } = responseData;

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
    contacts,
    pagination,
  };
};

export const useContact = (contactId: number | null) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<Contact>({
    queryKey: [QUERY_KEYS.CONTACT, organizationId, contactId],
    queryFn: () => {
      if (!organizationId || !contactId) {
        throw new Error("Organization ID and Contact ID are required");
      }
      return ContactsService.getContact(organizationId, contactId);
    },
    enabled: !!organizationId && !!contactId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};
