"use client";

/**
 * LOCAL PROTOTYPE MOCK of `@auth0/auth0-react`.
 *
 * Wired in via a webpack/turbopack alias in next.config.js, but ONLY when
 * NEXT_PUBLIC_USE_MOCK_DATA === "true". In that mode the app is always
 * "authenticated" as a demo user, so PrivateRoute / AuthSync stop redirecting
 * to the Auth0 sign-in screen and the app boots straight into the shell.
 *
 * It re-implements just the surface the codebase actually imports:
 *   Auth0Provider, useAuth0 (isAuthenticated, isLoading, user,
 *   getAccessTokenSilently, loginWithRedirect, logout),
 *   withAuthenticationRequired (passthrough).
 */
import { ReactNode } from "react";

const DEMO_USER = {
  sub: "auth0|demo-user",
  email: "demo@fieldflow360.com",
  email_verified: true,
  name: "Demo User",
  nickname: "demo",
  given_name: "Demo",
  family_name: "User",
  picture: "",
  updated_at: "2026-01-01T00:00:00.000Z",
};

/** Build a structurally-valid JWT with a far-future exp so token checks pass. */
function buildMockJwt(): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: DEMO_USER.sub,
    email: DEMO_USER.email,
    email_verified: true,
    iat: 1700000000,
    exp: 4102444800, // year 2100
  };
  const enc = (obj: unknown) => {
    const json = JSON.stringify(obj);
    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      return window.btoa(json);
    }
    // SSR fallback
    return Buffer.from(json).toString("base64");
  };
  return `${enc(header)}.${enc(payload)}.mock-signature`;
}

const MOCK_TOKEN = buildMockJwt();

/**
 * Mock mode never walks the real login → org-picker flow, so the `lastOrgId`
 * cookie the auth flow relies on is never written. Without it AuthSync flags a
 * "fresh login" and `syncOrgFromUrl` bails, so `selectedOrganization` stays null
 * — the role query never runs and owner-gated UI (e.g. the Billing settings tab)
 * never appears. Seed it to the demo org so a deep link resolves the owner role.
 * (Only seeds when absent, so switching to org 2 still updates it normally.)
 */
if (
  typeof document !== "undefined" &&
  !/(?:^|;\s*)lastOrgId=/.test(document.cookie)
) {
  document.cookie = "lastOrgId=1; path=/; max-age=2592000";
}

export function Auth0Provider({ children }: { children: ReactNode }) {
  // No real Auth0 context needed — just render children.
  return <>{children}</>;
}

export function useAuth0() {
  return {
    isAuthenticated: true,
    isLoading: false,
    error: undefined,
    user: DEMO_USER,
    getAccessTokenSilently: async () => MOCK_TOKEN,
    getAccessTokenWithPopup: async () => MOCK_TOKEN,
    getIdTokenClaims: async () => ({ __raw: MOCK_TOKEN, ...DEMO_USER }),
    loginWithRedirect: async () => {
      // no-op in mock mode
    },
    loginWithPopup: async () => {
      // no-op in mock mode
    },
    logout: async () => {
      // no-op in mock mode (avoid redirecting to a real Auth0 tenant)
    },
    handleRedirectCallback: async () => ({ appState: undefined }),
  };
}

export function withAuthenticationRequired<P extends object>(
  Component: (props: P) => ReactNode
) {
  return function MockProtected(props: P) {
    return Component(props);
  };
}

export default { Auth0Provider, useAuth0, withAuthenticationRequired };
