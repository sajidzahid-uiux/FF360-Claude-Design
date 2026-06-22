"use client";

import { useMemo } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { DesignRequestService } from "@/api/services";
import type { DesignRequestSourceType } from "@/api/types/designRequest";
import { QUERY_KEYS } from "@/constants";

import { buildDesignRequestStatusMap } from "../lib/design-request-lifecycle";
import { useDesignRequestWs } from "./useDesignRequestWs";

export function useDesignRequestStatusMap(
  organizationId: string | undefined,
  sourceType: DesignRequestSourceType,
  targetIds: number[],
  enabled: boolean
) {
  const sortedIds = useMemo(
    () => [...new Set(targetIds.filter((id) => id > 0))].sort((a, b) => a - b),
    [targetIds]
  );

  const { data } = useQuery({
    queryKey: [
      QUERY_KEYS.DESIGN_REQUEST_STATUS,
      organizationId,
      sourceType,
      sortedIds.join(","),
    ],
    queryFn: () =>
      DesignRequestService.getStatusesForTargets(organizationId!, {
        jobIds: sourceType === "job" ? sortedIds : undefined,
        leadIds: sourceType === "lead" ? sortedIds : undefined,
      }),
    enabled: enabled && Boolean(organizationId) && sortedIds.length > 0,
  });

  return useMemo(() => buildDesignRequestStatusMap(data ?? []), [data]);
}

export function useDesignRequestListRealtimeSync(
  organizationId: string | undefined,
  enabled: boolean
) {
  const queryClient = useQueryClient();

  useDesignRequestWs({
    organizationId: organizationId ?? null,
    enabled: enabled && Boolean(organizationId),
    onEvent: (event) => {
      if (event.event === "design_request_status_changed") {
        void queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.DESIGN_REQUEST_STATUS, organizationId],
        });
      }
    },
  });
}
