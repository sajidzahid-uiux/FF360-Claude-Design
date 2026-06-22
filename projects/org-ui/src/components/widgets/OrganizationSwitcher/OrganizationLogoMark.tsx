'use client';

import { useState } from 'react';
import { cn } from '../../../utils/cn';

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export interface OrganizationLogoMarkProps {
  name: string;
  logo?: string | null;
  size?: number;
  roundedClassName?: string;
  className?: string;
}

export function OrganizationLogoMark({
  name,
  logo,
  size = 72,
  roundedClassName = 'rounded-2xl',
  className,
}: OrganizationLogoMarkProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const logoUrl = logo?.trim();
  const showLogo = Boolean(logoUrl) && !imageFailed;
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden shadow-xl',
        showLogo ? 'bg-bg-surface' : 'bg-text-primary',
        roundedClassName,
        className
      )}
      style={{ width: size, height: size }}
    >
      {showLogo ? (
        <img
          src={logoUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span
          className="text-text-inverse font-bold tracking-wide"
          style={{ fontSize: Math.max(18, Math.round(size * 0.42)) }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
