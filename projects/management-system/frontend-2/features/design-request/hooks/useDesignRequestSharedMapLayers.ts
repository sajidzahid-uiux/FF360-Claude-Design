"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/api/client";
import { DesignRequestService } from "@/api/services";
import type { DesignRequestSourceType } from "@/api/types/designRequest";
import { QUERY_KEYS } from "@/constants";

import { pickLatestDesignRequestStatus } from "../lib/pick-latest-design-request-status";
import { extractSharedXmlMapLayers } from "../lib/shared-design-output";
import { useDesignRequestTargetStatus } from "./useDesignRequestTargetStatus";

export interface UseDesignRequestSharedMapLayersOptions {
  organizationId: string | undefined;
  sourceType: DesignRequestSourceType | undefined;
  sourceId: number | undefined;
  enabled: boolean;
}

export function useDesignRequestSharedMapLayers({
  organizationId,
  sourceType,
  sourceId,
  enabled,
}: UseDesignRequestSharedMapLayersOptions) {
  const { data: statusItems = [] } = useDesignRequestTargetStatus(
    organizationId,
    sourceType,
    sourceId,
    enabled
  );

  const requestId = useMemo(
    () => pickLatestDesignRequestStatus(statusItems)?.id ?? null,
    [statusItems]
  );

  const { data: sharedOutput } = useQuery({
    queryKey: [
      QUERY_KEYS.DESIGN_REQUEST_SHARED_OUTPUT,
      organizationId,
      requestId,
    ],
    queryFn: () =>
      DesignRequestService.getSharedOutput(organizationId!, requestId!),
    enabled: enabled && Boolean(organizationId && requestId != null),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 403) {
        return false;
      }
      return failureCount < 1;
    },
  });

  const supplementalXmlMaps = useMemo(
    () => extractSharedXmlMapLayers(sharedOutput),
    [sharedOutput]
  );

  return { supplementalXmlMaps, sharedOutput };
}
