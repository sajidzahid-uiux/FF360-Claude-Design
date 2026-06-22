"use client";

import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";

import type { DesignRequestSourceType } from "@/api/types/designRequest";

import { handleDesignRequestWsEvent } from "../lib/handle-design-request-ws-event";
import { useDesignRequestWs } from "./useDesignRequestWs";

export interface UseDesignRequestRealtimeSyncOptions {
  organizationId: string | undefined;
  sourceType: DesignRequestSourceType | undefined;
  sourceId: number | undefined;
  trackedRequestIds: number[];
  enabled: boolean;
}

export function useDesignRequestRealtimeSync({
  organizationId,
  sourceType,
  sourceId,
  trackedRequestIds,
  enabled,
}: UseDesignRequestRealtimeSyncOptions) {
  const queryClient = useQueryClient();

  const onEvent = useCallback(
    (event: Parameters<typeof handleDesignRequestWsEvent>[1]) => {
      if (!organizationId || !sourceType || sourceId == null) return;
      handleDesignRequestWsEvent(queryClient, event, {
        organizationId,
        sourceType,
        sourceId,
        trackedRequestIds,
      });
    },
    [organizationId, queryClient, sourceId, sourceType, trackedRequestIds]
  );

  useDesignRequestWs({
    organizationId: organizationId ?? null,
    enabled: enabled && Boolean(organizationId),
    onEvent,
  });
}
