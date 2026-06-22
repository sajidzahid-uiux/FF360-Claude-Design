"use client";

import { useEffect, useRef } from "react";

import { StorageKey } from "@/hooks/storage-data";
import { getCookie } from "@/lib/cookies";

import {
  type DesignRequestWsEvent,
  buildDesignRequestWebSocketUrl,
  parseDesignRequestWsPayload,
} from "../lib/build-websocket-url";

export interface UseDesignRequestWsOptions {
  organizationId: string | null;
  enabled?: boolean;
  onEvent?: (event: DesignRequestWsEvent) => void;
}

export function useDesignRequestWs({
  organizationId,
  enabled = true,
  onEvent,
}: UseDesignRequestWsOptions) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled || !organizationId) return;

    const rawToken = getCookie(StorageKey.ACCESS_TOKEN);
    const accessToken = rawToken?.replace(/^JWT\s*/, "") || null;
    if (!accessToken) return;

    const wsUrl = buildDesignRequestWebSocketUrl(organizationId, accessToken);
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (message) => {
      const event = parseDesignRequestWsPayload(message.data);
      if (event) {
        onEventRef.current?.(event);
      }
    };

    return () => {
      socket.close();
    };
  }, [enabled, organizationId]);
}
