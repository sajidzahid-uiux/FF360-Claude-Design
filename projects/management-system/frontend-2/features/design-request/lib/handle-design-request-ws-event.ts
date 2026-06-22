import type { QueryClient } from "@tanstack/react-query";

import type { DesignRequestSourceType } from "@/api/types/designRequest";
import { QUERY_KEYS } from "@/constants";

import type { DesignRequestWsEvent } from "./build-websocket-url";

export interface DesignRequestWsHandlerContext {
  organizationId: string;
  sourceType: DesignRequestSourceType;
  sourceId: number;
  trackedRequestIds: number[];
}

export function isDesignRequestWsEventForTarget(
  event: DesignRequestWsEvent,
  trackedRequestIds: number[]
): boolean {
  if (!("design_request_id" in event)) return true;
  if (trackedRequestIds.length === 0) return true;
  return trackedRequestIds.includes(event.design_request_id);
}

export function handleDesignRequestWsEvent(
  queryClient: QueryClient,
  event: DesignRequestWsEvent,
  context: DesignRequestWsHandlerContext
): void {
  if (!isDesignRequestWsEventForTarget(event, context.trackedRequestIds)) {
    return;
  }

  const { organizationId, sourceType, sourceId } = context;

  if (event.event === "design_request_status_changed") {
    void queryClient.invalidateQueries({
      queryKey: [
        QUERY_KEYS.DESIGN_REQUEST_STATUS,
        organizationId,
        sourceType,
        sourceId,
      ],
    });
    return;
  }

  if (
    event.event === "note_added" ||
    event.event === "note_updated" ||
    event.event === "note_deleted"
  ) {
    void queryClient.invalidateQueries({
      queryKey: [
        QUERY_KEYS.DESIGN_REQUEST_NOTES,
        organizationId,
        event.design_request_id,
      ],
    });
    return;
  }

  if (event.event === "shared_output_updated") {
    void queryClient.invalidateQueries({
      queryKey: [
        QUERY_KEYS.DESIGN_REQUEST_SHARED_OUTPUT,
        organizationId,
        event.design_request_id,
      ],
    });
  }
}
