import { JobOrLeadType, JobType } from "./enums";

/**
 * Canonical job/lead category inside the app (route config keys, filters, map legend).
 * Use {@link JobLeadTypeRouteSegment} for Next.js URL paths.
 */
export enum JobLeadTypeSegment {
  TILING = "tiling",
  EXCAVATION = "excavation",
  REPAIR = "repair",
}

/** App router path segment under `/jobs|leads/` (tiling → `drainage-tiling`). */
export enum JobLeadTypeRouteSegment {
  DRAINAGE_TILING = "drainage-tiling",
  EXCAVATION = "excavation",
  REPAIR = "repair",
}

const SEGMENT_TO_ROUTE: Record<JobLeadTypeSegment, JobLeadTypeRouteSegment> = {
  [JobLeadTypeSegment.TILING]: JobLeadTypeRouteSegment.DRAINAGE_TILING,
  [JobLeadTypeSegment.EXCAVATION]: JobLeadTypeRouteSegment.EXCAVATION,
  [JobLeadTypeSegment.REPAIR]: JobLeadTypeRouteSegment.REPAIR,
};

const ROUTE_TO_SEGMENT: Record<JobLeadTypeRouteSegment, JobLeadTypeSegment> = {
  [JobLeadTypeRouteSegment.DRAINAGE_TILING]: JobLeadTypeSegment.TILING,
  [JobLeadTypeRouteSegment.EXCAVATION]: JobLeadTypeSegment.EXCAVATION,
  [JobLeadTypeRouteSegment.REPAIR]: JobLeadTypeSegment.REPAIR,
};

const SEGMENT_TO_JOB_TYPE: Record<JobLeadTypeSegment, JobType> = {
  [JobLeadTypeSegment.TILING]: JobType.TILING,
  [JobLeadTypeSegment.EXCAVATION]: JobType.EXCAVATION,
  [JobLeadTypeSegment.REPAIR]: JobType.REPAIR,
};

const JOB_TYPE_TO_SEGMENT: Record<JobType, JobLeadTypeSegment> = {
  [JobType.TILING]: JobLeadTypeSegment.TILING,
  [JobType.EXCAVATION]: JobLeadTypeSegment.EXCAVATION,
  [JobType.REPAIR]: JobLeadTypeSegment.REPAIR,
};

const JOB_OR_LEAD_TYPE_TO_SEGMENT: Record<JobOrLeadType, JobLeadTypeSegment> = {
  [JobOrLeadType.TILING]: JobLeadTypeSegment.TILING,
  [JobOrLeadType.EXCAVATION]: JobLeadTypeSegment.EXCAVATION,
  [JobOrLeadType.REPAIR]: JobLeadTypeSegment.REPAIR,
};

const SEGMENT_TO_JOB_OR_LEAD_TYPE: Record<JobLeadTypeSegment, JobOrLeadType> = {
  [JobLeadTypeSegment.TILING]: JobOrLeadType.TILING,
  [JobLeadTypeSegment.EXCAVATION]: JobOrLeadType.EXCAVATION,
  [JobLeadTypeSegment.REPAIR]: JobOrLeadType.REPAIR,
};

export function isJobLeadTypeSegment(
  value: string | null | undefined
): value is JobLeadTypeSegment {
  return (
    value === JobLeadTypeSegment.TILING ||
    value === JobLeadTypeSegment.EXCAVATION ||
    value === JobLeadTypeSegment.REPAIR
  );
}

export function isJobLeadTypeRouteSegment(
  value: string | null | undefined
): value is JobLeadTypeRouteSegment {
  return (
    value === JobLeadTypeRouteSegment.DRAINAGE_TILING ||
    value === JobLeadTypeRouteSegment.EXCAVATION ||
    value === JobLeadTypeRouteSegment.REPAIR
  );
}

/** Accepts route segment, canonical segment, or API-style `drainage_tiling`. */
export function parseJobLeadTypeRouteSegment(
  value: string | null | undefined
): JobLeadTypeRouteSegment | null {
  if (!value) return null;
  const normalized = value.toLowerCase().replace(/-/g, "_");
  if (
    normalized === JobType.TILING ||
    normalized === JobLeadTypeSegment.TILING
  ) {
    return JobLeadTypeRouteSegment.DRAINAGE_TILING;
  }
  if (
    normalized === JobType.EXCAVATION ||
    normalized === JobLeadTypeSegment.EXCAVATION
  ) {
    return JobLeadTypeRouteSegment.EXCAVATION;
  }
  if (
    normalized === JobType.REPAIR ||
    normalized === JobLeadTypeSegment.REPAIR
  ) {
    return JobLeadTypeRouteSegment.REPAIR;
  }
  return null;
}

