'use client';

import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

import {
  FieldFlowProduct,
  getOrganizationWelcomePreset,
} from '../../../constants/organizationWelcomePresets';
import { ButtonVariantEnum } from '../../../constants';
import { Button } from '../../ui-components/Button';
import { Loader } from '../Loader';
import { OrganizationWelcomeLayout } from './OrganizationWelcomeLayout';
import type { OrganizationWelcomeLayoutProps } from './OrganizationWelcomeLayout';
import { WelcomeHeroPanel } from './WelcomeHeroPanel';

export interface OrganizationWelcomePageContentProps {
  product: FieldFlowProduct;
  heroImageSrc: OrganizationWelcomeLayoutProps['heroImageSrc'];
  heroImageAlt: OrganizationWelcomeLayoutProps['heroImageAlt'];
  onBack: () => void;
  onGetStarted: () => void;
  isLoading?: boolean;
  loadingText?: string;
  /** Overrides preset footer when set. */
  footerText?: string;
  /** Rendered after the hero panel (e.g. organization switcher modal). */
  children?: ReactNode;
}

export function OrganizationWelcomePageContent({
  product,
  heroImageSrc,
  heroImageAlt,
  onBack,
  onGetStarted,
  isLoading = false,
  loadingText = 'Loading organizations',
  footerText,
  children,
}: OrganizationWelcomePageContentProps) {
  const preset = getOrganizationWelcomePreset(product);

  if (isLoading) {
    return (
      <OrganizationWelcomeLayout heroImageSrc={heroImageSrc} heroImageAlt={heroImageAlt}>
        <Loader text={loadingText} />
      </OrganizationWelcomeLayout>
    );
  }

  return (
    <OrganizationWelcomeLayout heroImageSrc={heroImageSrc} heroImageAlt={heroImageAlt}>
      <WelcomeHeroPanel
        title={preset.title}
        subtitle={preset.subtitle}
        features={preset.features()}
        footerText={footerText ?? preset.footerText}
        headerSlot={
          <Button
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            title="Sign out"
            variant={ButtonVariantEnum.GHOST}
            onClick={onBack}
          />
        }
        primaryAction={{
          label: 'Get Started',
          onClick: onGetStarted,
        }}
      />
      {children}
    </OrganizationWelcomeLayout>
  );
}
