'use client';

import { useEffect, useRef } from 'react';

import { ORGANIZATION_PICKER_QUERY } from './organizationPicker';

export interface UseOrganizationPickerFromQueryOptions {
  pathname: string | null;
  /** Welcome landing path, e.g. `/organizations` or `/choose-org`. */
  welcomePath: string;
  isAuthenticated: boolean;
  isInitializing: boolean;
  organizationsCount: number;
  openPicker: () => void;
  replacePath: (path: string) => void;
  /** When true, skip auto-open on `/auth`, `/sign-in`, etc. */
  skipAuthRoutes?: boolean;
  /** When true, do not auto-open on org-scoped app routes (user already picked an org). */
  isOrgScopedPath?: (pathname: string) => boolean;
}

function isAuthLikeRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/login')
  );
}

/**
 * Opens the organization switcher once after sign-in when `?pick_org=1` is present,
 * or on other authenticated routes when the user has orgs but no scoped org path.
 */
export function useOrganizationPickerFromQuery({
  pathname,
  welcomePath,
  isAuthenticated,
  isInitializing,
  organizationsCount,
  openPicker,
  replacePath,
  skipAuthRoutes = true,
  isOrgScopedPath,
}: UseOrganizationPickerFromQueryOptions): void {
  const hasShownInitialRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || isInitializing) return;
    if (organizationsCount === 0) return;
    if (hasShownInitialRef.current) return;

    if (skipAuthRoutes && isAuthLikeRoute(pathname)) return;

    if (pathname && isOrgScopedPath?.(pathname)) {
      hasShownInitialRef.current = true;
      return;
    }

    if (pathname === welcomePath) {
      const params = new URLSearchParams(window.location.search);
      if (params.get(ORGANIZATION_PICKER_QUERY) === '1') {
        openPicker();
        hasShownInitialRef.current = true;
        params.delete(ORGANIZATION_PICKER_QUERY);
        const qs = params.toString();
        replacePath(qs ? `${welcomePath}?${qs}` : welcomePath);
        return;
      }
      hasShownInitialRef.current = true;
      return;
    }

    openPicker();
    hasShownInitialRef.current = true;
  }, [
    isAuthenticated,
    isInitializing,
    organizationsCount,
    pathname,
    welcomePath,
    openPicker,
    replacePath,
    skipAuthRoutes,
    isOrgScopedPath,
  ]);
}
