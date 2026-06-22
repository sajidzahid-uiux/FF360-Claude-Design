import type { ReactNode } from 'react';

export interface AuthSignInBrandProps {
  /** Small product label shown above the logo. */
  appTitle?: string;
  /** Primary heading (default: Sign in). */
  title?: string;
  /** Supporting copy under the heading. */
  description?: string;
  /** @deprecated Use {@link AuthSignInBrandProps.description}. */
  info?: string;
  /** Custom logo node (SVG, icon, etc.). Takes precedence over {@link logoSrc}. */
  logo?: ReactNode;
  /** Image URL when not passing {@link logo}. */
  logoSrc?: string;
  logoAlt?: string;
  /** Accent animation on the default FieldFlow mark when no custom logo is provided. */
  animateDefaultLogo?: boolean;
}

export function resolveAuthSignInDescription(
  props: Pick<AuthSignInBrandProps, 'description' | 'info'>,
  fallback: string
): string {
  return props.description ?? props.info ?? fallback;
}
