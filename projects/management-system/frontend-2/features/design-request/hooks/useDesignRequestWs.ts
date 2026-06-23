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
    // Dummy-data prototype: no backend, so never open a real socket.
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") return;

    const rawToken = getCookie(StorageKey.ACCESS_TOKEN);
    const accessToken = rawToken?.replace(/^JWT\s*/, "") || null;
    if (!accessToken) return;

    const wsUrl = buildDesignRequestWebSocketUrl(organizationId, accessToken);
    if (!wsUrl) return;
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
