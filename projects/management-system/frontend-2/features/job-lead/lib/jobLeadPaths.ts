import { JobLeadEntityType, ResourceType } from "@/constants";

import type { JobLeadRouteConfig } from "../model/jobLeadRouteConfig";

export function jobLeadListPath(
  entity: JobLeadEntityType,
  detailSegment: string
): string {
  return `/${entity}/${detailSegment}`;
}

export function jobLeadDetailPath(
  entity: JobLeadEntityType,
  detailSegment: string,
  id: string | number
): string {
  return `${jobLeadListPath(entity, detailSegment)}/${id}`;
}

export function jobLeadLogsPath(
  entity: JobLeadEntityType,
  detailSegment: string,
  id: string | number
): string {
  return `${jobLeadDetailPath(entity, detailSegment, id)}/logs`;
}

export function jobOnSiteTrackingPath(
  detailSegment: string,
  id: string | number
): string {
  return `/${JobLeadEntityType.JOBS}/${detailSegment}/${id}/on-site-tracking`;
}

export function jobLeadPathsFromConfig(config: JobLeadRouteConfig) {
  const entity =
    config.entity === ResourceType.JOB
      ? JobLeadEntityType.JOBS
      : JobLeadEntityType.LEADS;
  const segment = config.detailSegment;

  return {
    list: jobLeadListPath(entity, segment),
    detail: (id: string | number) => jobLeadDetailPath(entity, segment, id),
    logs: (id: string | number) => jobLeadLogsPath(entity, segment, id),
    onSiteTracking:
      config.entity === ResourceType.JOB
        ? (id: string | number) => jobOnSiteTrackingPath(segment, id)
        : undefined,
  };
}
