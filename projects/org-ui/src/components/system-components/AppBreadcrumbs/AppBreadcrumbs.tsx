import { MouseEvent, ReactNode } from 'react';

import { cn } from '../../../utils/cn';

export interface AppBreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  isCurrent?: boolean;
  onSelect?: () => void;
  /** Merged onto the label element; overrides default crumb text color when set. */
  labelClassName?: string;
}

export interface AppBreadcrumbsProps {
  items: AppBreadcrumbItem[];
  leadingIcon?: ReactNode;
  /** Right-aligned row content (actions, status, search/filter controls, etc.). */
  toolbar?: ReactNode;
  className?: string;
  linkComponent?: (props: {
    href: string;
    children: ReactNode;
    className?: string;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    'aria-current'?: 'page';
  }) => ReactNode;
}

export function AppBreadcrumbs({
  items,
  leadingIcon,
  toolbar,
  className,
  linkComponent,
}: AppBreadcrumbsProps) {
  if (!items.length) return null;

  const nav = (
    <nav
      aria-label="Breadcrumb"
      className="text-text-muted flex min-h-10 min-w-0 flex-1 flex-wrap items-center gap-2 text-sm"
    >
      {leadingIcon ? (
        <>
          <span className="text-text-secondary h-5 w-5 shrink-0">{leadingIcon}</span>
          <span className="bg-border-strong mx-1 h-6 w-px" />
        </>
      ) : null}

      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          {index > 0 ? (
            <span className="text-text-muted inline-flex h-4 w-4 items-center justify-center">›</span>
          ) : null}

          {item.href ? (
            linkComponent ? (
              linkComponent({
                href: item.href,
                onClick: (event) => {
                  if (!item.onSelect) return;
                  event.preventDefault();
                  item.onSelect();
                },
                'aria-current': item.isCurrent ? 'page' : undefined,
                className: cn(
                  item.isCurrent
                    ? 'text-text-primary hover:text-text-secondary text-sm font-semibold'
                    : 'text-text-muted hover:text-text-secondary text-sm font-medium',
                  item.labelClassName
                ),
                children: item.label,
              })
            ) : (
              <a
                href={item.href}
                onClick={(event) => {
                  if (!item.onSelect) return;
                  event.preventDefault();
                  item.onSelect();
                }}
                aria-current={item.isCurrent ? 'page' : undefined}
                className={cn(
                  item.isCurrent
                    ? 'text-text-primary hover:text-text-secondary text-sm font-semibold'
                    : 'text-text-muted hover:text-text-secondary text-sm font-medium',
                  item.labelClassName
                )}
              >
                {item.label}
              </a>
            )
          ) : (
            <span
              className={cn(
                item.isCurrent ? 'text-text-primary font-semibold' : 'text-text-muted font-medium',
                item.labelClassName
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2',
        className
      )}
    >
      {nav}
      {toolbar ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{toolbar}</div>
      ) : null}
    </div>
  );
}
