import type {
  OrganizationLeadStatusSetting,
  OrganizationLeadTypeSetting,
} from "@/api/types";
import type { TransformedJobStatus } from "@/utils/transformJobStatuses";

export function getJobStatusSubtitle(
  status: Pick<TransformedJobStatus, "title" | "is_default" | "editable">
): string {
  if (
    status.title === "New" ||
    status.title === "Completed" ||
    (status.is_default && status.editable === false)
  ) {
    return "Default status · Cannot be moved";
  }
  if (status.is_default) {
    return "Default status";
  }
  return "Custom status";
}

export function getLeadStatusSubtitle(
  status: Pick<OrganizationLeadStatusSetting, "is_default"> & {
    editable?: boolean;
  }
): string {
  if (status.is_default && status.editable === false) {
    return "Default status · Cannot be moved";
  }
  if (status.is_default) {
    return "Default status";
  }
  return "Custom status";
}

export function getLeadSourceSubtitle(
  status: Pick<OrganizationLeadTypeSetting, "is_default"> & {
    editable?: boolean;
  }
): string {
  if (status.is_default && status.editable === false) {
    return "Default source · Cannot be moved";
  }
  if (status.is_default) {
    return "Default source";
  }
  return "Custom source";
}

export function formatJobStatusTitle(title: string): string {
  return title === "In Progress" ? "In Progress -" : title;
}

export function canDeleteJobStatus(
  status: Pick<TransformedJobStatus, "is_default" | "title">
): boolean {
  return (
    !status.is_default && status.title !== "New" && status.title !== "Completed"
  );
}

export function jobTypeTabToApiTypeChar(jobType: string): string {
  return jobType[0] ?? "R";
}
