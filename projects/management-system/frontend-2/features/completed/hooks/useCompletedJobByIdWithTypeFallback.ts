"use client";

import { useQuery } from "@tanstack/react-query";

import type { Job } from "@/api/types";
import { CACHE_TIME, JobOrLeadType, JobType } from "@/constants";
import axiosInstance from "@/lib/axios";

type UseCompletedJobByIdWithTypeFallbackArgs = {
  orgId: string | null;
  jobId: string;
  isArchived: boolean;
  rawTypeParam: string | null;
};

type UseCompletedJobByIdWithTypeFallbackResult = {
  jobData: Job | undefined;
  resolvedJobType: JobType;
  isLoading: boolean;
  allQueriesFinished: boolean;
  error: unknown;
};

/**
 * Resolves a completed job's type even when `?type=` is missing/invalid.
 * Strategy:
 * - if `type` is valid, fetch only that job type
 * - otherwise, try Repair -> Excavation -> Tiling until one succeeds
 */
export function useCompletedJobByIdWithTypeFallback({
  orgId,
  jobId,
  isArchived,
  rawTypeParam,
}: UseCompletedJobByIdWithTypeFallbackArgs): UseCompletedJobByIdWithTypeFallbackResult {
  const typeParam = rawTypeParam?.toUpperCase();
  const isValidTypeParam =
    typeParam === JobOrLeadType.REPAIR ||
    typeParam === JobOrLeadType.EXCAVATION ||
    typeParam === JobOrLeadType.TILING;

  const jobTypeFromUrl: JobType | null = isValidTypeParam
    ? typeParam === JobOrLeadType.REPAIR
      ? JobType.REPAIR
      : typeParam === JobOrLeadType.EXCAVATION
        ? JobType.EXCAVATION
        : JobType.TILING
    : null;

  const shouldResolveJobType = !isValidTypeParam;

  // When `?type` is missing/invalid, resolve by trying ALL job types.
  // When `?type` is valid, only fetch the matching job type.
  const shouldFetchRepair =
    shouldResolveJobType || jobTypeFromUrl === JobType.REPAIR;
  const shouldFetchExcavation =
    shouldResolveJobType || jobTypeFromUrl === JobType.EXCAVATION;
  const shouldFetchTiling =
    shouldResolveJobType || jobTypeFromUrl === JobType.TILING;

  const fetchJobByType = async (jobType: JobType) => {
    if (!orgId) throw new Error("Organization ID is required");

    const response = await axiosInstance.get(
      `ms/organizations/${orgId}/jobs/${jobType}/${jobId}/?archived=${isArchived}`
    );

    return response.data;
  };

  const repairQuery = useQuery({
    queryKey: ["completedJob", orgId, jobId, JobType.REPAIR, isArchived],
    queryFn: () => fetchJobByType(JobType.REPAIR),
    enabled: !!orgId && !!jobId && shouldFetchRepair,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  const excavationQuery = useQuery({
    queryKey: ["completedJob", orgId, jobId, JobType.EXCAVATION, isArchived],
    queryFn: () => fetchJobByType(JobType.EXCAVATION),
    enabled: !!orgId && !!jobId && shouldFetchExcavation,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  const tilingQuery = useQuery({
    queryKey: ["completedJob", orgId, jobId, JobType.TILING, isArchived],
    queryFn: () => fetchJobByType(JobType.TILING),
    enabled: !!orgId && !!jobId && shouldFetchTiling,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  const jobData = repairQuery.data ?? excavationQuery.data ?? tilingQuery.data;
  const isLoading =
    repairQuery.isLoading || excavationQuery.isLoading || tilingQuery.isLoading;

  const allQueriesFinished =
    !repairQuery.isLoading &&
    !excavationQuery.isLoading &&
    !tilingQuery.isLoading;

  const resolvedJobType: JobType = repairQuery.data
    ? JobType.REPAIR
    : excavationQuery.data
      ? JobType.EXCAVATION
      : JobType.TILING;

  const error = repairQuery.error ?? excavationQuery.error ?? tilingQuery.error;

  return {
    jobData,
    resolvedJobType,
    isLoading,
    allQueriesFinished,
    error,
  };
}
