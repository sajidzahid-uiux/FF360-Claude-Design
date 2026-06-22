'use client';

import { cn } from '../../../utils/cn';
import { getAccentTextColor } from '../../../utils/accent';
import { useTheme } from '../../../theme';
import { Button } from '../../ui-components/Button';
import { OrganizationLogoMark } from './OrganizationLogoMark';

export interface OrganizationCardItem {
  id: string | number;
  name: string;
  email?: string;
  user_type?: string;
  current_plan?: string;
  owner?: boolean;
  /** Organization logo URL from API (`logo` field). */
  logo?: string;
  /** FieldFlow360 (Tile Design service org) — distinct styling in pickers. */
  is_service_org?: boolean;
  isActive?: boolean;
}

interface OrganizationCardProps {
  item: OrganizationCardItem;
  isCurrent?: boolean;
  onSignIn?: (id: OrganizationCardItem['id']) => void;
  /** When false, only initials are shown (Tile Design). */
  showLogo?: boolean;
  /** Fills the org switcher stage while transitioning to the selected workspace. */
  expanded?: boolean;
  /** Fades out when another org is expanding. */
  exiting?: boolean;
  /** Grows within the grid before the full-stage expand. */
  promoting?: boolean;
}

const ArrowRightIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const CheckIcon = (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="m5 13 4 4L19 7" />
  </svg>
);

export const OrganizationCard = ({
  item,
  isCurrent = false,
  onSignIn,
  showLogo = true,
  expanded = false,
  exiting = false,
  promoting = false,
}: OrganizationCardProps) => {
  const { accentColor } = useTheme();
  const currentBadgeTextColor = getAccentTextColor(accentColor || '#D7F27A');
  const roleLabel = item.owner ? 'Owner' : (item.user_type ?? 'Member');
  const planLabel = item.current_plan?.trim();
  const isServiceHub = Boolean(item.is_service_org);
  const logoSize = expanded ? 112 : 72;

  return (
    <div
      className={cn(
        'border-border-subtle bg-bg-surface-elevated flex flex-col items-center gap-[12px] rounded-2xl border px-6 py-7 text-center shadow-sm transition-[transform,opacity,box-shadow,border-color,max-width,min-height] duration-[640ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
        expanded
          ? 'ff-org-card-expanded border-accent mx-0 w-full max-w-none min-w-0'
          : 'mx-auto h-full min-h-[280px] w-full max-w-[280px] min-w-[220px] cursor-pointer hover:border-border-strong hover:shadow-md sm:mx-0 sm:max-w-none',
        exiting && 'ff-org-card-exiting pointer-events-none',
        promoting && 'ff-org-card-promoting relative z-[2]',
        !expanded &&
          !exiting &&
          isCurrent &&
          'ff-org-card-current border-accent scale-[1.02]',
        !expanded &&
          !exiting &&
          isServiceHub &&
          'border-accent/50 ring-accent/25 ring-2'
      )}
    >
      <OrganizationLogoMark
        name={item.name}
        logo={showLogo ? item.logo : undefined}
        size={logoSize}
        className={cn(
          'transition-transform duration-[640ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          expanded && 'scale-105'
        )}
      />

      <h3
        className={cn(
          'text-text-primary line-clamp-2 w-full min-w-0 font-bold break-words',
          expanded ? 'text-2xl leading-tight' : 'text-base leading-tight'
        )}
        title={item.name}
      >
        {item.name}
      </h3>

      {isServiceHub ? (
        <span className="bg-accent/15 text-text-primary border-accent/30 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
          FieldFlow360
        </span>
      ) : null}

      {item.email ? (
        <p
          className={cn(
            'text-text-muted line-clamp-2 w-full min-w-0 break-all',
            expanded ? 'text-base' : 'text-sm'
          )}
          title={item.email}
        >
          {item.email}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="bg-text-primary text-text-inverse inline-block rounded-full px-4 py-1 text-xs font-semibold">
          {roleLabel}
        </span>
        {planLabel ? (
          <span className="border-border-strong bg-bg-hover text-text-secondary inline-block rounded-full border px-3 py-1 text-xs font-semibold">
            Plan: {planLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-auto w-full pt-1">
        {expanded ? (
          <div className="bg-accent/90 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 shadow-xl">
            <span
              className="border-current/30 inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: `${currentBadgeTextColor}55`, borderTopColor: 'transparent' }}
              aria-hidden
            />
            <span
              className="text-xs font-black tracking-widest uppercase"
              style={{ color: currentBadgeTextColor }}
            >
              Opening workspace…
            </span>
          </div>
        ) : isCurrent ? (
          <div className="bg-accent flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2 shadow-xl">
            <span style={{ color: currentBadgeTextColor }}>{CheckIcon}</span>
            <span
              className="text-xs font-black tracking-widest uppercase"
              style={{ color: currentBadgeTextColor }}
            >
              Current
            </span>
          </div>
        ) : (
          <Button
            onClick={() => onSignIn?.(item.id)}
            disabled={exiting}
            fullWidth
            title="Sign in"
            rightIcon={ArrowRightIcon}
          />
        )}
      </div>
    </div>
  );
};
