import type { ContactSummaryPartial } from "@/api/types";
import { JobLeadEntityType, JobType, LeadType } from "@/constants";
import { orgPath } from "@/shared/config/routes";
import { formatContactWithFarm } from "@/shared/lib/formatContactWithFarm";

export function buildJobLeadDetailBreadcrumbPath(
  orgId: string | number,
  entity: JobLeadEntityType,
  detailSegment: string,
  id: string | number
): string {
  return orgPath(orgId, `/${entity}/${detailSegment}/${id}`);
}

export function getJobLeadRecordBreadcrumbLabel(
  contactInfo?: { full_name?: string | null } | null,
  farmName?: string | null
): string | undefined {
  const name = contactInfo?.full_name?.trim();
  if (!name) return undefined;
  return formatContactWithFarm(name, farmName ?? null);
}

export function getJobListBadgeLabel(jobType: JobType): string {
  if (jobType === JobType.REPAIR) return "Repair Jobs";
  if (jobType === JobType.EXCAVATION) return "Excavation Jobs";
  return "Tile Jobs";
}

export function getLeadListBadgeLabel(leadType: LeadType): string {
  if (leadType === LeadType.REPAIR) return "Repair Lead";
  if (leadType === LeadType.EXCAVATION) return "Excavation Lead";
  return "Tile Lead";
}

export function getJobLeadLogPageSubtitle(
  contactInfo?: ContactSummaryPartial | null
): string {
  const name = contactInfo?.full_name?.trim();
  if (!name) return "No contact information";
  const phone =
    contactInfo?.phone_number?.trim() ||
    contactInfo?.home_phone_number?.trim() ||
    "N/A";
  return `${name} – ${phone}`;
}
