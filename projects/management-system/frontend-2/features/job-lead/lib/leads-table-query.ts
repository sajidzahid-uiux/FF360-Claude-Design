import type { TableServerQuery } from "@fieldflow360/org-ui";

import type { LeadListParams, SortOrder } from "@/api/types";
import { cmsTableQueryToApiParams } from "@/shared/lib/table";
import { FilterType } from "@/shared/ui/common/filter/model/types";

import type { LeadRouteConfig } from "../model/jobLeadRouteConfig";
import {
  nameLastUpdatedSortToTableSortRules,
  tableSortRulesToNameLastUpdatedSort,
} from "./name-last-updated-table-sort";

export const LEAD_TABLE_SORTABLE_COLUMNS = [
  { key: "customer_name", label: "Lead Name" },
  { key: "last_updated", label: "Last Updated" },
] as const;

export const tableSortRulesToLeadSort = tableSortRulesToNameLastUpdatedSort;
export const leadSortToTableSortRules = nameLastUpdatedSortToTableSortRules;

export function leadsTableQueryToListParams(
  query: TableServerQuery,
  config: Pick<LeadRouteConfig, "apiType">,
  options: {
    archived: boolean;
    farmManagementId?: number;
  }
): LeadListParams {
  const params = cmsTableQueryToApiParams(query, {
    filterParamMap: {
      [FilterType.LEAD_TYPES]: "lead_type",
      [FilterType.LEAD_STATUSES]: "lead_status",
    },
  });

  const joinCsv = (raw: unknown) =>
    Array.isArray(raw) && raw.length > 0
      ? raw.map(String).join(",")
      : undefined;

  const leadTypeFilter = joinCsv(params.lead_type);
  const statusFilter = joinCsv(params.lead_status);

  const { sort_by, sort_order } = tableSortRulesToLeadSort(query.sortRules);

  const listParams: LeadListParams = {
    actual_lead_type: config.apiType,
    not_coordination: true,
    archived: options.archived,
    page: Number(params.page),
    page_size: Number(params.page_size),
  };

  const search = params.search;
  if (typeof search === "string" && search.length > 0) {
    listParams.search = search;
  }

  if (leadTypeFilter) {
    listParams.lead_type = leadTypeFilter;
  }

  if (statusFilter) {
    listParams.lead_status = statusFilter;
  }

  if (sort_by) {
    listParams.sort_by = sort_by;
  }

  if (sort_order) {
    listParams.sort_order = sort_order as SortOrder;
  }

  if (options.farmManagementId != null) {
    listParams.farm_management_id = options.farmManagementId;
  }

  return listParams;
}
