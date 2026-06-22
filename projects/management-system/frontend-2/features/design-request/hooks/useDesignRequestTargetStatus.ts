"use client";

import { useQuery } from "@tanstack/react-query";

import { DesignRequestService } from "@/api/services";
import type { DesignRequestSourceType } from "@/api/types/designRequest";
import { QUERY_KEYS } from "@/constants";

export function designRequestTargetStatusQueryKey(
  organizationId: string,
  sourceType: DesignRequestSourceType,
  sourceId: number
) {
  return [
    QUERY_KEYS.DESIGN_REQUEST_STATUS,
    organizationId,
    sourceType,
    sourceId,
  ] as const;
}

export function useDesignRequestTargetStatus(
  organizationId: string | undefined,
  sourceType: DesignRequestSourceType | undefined,
  sourceId: number | undefined,
  enabled: boolean
) {
  return useQuery({
    queryKey: designRequestTargetStatusQueryKey(
      organizationId ?? "",
      sourceType ?? "job",
      sourceId ?? 0
    ),
    queryFn: () =>
      DesignRequestService.getStatusesForTargets(organizationId!, {
        jobIds: sourceType === "job" ? [sourceId!] : undefined,
        leadIds: sourceType === "lead" ? [sourceId!] : undefined,
      }),
    enabled: Boolean(enabled && organizationId && sourceType && sourceId),
  });
}
