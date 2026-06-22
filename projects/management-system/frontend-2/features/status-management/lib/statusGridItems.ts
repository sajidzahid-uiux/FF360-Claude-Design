import type {
  OrganizationLeadStatusSetting,
  OrganizationLeadTypeSetting,
  PaymentStatus,
  ProjectType,
} from "@/api/types";
import type { TransformedJobStatus } from "@/utils/transformJobStatuses";

import type { StatusItemRow } from "../ui/StatusGridCard";
import {
  canDeleteJobStatus,
  formatJobStatusTitle,
  getJobStatusSubtitle,
  getLeadSourceSubtitle,
  getLeadStatusSubtitle,
} from "./statusLabels";

export function toJobStatusGridItem(
  status: TransformedJobStatus
): StatusItemRow {
  return {
    id: status.id,
    title: formatJobStatusTitle(status.title),
    subtitle: getJobStatusSubtitle(status),
    color: status.color,
    order: status.number,
    canDelete: canDeleteJobStatus(status),
  };
}

export function toLeadStatusGridItem(
  status: OrganizationLeadStatusSetting
): StatusItemRow {
  return {
    id: status.id,
    title: status.title,
    subtitle: getLeadStatusSubtitle(status),
    color: status.color,
    canDelete: !status.is_default,
  };
}

export function toLeadTypeGridItem(
  status: OrganizationLeadTypeSetting
): StatusItemRow {
  return {
    id: status.id,
    title: status.title,
    subtitle: getLeadSourceSubtitle(status),
    color: status.color,
    canDelete: !status.is_default,
  };
}

export function toPaymentStatusGridItem(status: PaymentStatus): StatusItemRow {
  return {
    id: status.id,
    title: status.title,
    subtitle: status.is_default ? "Default type" : "Custom type",
    color: status.color,
    canDelete: !status.is_default,
  };
}

export function toProjectTypeGridItem(projectType: ProjectType): StatusItemRow {
  return {
    id: projectType.id,
    title: projectType.name,
    subtitle: projectType.is_default
      ? "Default type · Cannot be deleted"
      : "Custom type",
    color: projectType.color,
    canDelete: !projectType.is_default,
  };
}
