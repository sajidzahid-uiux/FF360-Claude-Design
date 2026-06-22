import type { ProjectTypeCategory } from "@/api/types";
import { PROJECT_TYPE_CATEGORY_LABELS } from "@/api/types";
import { JobOrLeadType } from "@/constants";
import type { JobTypeLabel } from "@/utils/transformJobStatuses";

export const STATUS_MANAGEMENT_TABS = [
  { value: "job-status", label: "Job status" },
  { value: "lead-settings", label: "Lead settings" },
  { value: "payment-status", label: "Payment status" },
  { value: "project-type", label: "Project type" },
] as const;

export type StatusManagementTab =
  (typeof STATUS_MANAGEMENT_TABS)[number]["value"];

export const JOB_TYPE_TAB_ITEMS = [
  { value: "Repair", label: "Repair" },
  { value: "Excavation", label: "Excavation" },
  { value: "Tile", label: "Tile" },
] as const satisfies readonly { value: JobTypeLabel; label: string }[];

export type JobTypeTab = JobTypeLabel;

export const PROJECT_TYPE_CATEGORIES: ProjectTypeCategory[] = [
  JobOrLeadType.REPAIR,
  JobOrLeadType.EXCAVATION,
  JobOrLeadType.TILING,
];

export const PROJECT_TYPE_TAB_ITEMS = PROJECT_TYPE_CATEGORIES.map(
  (category) => ({
    value: category,
    label: PROJECT_TYPE_CATEGORY_LABELS[category],
  })
);

export type ProjectTypeTab = ProjectTypeCategory;

export function tabUsesCategorySwitcher(tab: StatusManagementTab): boolean {
  return tab === "job-status" || tab === "project-type";
}
