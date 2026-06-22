"use client";

import { useCallback, useEffect, useRef } from "react";

import { AuthService } from "@/api/services";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** ~280s so the server's 300s TTL doesn't expire between heartbeats */
const HEARTBEAT_INTERVAL_MS = 280 * 1000;

/**
 * Sends a web-activity heartbeat periodically while the user is on the web app.
 * When suppress_push_when_web_active is true, the server uses this to suppress
 * mobile push; in-app and email are unchanged.
 */
export function useWebActivityHeartbeat() {
  const { currentUser } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendHeartbeat = useCallback(async () => {
    if (
      typeof document !== "undefined" &&
      document.visibilityState !== "visible"
    ) {
      return;
    }
    try {
      await AuthService.reportWebActivity();
    } catch {
      // Ignore errors; next interval will retry
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    sendHeartbeat();

    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentUser?.id, sendHeartbeat]);
}
