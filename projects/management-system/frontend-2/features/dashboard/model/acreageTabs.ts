export type AcreageTabId = "farm_acres" | "leads_jobs_acres";

export const ACREAGE_LEGEND_LABELS = {
  completed: "Tile Jobs - Completed",
  uncompleted: "Tile Jobs - Uncompleted",
  leads: "Tile Leads",
} as const;

export function defaultAcreageTabId(
  defaultTab: string | undefined
): AcreageTabId {
  return defaultTab === "leads_jobs_acres" ? "leads_jobs_acres" : "farm_acres";
}
