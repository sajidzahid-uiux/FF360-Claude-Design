'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

import { getAccentTextColor } from '../../../utils/accent';
import { cn } from '../../../utils/cn';
import { useTheme } from '../../../theme';
import { Button } from '../../ui-components/Button';
import { FieldFlowLogoMark } from './FieldFlowLogoMark';

export type WelcomeHeroFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type WelcomeHeroPanelProps = {
  title: string;
  subtitle: string;
  features: WelcomeHeroFeature[];
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  footerText?: string;
  headerSlot?: ReactNode;
  className?: string;
};

export function WelcomeHeroPanel({
  title,
  subtitle,
  features,
  primaryAction,
  footerText,
  headerSlot,
  className,
}: WelcomeHeroPanelProps) {
  const { accentColor } = useTheme();
  const accentIconForeground = getAccentTextColor(accentColor || '#DFFF86');

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-start gap-10 py-2 text-center sm:justify-center sm:gap-14 sm:py-6',
        className
      )}
    >
      {headerSlot ? (
        <div className="bg-bg-surface-elevated/95 sticky top-0 z-10 flex w-full justify-center py-2 backdrop-blur-sm sm:static sm:bg-transparent sm:py-0">
          {headerSlot}
        </div>
      ) : null}

      <div
        className="bg-accent ff-welcome-logo-orb mx-auto flex h-[116px] w-[116px] shrink-0 items-center justify-center rounded-full"
        style={{ color: accentIconForeground }}
      >
        <FieldFlowLogoMark animated className="h-[58px] w-[58px]" />
      </div>

      <div className="space-y-4">
        <h1 className="text-text-primary text-[32px] leading-[1.1] font-bold sm:leading-[1.05]">
          {title}
        </h1>
        <p className="text-text-muted mx-auto max-w-2xl text-center text-sm">{subtitle}</p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="border-border-subtle bg-bg-surface-elevated flex flex-col items-center gap-4 rounded-xl border p-4 text-left shadow-sm"
            >
              <div
                className="bg-accent flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                style={{ color: accentIconForeground }}
              >
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <p className="text-text-primary font-semibold">{feature.title}</p>
              <p className="text-text-muted max-w-50 text-center text-xs">{feature.description}</p>
            </div>
          );
        })}
      </div>

      {primaryAction ? (
        <div className="flex flex-col items-stretch gap-4">
          <Button
            onClick={primaryAction.onClick}
            title={primaryAction.label}
            rightIcon={<ArrowRight />}
          />
          {footerText ? <p className="text-text-muted text-sm">{footerText}</p> : null}
        </div>
      ) : (
        footerText && <p className="text-text-muted text-sm">{footerText}</p>
      )}
    </div>
  );
}
