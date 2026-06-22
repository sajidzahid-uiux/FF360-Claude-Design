import type { LucideIcon } from 'lucide-react';
import { isValidElement, type ReactNode } from 'react';

import { cn } from '../../../utils/cn';

export interface TableHeaderLabelProps {
  /** Lucide icon component or a pre-rendered icon node. */
  icon?: LucideIcon | ReactNode;
  label: string;
  /** Truncate long labels in narrow columns (common on the primary column). */
  truncate?: boolean;
  className?: string;
}

/**
 * Icon + label content for org-ui `Column.header`.
 * Use inside column definitions instead of repeating flex/gap/icon markup.
 */
export function TableHeaderLabel({
  icon,
  label,
  truncate = false,
  className,
}: TableHeaderLabelProps) {
  let iconNode: ReactNode | null = null;
  if (icon != null) {
    if (isValidElement(icon)) {
      iconNode = icon;
    } else {
      const Icon = icon as LucideIcon;
      iconNode = <Icon aria-hidden className="h-4 w-4" strokeWidth={2} />;
    }
  }

  return (
    <span
      className={cn('flex items-center gap-2', truncate && 'min-w-0 truncate', className)}
    >
      {iconNode != null ? (
        <span className="inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4">{iconNode}</span>
      ) : null}
      <span className={cn(truncate && 'truncate')}>{label}</span>
    </span>
  );
}
