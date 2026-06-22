"use client";

import { useMemo } from "react";

import type {
  Lead,
  LeadListParams,
  PaginatedResponse,
  SortOrder,
} from "@/api/types";
import { useLeadsList } from "@/hooks/queries";
import { CMS_DEFAULT_PAGE_SIZE as DEFAULT_PAGE_SIZE } from "@/shared/lib/table";
import { type FilterState, FilterType } from "@/shared/ui/common";

import type { LeadsPageTab } from "./leads-page-store";

interface UseLeadPageListDataParams {
  actualLeadType: string;
  currentPage: number;
  currentTab: LeadsPageTab;
  filters: FilterState;
  farmManagementId?: number;
  pageSize?: number;
  searchTerm: string;
  sortBy?: string;
  sortOrder: SortOrder | null;
}

function getCsvFilter(filters: FilterState, filterType: FilterType) {
  const value = filters[filterType];
  return Array.isArray(value) && value.length > 0 ? value.join(",") : undefined;
}

function getLeadRows(data: PaginatedResponse<Lead> | Lead[] | undefined) {
  return Array.isArray(data) ? data : data?.results || [];
}

function getPaginationInfo(data: PaginatedResponse<Lead> | Lead[] | undefined) {
  if (!data || Array.isArray(data)) return null;

  return {
    totalPages: data.total_pages || 1,
    totalCount: data.total_count || 0,
  };
}

export function useLeadPageListData({
  actualLeadType,
  currentPage,
  currentTab,
  filters,
  farmManagementId,
  pageSize = DEFAULT_PAGE_SIZE,
  searchTerm,
  sortBy,
  sortOrder,
}: UseLeadPageListDataParams) {
  const baseParams = useMemo<LeadListParams>(
    () => ({
      actual_lead_type: actualLeadType,
      search: searchTerm || undefined,
      farm_management_id: farmManagementId,
      lead_type: getCsvFilter(filters, FilterType.LEAD_TYPES),
      lead_status: getCsvFilter(filters, FilterType.LEAD_STATUSES),
      not_coordination: true,
      page: currentPage,
      page_size: pageSize,
      sort_by: sortBy,
      sort_order: sortOrder || undefined,
    }),
    [
      actualLeadType,
      currentPage,
      farmManagementId,
      filters,
      pageSize,
      searchTerm,
      sortBy,
      sortOrder,
    ]
  );

  const activeParams = useMemo(
    () => ({ ...baseParams, archived: false }),
    [baseParams]
  );
  const archivedParams = useMemo(
    () => ({ ...baseParams, archived: true }),
    [baseParams]
  );

  const activeQuery = useLeadsList(activeParams);
  const archivedQuery = useLeadsList(archivedParams);

  const activeRows = useMemo(
    () => getLeadRows(activeQuery.data),
    [activeQuery.data]
  );
  const archivedRows = useMemo(
    () => getLeadRows(archivedQuery.data),
    [archivedQuery.data]
  );
  const paginationInfo = useMemo(
    () =>
      getPaginationInfo(
        currentTab === "active" ? activeQuery.data : archivedQuery.data
      ),
    [activeQuery.data, archivedQuery.data, currentTab]
  );

  return {
    activeQuery,
    activeRows,
    archivedQuery,
    archivedRows,
    paginationInfo,
  };
}
