import { ReactNode } from 'react';

import { cn } from '../../../utils/cn';
import { AuthHeroImagePanel } from './AuthHeroImagePanel';

export interface AuthSignInLayoutProps {
  children: ReactNode;
  heroImageSrc?: string;
  heroImageAlt?: string;
  /** Brand block pinned to the top-left of the form panel (outside the centered form column). */
  cornerBrand?: ReactNode;
}

/** Sign-in shell: form on the left, hero image on the right from `lg` breakpoint. */
export function AuthSignInLayout({
  children,
  heroImageSrc = '/login-image.png',
  heroImageAlt = 'Authentication background',
  cornerBrand,
}: AuthSignInLayoutProps) {
  return (
    <div className="ff-auth-split-shell">
      <div className="bg-bg-surface-elevated ff-auth-split-content relative">
        {cornerBrand ? (
          <div className="pointer-events-none absolute top-5 left-4 z-10 sm:top-8 sm:left-8 lg:left-10">
            {cornerBrand}
          </div>
        ) : null}
        <div
          className={cn(
            'ff-auth-split-scroll flex items-center justify-center px-4 sm:px-6 lg:px-8',
            cornerBrand && 'pt-24 sm:pt-28'
          )}
        >
          <div className="w-full max-w-md py-8">{children}</div>
        </div>
      </div>

      <AuthHeroImagePanel heroImageAlt={heroImageAlt} heroImageSrc={heroImageSrc} />
    </div>
  );
}
