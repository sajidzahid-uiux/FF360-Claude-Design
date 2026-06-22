"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode, Suspense, useCallback, useEffect, useState } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

import { CACHE_TIME } from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  useDebounceNavigation,
  useOrganizationData,
  usePersistentStorage,
  useRouteIds,
} from "@/hooks";
import { StorageKey } from "@/hooks/storage-data";
import {
  AUTH_ROUTES,
  isOrgSelectionExemptPath,
  isPathUnderOrg,
  orgScopedPath,
  relativeOrgAppPath,
} from "@/lib/auth-routes";
import { getCookie, setCookie } from "@/lib/cookies";

interface PrivateRouteProps {
  children: ReactNode;
}

function PrivateRouteInvitationTokenSync() {
  const searchParams = useSearchParams();
  const storage = usePersistentStorage();

  useEffect(() => {
    const rawToken =
      searchParams.get("token") || storage.getItem("invitationToken");
    if (rawToken) {
      const token = rawToken.replace(/\/$/, "");
      storage.setItem("invitationToken", token);
    }
  }, [searchParams, storage]);

  return null;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const pathname = usePathname();
  const { navigateTo } = useDebounceNavigation();
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } =
    useAuth0();
  const [isValidating, setIsValidating] = useState(true);
  const { data: organizations, isLoading: isLoadingOrgs } =
    useOrganizationData();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const { orgId } = useRouteIds();
  const { selectedOrganization } = useAuth();

  // Token validation function
  const validateOrRefreshToken = useCallback(async () => {
    const token = getCookie(StorageKey.ACCESS_TOKEN);
    let tokenIsValid = false;

    if (token) {
      try {
        // Check if token is expired
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds

        // Add a buffer of 5 minutes to prevent edge cases
        const bufferTime = CACHE_TIME.STALE;
        if (Date.now() < expirationTime - bufferTime) {
          tokenIsValid = true;
        }
      } catch (error) {
        console.error("Token parsing failed, will get new token", error);
      }
    }

    if (!tokenIsValid) {
      // Get a fresh token
      try {
        const newToken = await getAccessTokenSilently({
          timeoutInSeconds: 60,
          cacheMode: "off",
        });
        setCookie(StorageKey.ACCESS_TOKEN, newToken, 7);
      } catch (e: unknown) {
        const authError = e as { error?: string };
        if (
          authError.error === "login_required" ||
          authError.error === "consent_required"
        ) {
          console.error("Token refresh failed, redirecting to sign-in:", e);
          navigateTo(AUTH_ROUTES.signIn);
        }
        console.error("Failed to get new access token:", e);
        throw new Error("Token refresh failed");
      }
    }
  }, [getAccessTokenSilently, navigateTo]);

  // Primary authentication check
  useEffect(() => {
    const checkAuthentication = async () => {
      // Not logged in - redirect to sign-in
      if (!isLoading && !isAuthenticated) {
        navigateTo(AUTH_ROUTES.signIn);
        return;
      }

      // Logged in but email not verified
      if (isAuthenticated && user && user.email_verified === false) {
        navigateTo(AUTH_ROUTES.verifyEmail);
        return;
      }

      // User is authenticated with verified email
      if (isAuthenticated && user && user.email_verified) {
        try {
          // Validate or refresh token
          await validateOrRefreshToken();

          // If we reach here, token is valid
          setIsValidating(false);
          setAuthCheckComplete(true);
        } catch (error) {
          console.error("Token validation failed:", error);
          navigateTo(AUTH_ROUTES.signIn);
        }
      }
    };

    if (!isLoading) {
      checkAuthentication();
    }
  }, [isAuthenticated, isLoading, user, navigateTo, validateOrRefreshToken]);

  // Organization check - runs only after auth is confirmed
  useEffect(() => {
    if (authCheckComplete && !isLoadingOrgs) {
      const currentPathname = pathname || window.location.pathname;

      if (isOrgSelectionExemptPath(currentPathname)) {
        return;
      }

      // If user has no organizations
      if (!organizations || organizations.length === 0) {
        navigateTo(AUTH_ROUTES.organizations);
        return;
      }

      const isOrgScopedRoute = orgId !== null;

      if (isOrgScopedRoute) {
        const hasAccess = organizations.some(
          (org) => String(org.id) === String(orgId)
        );

        if (!hasAccess) {
          console.warn(`User does not have access to organization: ${orgId}`, {
            orgId,
            availableOrgs: organizations.map((o) => o.id),
          });
          navigateTo(AUTH_ROUTES.organizations);
          return;
        }
      } else if (organizations.length > 0) {
        if (selectedOrganization) {
          const hasAccessToSelected = organizations.some(
            (org) => String(org.id) === String(selectedOrganization)
          );

          if (hasAccessToSelected) {
            if (!isPathUnderOrg(currentPathname, selectedOrganization)) {
              navigateTo(
                orgScopedPath(
                  selectedOrganization,
                  relativeOrgAppPath(currentPathname)
                )
              );
              return;
            }
          }
        }

        const lastOrgId = getCookie("lastOrgId");

        if (lastOrgId && !selectedOrganization) {
          const hasAccessToLastOrg = organizations.some(
            (org) => String(org.id) === String(lastOrgId)
          );

          if (hasAccessToLastOrg) {
            if (!isPathUnderOrg(currentPathname, lastOrgId)) {
              navigateTo(
                orgScopedPath(lastOrgId, relativeOrgAppPath(currentPathname))
              );
              return;
            }
          }
        }
        navigateTo(AUTH_ROUTES.organizations);
        return;
      }
    }
  }, [
    authCheckComplete,
    isLoadingOrgs,
    organizations,
    navigateTo,
    orgId,
    pathname,
    selectedOrganization,
  ]);

  // Show loading state during any async operations
  if (isLoading || isValidating || (authCheckComplete && isLoadingOrgs)) {
    return <Loader className="min-h-screen" size={ComponentSizeEnum.LG} />;
  }

  // Only render children when all checks are complete
  return authCheckComplete ? (
    <>
      <Suspense fallback={null}>
        <PrivateRouteInvitationTokenSync />
      </Suspense>
      {children}
    </>
  ) : null;
}