export function normalizeJobLeadTypeSegment(
  routeOrSegment: JobLeadTypeRouteSegment | string
): JobLeadTypeSegment {
  if (isJobLeadTypeSegment(routeOrSegment)) {
    return routeOrSegment;
  }
  const route = parseJobLeadTypeRouteSegment(routeOrSegment);
  return route ? ROUTE_TO_SEGMENT[route] : JobLeadTypeSegment.REPAIR;
}

export function toJobLeadTypeRouteSegment(
  segment: JobLeadTypeSegment
): JobLeadTypeRouteSegment {
  return SEGMENT_TO_ROUTE[segment];
}

export function jobTypeToJobLeadTypeSegment(
  jobType: JobType
): JobLeadTypeSegment {
  return JOB_TYPE_TO_SEGMENT[jobType];
}

/** Scheduling/status filter letter (`T` / `E` / `R`) → canonical segment. */
export function jobOrLeadTypeToJobLeadTypeSegment(
  type: JobOrLeadType
): JobLeadTypeSegment {
  return JOB_OR_LEAD_TYPE_TO_SEGMENT[type];
}

export function jobLeadTypeSegmentToJobOrLeadType(
  segment: JobLeadTypeSegment
): JobOrLeadType {
  return SEGMENT_TO_JOB_OR_LEAD_TYPE[segment];
}

/**
 * Record/contact/equipment/farm API `job_type` query (`repair` | `excavation` | `tiling`).
 * @deprecated Use {@link JobLeadTypeSegment} directly — same values; RecordJobType removed.
 */
export type RecordApiJobType = JobLeadTypeSegment;

export function jobTypeToRecordApiJobType(
  jobType: JobType
): JobLeadTypeSegment {
  return jobTypeToJobLeadTypeSegment(jobType);
}

export function jobLeadTypeSegmentToJobType(
  segment: JobLeadTypeSegment
): JobType {
  return SEGMENT_TO_JOB_TYPE[segment];
}

export function jobTypeToRouteSegment(
  jobType: JobType
): JobLeadTypeRouteSegment {
  return toJobLeadTypeRouteSegment(jobTypeToJobLeadTypeSegment(jobType));
}

/** Parses API / MS path job type (`drainage_tiling`, `excavation`, `repair`). */
export function apiJobTypeToJobLeadTypeSegment(
  apiJobType: string
): JobLeadTypeSegment | null {
  const route = parseJobLeadTypeRouteSegment(apiJobType);
  return route ? ROUTE_TO_SEGMENT[route] : null;
}

export function apiJobTypeToRouteSegment(
  apiJobType: string
): JobLeadTypeRouteSegment | null {
  const segment = apiJobTypeToJobLeadTypeSegment(apiJobType);
  return segment ? toJobLeadTypeRouteSegment(segment) : null;
}

/** All canonical segments (scheduling `job_types` / `lead_types` query values). */
export const JOB_LEAD_TYPE_SEGMENTS_ALL: readonly JobLeadTypeSegment[] = [
  JobLeadTypeSegment.TILING,
  JobLeadTypeSegment.EXCAVATION,
  JobLeadTypeSegment.REPAIR,
];

/**
 * Loose label → canonical segment (map markers, filter chips, legend keys).
 * Handles `drainage_tiling`, `drainage-tiling`, `tile`, and substring matches.
 */
export function coerceJobLeadTypeSegment(
  value: string | null | undefined
): JobLeadTypeSegment {
  const parsed = apiJobTypeToJobLeadTypeSegment(value ?? "");
  if (parsed) return parsed;

  const lower = (value ?? "").toLowerCase();
  if (lower === "tile") return JobLeadTypeSegment.TILING;
  if (lower.includes("excavation")) return JobLeadTypeSegment.EXCAVATION;
  if (lower.includes("tiling") || lower.includes("drainage")) {
    return JobLeadTypeSegment.TILING;
  }
  if (lower.includes("repair")) return JobLeadTypeSegment.REPAIR;
  return JobLeadTypeSegment.REPAIR;
}
