import type { TableServerQuery } from "@fieldflow360/org-ui";

import type { JobListParams, SortOrder } from "@/api/types";
import type { JobsPageTab } from "@/features/jobs";
import { cmsTableQueryToApiParams } from "@/shared/lib/table";

import type { JobRouteConfig } from "../model/jobLeadRouteConfig";
import {
  nameLastUpdatedSortToTableSortRules,
  tableSortRulesToNameLastUpdatedSort,
} from "./name-last-updated-table-sort";

export const JOB_TABLE_SORTABLE_COLUMNS = [
  { key: "customer_name", label: "Job Name" },
  { key: "last_updated", label: "Last Updated" },
] as const;

export const tableSortRulesToJobSort = tableSortRulesToNameLastUpdatedSort;
export const jobSortToTableSortRules = nameLastUpdatedSortToTableSortRules;

export function jobsTableQueryToListParams(
  query: TableServerQuery,
  config: Pick<JobRouteConfig, "apiType" | "statusFilterType">,
  tab: JobsPageTab
): JobListParams {
  const params = cmsTableQueryToApiParams(query, {
    filterParamMap: { [config.statusFilterType]: "job_status" },
  });

  const statusValues = params.job_status;
  const statusFilter =
    Array.isArray(statusValues) && statusValues.length > 0
      ? statusValues.map(String).join(",")
      : undefined;

  const { sort_by, sort_order } = tableSortRulesToJobSort(query.sortRules);

  const listParams: JobListParams = {
    job_type: config.apiType,
    not_coordination: true,
    exclude_completed: true,
    exclude_cancelled: true,
    archived: tab === "archived",
    page: Number(params.page),
    page_size: Number(params.page_size),
  };

  if (tab === "on_hold") {
    listParams.on_hold = true;
    listParams.archived = false;
  }

  const search = params.search;
  if (typeof search === "string" && search.length > 0) {
    listParams.search = search;
  }

  if (statusFilter) {
    listParams.job_status = statusFilter;
  }

  if (sort_by) {
    listParams.sort_by = sort_by;
  }

  if (sort_order) {
    listParams.sort_order = sort_order as SortOrder;
  }

  return listParams;
}
