import {
  DEFAULT_ORGANIZATION_WELCOME_PATHS,
  FIELD_FLOW_AUTH_ROUTES,
} from '../../../constants/fieldFlowAuthRoutes';

/** Query flag on the org welcome route so the picker opens once after sign-in. */
export const ORGANIZATION_PICKER_QUERY = 'pick_org';

export { DEFAULT_ORGANIZATION_WELCOME_PATHS };

/** @deprecated Use {@link FIELD_FLOW_AUTH_ROUTES}. */
export const AUTH_ROUTES = FIELD_FLOW_AUTH_ROUTES;

/**
 * Appends a one-time query flag so the welcome page opens the org switcher after Auth0.
 * Refresh without this param does not re-open the modal.
 */
export function withOrganizationPickerAfterAuth(
  returnToPath: string,
  welcomePaths: readonly string[] = DEFAULT_ORGANIZATION_WELCOME_PATHS
): string {
  try {
    const url = new URL(returnToPath, 'https://internal.local');
    if (!welcomePaths.includes(url.pathname)) {
      return returnToPath;
    }
    url.searchParams.set(ORGANIZATION_PICKER_QUERY, '1');
    return `${url.pathname}${url.search}`;
  } catch {
    return returnToPath;
  }
}
