"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";

import { WS_URL } from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOnlineMembersStore } from "@/features/messaging/model/online-members-store";
import { StorageKey } from "@/hooks/storage-data";
import { getCookie } from "@/lib/cookies";

export function OnlineMembersSync({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { selectedOrganization } = useAuth();
  const setOnlineMembers = useOnlineMembersStore(
    (state) => state.setOnlineMembers
  );
  const resetOnlineMembers = useOnlineMembersStore((state) => state.reset);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const syncAccessToken = () => {
      const rawToken = getCookie(StorageKey.ACCESS_TOKEN);
      setAccessToken(rawToken?.replace(/^JWT\s*/, "") || null);
    };

    syncAccessToken();

    window.addEventListener("focus", syncAccessToken);
    document.addEventListener("visibilitychange", syncAccessToken);

    return () => {
      window.removeEventListener("focus", syncAccessToken);
      document.removeEventListener("visibilitychange", syncAccessToken);
    };
  }, [isClient]);

  const wsUrl = useMemo(() => {
    if (!isClient || !selectedOrganization || !WS_URL || !accessToken) {
      return "";
    }

    return `${WS_URL}ws/online_users/${selectedOrganization}/?token=${accessToken}`;
  }, [accessToken, isClient, selectedOrganization]);

  useEffect(() => {
    if (!wsUrl) {
      resetOnlineMembers();
      return;
    }

    const websocket = new WebSocket(wsUrl);

    websocket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as {
          event?: string;
          members?: unknown[];
        };
        if (parsed.event !== "organization_online_list") return;

        setOnlineMembers(
          (parsed.members ?? []).filter(
            (member): member is number => typeof member === "number"
          )
        );
      } catch {
        // ignore malformed payloads
      }
    };

    return () => {
      websocket.close();
    };
  }, [resetOnlineMembers, setOnlineMembers, wsUrl]);

  return <>{children}</>;
}
