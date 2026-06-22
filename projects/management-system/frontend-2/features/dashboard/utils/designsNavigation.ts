import type {
  DesignsNeededByYouApiRecord,
  DesignsNeededByYouLegacyTuple,
} from "@/api/types/dashboard";
import {
  JobLeadEntityType,
  JobLeadTypeRouteSegment,
  JobOrLeadType,
  apiJobTypeToRouteSegment,
  isJobLeadEntityType,
} from "@/constants";

/** @deprecated Prefer {@link DesignsNeededByYouLegacyTuple} from `@/api/types`. */
export type DesignsNeededEntry = DesignsNeededByYouLegacyTuple;

/** Alias for API record shape (dashboard designs map). */
export type DesignsNeededByYouApiRow = DesignsNeededByYouApiRecord;

export type DesignsNavPermissions = {
  hasLeadsAccess: boolean;
  hasRepairJobAccess: boolean;
  hasExcavationJobAccess: boolean;
  hasTilingJobAccess: boolean;
};

export function isDesignsNeededLegacyTuple(
  value: unknown
): value is DesignsNeededByYouLegacyTuple {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "string" &&
    typeof value[1] === "string"
  );
}

export function isDesignsNeededApiRow(
  value: unknown
): value is DesignsNeededByYouApiRecord & { detail_api_path: string } {
  if (value === null || typeof value !== "object") return false;
  const v = value as DesignsNeededByYouApiRecord;
  return typeof v.detail_api_path === "string" && v.detail_api_path.length > 0;
}

/** `/ms/organizations/{orgId}/(jobs|leads)/{apiJobType}/{id}/` */
export function parseMsOrganizationsDetailPath(
  detailApiPath: string
): { resource: JobLeadEntityType; apiJobType: string; id: number } | null {
  const trimmed = detailApiPath.trim();
  const m = trimmed.match(
    /\/ms\/organizations\/\d+\/(jobs|leads)\/([^/]+)\/(\d+)\/?$/i
  );
  if (!m) return null;
  const resourceSegment = m[1].toLowerCase();
  if (!isJobLeadEntityType(resourceSegment)) return null;
  const resource = resourceSegment;
  const apiJobType = m[2];
  const id = parseInt(m[3], 10);
  if (Number.isNaN(id)) return null;
  return { resource, apiJobType, id };
}

function apiJobTypeToCompletedTypeParam(apiJobType: string): string {
  const n = apiJobType.toLowerCase().replace(/-/g, "_");
  if (n === "excavation") return JobOrLeadType.EXCAVATION;
  if (n === "repair") return JobOrLeadType.REPAIR;
  return JobOrLeadType.TILING;
}

/**
 * App path without org prefix, e.g. `/jobs/drainage-tiling/41227?archived=false`
 * (use with router helper that prefixes `/${orgId}`).
 * When `isCompleted` is true the path points to the completed-jobs detail view
 * (`/completed/{id}?archived=…&fromCompleted=true&type=T|E|R`) because the
 * backend may not yet reflect the completed state in `detail_api_path`.
 */
export function hrefFromDetailApiPath(
  detailApiPath: string,
  isArchived?: boolean,
  isCompleted?: boolean
): string | null {
  const parsed = parseMsOrganizationsDetailPath(detailApiPath);
  if (!parsed) return null;
  const segment = apiJobTypeToRouteSegment(parsed.apiJobType);
  if (!segment) return null;
  const arch = isArchived ? "true" : "false";
  if (isCompleted && parsed.resource === JobLeadEntityType.JOBS) {
    const type = apiJobTypeToCompletedTypeParam(parsed.apiJobType);
    return `/completed/${parsed.id}?archived=${arch}&fromCompleted=true&type=${type}`;
  }
  return `/${parsed.resource}/${segment}/${parsed.id}?archived=${arch}`;
}

export function canOpenDesignsNeededRow(
  detailApiPath: string,
  perms: DesignsNavPermissions
): boolean {
  const parsed = parseMsOrganizationsDetailPath(detailApiPath);
  if (!parsed) return false;
  const segment = apiJobTypeToRouteSegment(parsed.apiJobType);
  if (!segment) return false;

  if (parsed.resource === JobLeadEntityType.LEADS) {
    return perms.hasLeadsAccess;
  }

  if (segment === JobLeadTypeRouteSegment.DRAINAGE_TILING) {
    return perms.hasTilingJobAccess;
  }
  if (segment === JobLeadTypeRouteSegment.EXCAVATION) {
    return perms.hasExcavationJobAccess;
  }
  if (segment === JobLeadTypeRouteSegment.REPAIR) {
    return perms.hasRepairJobAccess;
  }
  return false;
}

export function inferDesignHref(
  entryKey: string,
  objectId: number | null
): string | null {
  const normalizedKey = entryKey.trim().toLowerCase();
  if (!normalizedKey) return null;

  // Backend may already send a concrete web path as the map key.
  if (normalizedKey.startsWith("/")) {
    return entryKey;
  }

  if (objectId == null) return null;

  const isLead = normalizedKey.includes("lead");
  const isJob = normalizedKey.includes("job");

  if (normalizedKey.includes("repair")) {
    return isLead
      ? `/leads/${JobLeadTypeRouteSegment.REPAIR}/${objectId}`
      : isJob
        ? `/jobs/${JobLeadTypeRouteSegment.REPAIR}/${objectId}`
        : null;
  }

  if (normalizedKey.includes("excavation")) {
    return isLead
      ? `/leads/${JobLeadTypeRouteSegment.EXCAVATION}/${objectId}`
      : isJob
        ? `/jobs/${JobLeadTypeRouteSegment.EXCAVATION}/${objectId}`
        : null;
  }

  if (normalizedKey.includes("tiling") || normalizedKey.includes("drainage")) {
    return isLead
      ? `/leads/${JobLeadTypeRouteSegment.DRAINAGE_TILING}/${objectId}`
      : isJob
        ? `/jobs/${JobLeadTypeRouteSegment.DRAINAGE_TILING}/${objectId}`
        : null;
  }

  return null;
}

export function parseDesignEntryId(entryKey: string): number | null {
  const parsed = Number(entryKey);
  return Number.isNaN(parsed) ? null : parsed;
}
