/** Canonical auth and org-selection routes shared by CMS and Tile Design. */
export const FIELD_FLOW_AUTH_ROUTES = {
  signIn: '/sign-in',
  terms: '/terms',
  organizations: '/organizations',
  /** CMS Auth0 React SDK callback; Tile uses `/auth/login` middleware. */
  authCallback: '/auth/callback',
  verifyEmail: '/auth/verify-email',
} as const;

/** Query flag: user explicitly signed out; do not auto-redirect away from sign-in. */
export const SIGN_IN_FRESH_QUERY = 'fresh';

export function signInFreshPath(): string {
  return `${FIELD_FLOW_AUTH_ROUTES.signIn}?${SIGN_IN_FRESH_QUERY}=1`;
}

export function isSignInFreshPath(pathname: string, search: string): boolean {
  return (
    pathname === FIELD_FLOW_AUTH_ROUTES.signIn &&
    new URLSearchParams(search).get(SIGN_IN_FRESH_QUERY) === '1'
  );
}

export const FIELD_FLOW_ORG_CREATE_ROUTE = '/create';

/** Prefix for org-scoped app routes: `/organizations/[orgId]/...` */
export const FIELD_FLOW_ORG_ROUTE_PREFIX = '/organizations';

export const DEFAULT_ORGANIZATION_WELCOME_PATHS = [
  FIELD_FLOW_AUTH_ROUTES.organizations,
] as const;

export function orgScopedPath(
  orgId: string | number,
  ...segments: string[]
): string {
  const joined = segments
    .flatMap((segment) => segment.split('/'))
    .filter(Boolean)
    .join('/');
  const base = `${FIELD_FLOW_ORG_ROUTE_PREFIX}/${orgId}`;
  return joined ? `${base}/${joined}` : base;
}

export function isOrganizationScopedPath(pathname: string): boolean {
  return /^\/organizations\/\d+(?:\/|$)/.test(pathname);
}

/** Legacy URLs where org id was the first segment (`/123/dashboard`). */
export function isLegacyNumericOrgPath(pathname: string): boolean {
  return /^\/\d+(?:\/|$)/.test(pathname);
}

export function isPathUnderOrg(pathname: string, orgId: string | number): boolean {
  const prefix = `${FIELD_FLOW_ORG_ROUTE_PREFIX}/${orgId}`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function relativeOrgAppPath(pathname: string): string {
  const match = pathname.match(/^\/organizations\/\d+\/?(.*)$/);
  if (match) {
    return match[1] ?? '';
  }
  return pathname.startsWith('/') ? pathname.slice(1) : pathname;
}
