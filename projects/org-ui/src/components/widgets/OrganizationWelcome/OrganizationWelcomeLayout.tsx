import { ReactNode } from 'react';

import { AuthHeroImagePanel } from '../AuthSignIn/AuthHeroImagePanel';

export interface OrganizationWelcomeLayoutProps {
  children: ReactNode;
  heroImageSrc?: string;
  heroImageAlt?: string;
}

/**
 * Post-sign-in org welcome shell — hero image on the left, scrollable content on the right.
 */
export function OrganizationWelcomeLayout({
  children,
  heroImageSrc = '/login-image.png',
  heroImageAlt = 'Authentication background',
}: OrganizationWelcomeLayoutProps) {
  return (
    <div className="ff-auth-split-shell">
      <AuthHeroImagePanel heroImageAlt={heroImageAlt} heroImageSrc={heroImageSrc} />

      <div className="ff-auth-split-content bg-bg-surface-elevated">
        <div className="ff-auth-split-scroll flex justify-center px-4 pt-4 pb-8 sm:items-center sm:px-6 sm:py-8 lg:px-8">
          <div className="w-full max-w-4xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
