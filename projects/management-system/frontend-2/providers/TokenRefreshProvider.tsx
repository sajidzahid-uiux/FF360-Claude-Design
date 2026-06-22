"use client";
// providers/token-refresh-provider.tsx
import { ReactNode, useCallback, useEffect, useRef } from "react";

import { useAuth0 } from "@auth0/auth0-react";

import { usePersistentStorage } from "@/hooks";
import { StorageKey } from "@/hooks/storage-data";
import { getCookie, setCookie } from "@/lib/cookies";

function isAuth0SessionError(error: unknown): error is { error: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as { error?: unknown }).error === "string"
  );
}

export default function TokenRefreshProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const storage = usePersistentStorage();
  const scheduleRefreshRef = useRef<(token: string) => void>(() => undefined);

  // Calculate time until token needs refresh (75% of its lifetime)
  const scheduleRefresh = useCallback(
    (token: string) => {
      try {
        // Parse token to get expiration time
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();

        // Calculate time until token is 75% through its lifetime
        const tokenLifetime = expirationTime - currentTime;
        const refreshTime = Math.max(tokenLifetime * 0.75, 60000); // At least 1 minute, or 75% of remaining time

        // Clear any existing timer
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
        }

        // Set timer to refresh token
        refreshTimerRef.current = setTimeout(async () => {
          try {
            const newToken = await getAccessTokenSilently({
              timeoutInSeconds: 60,
              cacheMode: "off",
            });
            setCookie(StorageKey.ACCESS_TOKEN, newToken, 7);

            // Schedule the next refresh
            scheduleRefreshRef.current(newToken);
          } catch (e: unknown) {
            if (
              isAuth0SessionError(e) &&
              (e.error === "login_required" || e.error === "consent_required")
            ) {
              console.error("Token refresh failed, session expired:", e);
            }
            console.error("Failed to refresh token:", e);
          }
        }, refreshTime);
      } catch (error) {
        console.error("Error scheduling token refresh:", error);
      }
    },
    [getAccessTokenSilently]
  );

  // Keep ref pointing at the latest callback for recursion from setTimeout
  scheduleRefreshRef.current = scheduleRefresh;

  useEffect(() => {
    // Only run this effect if the user is authenticated and auth loading is complete
    if (isLoading || !isAuthenticated) return;

    // Initialize token refresh on mount if user is authenticated
    const initializeTokenRefresh = async () => {
      let token = getCookie(StorageKey.ACCESS_TOKEN);

      // If no token exists or it can't be parsed, get a new one
      if (!token) {
        try {
          token = await getAccessTokenSilently({
            timeoutInSeconds: 60,
            cacheMode: "off",
          });
          setCookie(StorageKey.ACCESS_TOKEN, token, 7);
        } catch (e: unknown) {
          if (
            isAuth0SessionError(e) &&
            (e.error === "login_required" || e.error === "consent_required")
          ) {
            console.error(
              "Initial token retrieval failed, session expired:",
              e
            );
          }
          console.error("Failed to get initial token:", e);
          return;
        }
      }

      // Schedule refresh
      if (token) {
        scheduleRefresh(token);
      }
    };

    initializeTokenRefresh();

    // Cleanup
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    storage,
    scheduleRefresh,
  ]);

  // Just render children - this component only handles token refresh
  return <>{children}</>;
}
