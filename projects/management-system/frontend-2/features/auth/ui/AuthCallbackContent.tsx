"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import { Loader } from "@fieldflow360/org-ui";

import { usePersistentStorage } from "@/hooks";
import { StorageKey } from "@/hooks/storage-data";
import {
  AUTH_ROUTES,
  orgDashboardPath,
  withOrganizationPickerAfterAuth,
} from "@/lib/auth-routes";
import { getCookie, setCookie } from "@/lib/cookies";

export function AuthCallbackContent() {
  const {
    isLoading,
    isAuthenticated,
    error: auth0Error,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storage = usePersistentStorage();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      if (isLoading) return;

      if (auth0Error) {
        console.error("Auth0 Error:", auth0Error);
        setError("Authentication failed. Please try again.");
        return;
      }

      if (!isAuthenticated) {
        console.warn(
          "User is not authenticated. Waiting for Auth0 React to handle it."
        );
        return;
      }

      try {
        const token = await getAccessTokenSilently({
          cacheMode: "cache-only",
        });

        if (!token) {
          throw new Error("Token missing from cache");
        }

        setCookie(StorageKey.ACCESS_TOKEN, token, 7);

        const stateParam = searchParams.get("state");
        const lastOrgId = getCookie("lastOrgId");
        let redirectTo = lastOrgId
          ? orgDashboardPath(lastOrgId)
          : withOrganizationPickerAfterAuth(AUTH_ROUTES.organizations);
        if (stateParam) {
          try {
            const stateObj = JSON.parse(decodeURIComponent(stateParam));
            if (stateObj.returnTo) {
              redirectTo = stateObj.returnTo;
            }
          } catch (err) {
            console.warn("Invalid state param:", err);
          }
        }

        router.replace(redirectTo);
      } catch (e: unknown) {
        console.error("Token retrieval failed:", e);

        const authError = e as { error?: string; message?: string };
        if (
          authError.error === "login_required" ||
          authError.message === "Token missing from cache"
        ) {
          console.warn("Token retrieval failed, redirecting to sign-in...");
          router.replace(AUTH_ROUTES.signIn);
        } else {
          setError(
            "Authentication failed. Please try again or check your browser settings."
          );
        }
      }
    };

    handleAuth();
  }, [
    isLoading,
    isAuthenticated,
    auth0Error,
    getAccessTokenSilently,
    loginWithRedirect,
    router,
    searchParams,
    storage,
  ]);

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return <Loader text="Completing sign-in..." />;
}
