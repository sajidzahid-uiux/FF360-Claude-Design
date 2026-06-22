import { ORGANIZATION_PREFIX, orgPath } from "@/shared/config/routes";

export const AUTH_ROUTES = {
  signIn: "/sign-in",
  terms: "/terms",
  organizations: "/organizations",
  authCallback: "/auth/callback",
  verifyEmail: "/auth/verify-email",
} as const;

export const SIGN_IN_FRESH_QUERY = "fresh";

export function signInFreshPath(): string {
  return `${AUTH_ROUTES.signIn}?${SIGN_IN_FRESH_QUERY}=1`;
}

export function signInFreshUrl(): string {
  if (typeof window === "undefined") {
    return signInFreshPath();
  }
  return `${window.location.origin}${signInFreshPath()}`;
}

/** Auth0 Allowed Logout URLs are usually the app origin (e.g. http://localhost:3000). */
export function signInLogoutReturnUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.location.origin;
}

export const BILLING_ROUTES = {
  success: "/success",
} as const;

export const ORG_CREATE_ROUTE = "/create";
export const ORG_ROUTE_PREFIX = ORGANIZATION_PREFIX;
export const ORGANIZATION_PICKER_QUERY = "pick_org";
export const DEFAULT_ORGANIZATION_WELCOME_PATHS = [
  AUTH_ROUTES.organizations,
] as const;

export function orgScopedPath(
  orgId: string | number,
  ...segments: string[]
): string {
  const joined = segments
    .flatMap((segment) => segment.split("/"))
    .filter(Boolean)
    .join("/");
  return orgPath(orgId, joined);
}

export function isOrganizationScopedPath(pathname: string): boolean {
  return /^\/organizations\/\d+(?:\/|$)/.test(pathname);
}

/** Legacy `/123/...` URLs; handled by `next.config.js` redirects to `/organizations/123/...`. */
export function isLegacyNumericOrgPath(pathname: string): boolean {
  return /^\/\d+(?:\/|$)/.test(pathname);
}

export function isPathUnderOrg(
  pathname: string,
  orgId: string | number
): boolean {
  const prefix = `${ORG_ROUTE_PREFIX}/${orgId}`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function relativeOrgAppPath(pathname: string): string {
  const match = pathname.match(/^\/organizations\/\d+\/?(.*)$/);
  if (match) return match[1] ?? "";
  return pathname.startsWith("/") ? pathname.slice(1) : pathname;
}

export function withOrganizationPickerAfterAuth(
  returnToPath: string,
  welcomePaths: readonly string[] = DEFAULT_ORGANIZATION_WELCOME_PATHS
): string {
  try {
    const url = new URL(returnToPath, "https://internal.local");
    if (!welcomePaths.includes(url.pathname)) {
      return returnToPath;
    }
    url.searchParams.set(ORGANIZATION_PICKER_QUERY, "1");
    return `${url.pathname}${url.search}`;
  } catch {
    return returnToPath;
  }
}

export function orgDashboardPath(orgId: string | number): string {
  return orgScopedPath(orgId, "dashboard");
}

export function orgSubscribePath(orgId: string | number): string {
  return orgScopedPath(orgId, "subscribe");
}

/** Routes rendered without the authenticated app shell (sidebar, PrivateRoute). */
export function isPublicAppShellPath(pathname: string): boolean {
  if (!pathname) return false;

  return (
    pathname === AUTH_ROUTES.signIn ||
    pathname === AUTH_ROUTES.terms ||
    pathname === AUTH_ROUTES.organizations ||
    pathname === ORG_CREATE_ROUTE ||
    pathname === BILLING_ROUTES.success ||
    pathname === "/subscribe" ||
    pathname.includes("/subscribe") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/help-center") ||
    pathname.startsWith("/user/") ||
    // LOCAL PROTOTYPE: design/prototyping hub renders standalone (no auth
    // gate, no org sidebar) so it's reachable without selecting an org.
    pathname === "/hub" ||
    pathname.startsWith("/design-system") ||
    pathname.startsWith("/flows") ||
    isLegacyNumericOrgPath(pathname)
  );
}

/** Paths where org membership checks in PrivateRoute are skipped. */
export function isOrgSelectionExemptPath(pathname: string): boolean {
  return pathname === "/" || isPublicAppShellPath(pathname);
}
