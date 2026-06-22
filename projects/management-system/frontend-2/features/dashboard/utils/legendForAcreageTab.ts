import type { AcreageTabConfig } from "@/api/types/dashboard";

import { ACREAGE_LEGEND_LABELS, type AcreageTabId } from "../model/acreageTabs";

export function legendForAcreageTab(
  tab: AcreageTabConfig,
  tabId: AcreageTabId
): Record<string, number> {
  if (tabId === "farm_acres") {
    const completed = tab.total_farm_acres_of_all_completed_tiling_jobs;
    const uncompleted = tab.total_farm_acres_of_all_uncompleted_tiling_jobs;
    const leads = tab.total_farm_acres_of_all_tiling_leads;
    const hasBreakdown =
      completed !== undefined ||
      uncompleted !== undefined ||
      leads !== undefined;
    if (!hasBreakdown) {
      return { Total: tab.total_acres };
    }
    return {
      [ACREAGE_LEGEND_LABELS.completed]: Number(completed ?? 0),
      [ACREAGE_LEGEND_LABELS.uncompleted]: Number(uncompleted ?? 0),
      [ACREAGE_LEGEND_LABELS.leads]: Number(leads ?? 0),
    };
  }

  const completed = tab.total_leads_jobs_acres_of_all_completed_tiling_jobs;
  const uncompleted = tab.total_leads_jobs_acres_of_all_uncompleted_tiling_jobs;
  const leads = tab.total_leads_jobs_acres_of_all_tiling_leads;
  const hasBreakdown =
    completed !== undefined || uncompleted !== undefined || leads !== undefined;
  if (!hasBreakdown) {
    return { Total: tab.total_acres };
  }
  return {
    [ACREAGE_LEGEND_LABELS.completed]: Number(completed ?? 0),
    [ACREAGE_LEGEND_LABELS.uncompleted]: Number(uncompleted ?? 0),
    [ACREAGE_LEGEND_LABELS.leads]: Number(leads ?? 0),
  };
}
