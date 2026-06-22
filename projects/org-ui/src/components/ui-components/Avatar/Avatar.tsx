import { ComponentPropsWithoutRef, useMemo, useState } from 'react';
import { cn } from '../../../utils/cn';

export type AvatarSize = 'sm' | 'md' | 'lg' | number;

export interface AvatarProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
}

const sizeClasses: Record<Exclude<AvatarSize, number>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({
  src,
  alt = 'Avatar',
  fallback = 'U',
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);

  const numericSize = typeof size === 'number' ? size : null;
  const computedFallback = useMemo(
    () => (fallback ?? 'U').trim().slice(0, 2).toUpperCase() || 'U',
    [fallback]
  );
  const shouldRenderImage = Boolean(src) && !hasImageError;

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100 night:bg-[#243548] night:text-slate-100',
        numericSize == null ? sizeClasses[size as Exclude<AvatarSize, number>] : null,
        className
      )}
      style={
        numericSize != null
          ? {
              width: `${numericSize}px`,
              height: `${numericSize}px`,
              fontSize: `${Math.max(10, Math.round(numericSize * 0.36))}px`,
            }
          : undefined
      }
      data-slot="avatar"
      {...props}
    >
      {shouldRenderImage ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          data-slot="avatar-image"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span data-slot="avatar-fallback">{computedFallback}</span>
      )}
    </span>
  );
}

