import { ReactNode } from 'react';
import { cn } from '../../../utils/cn';

export interface TableEmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

const DefaultTableEmptyIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="h-8 w-8"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6ZM9 12h6"
    />
  </svg>
);

export function TableEmptyState({
  title = 'No items yet',
  description = 'When records are added, they will appear in this table.',
  icon = DefaultTableEmptyIcon,
  className,
}: TableEmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'table-reveal-content-in flex flex-col items-center justify-center px-6 py-14 text-center motion-reduce:animate-none',
        className
      )}
    >
      <span className="text-text-muted mb-3">{icon}</span>
      <p className="text-text-primary text-sm font-semibold">{title}</p>
      {description ? (
        <p className="text-text-muted mt-1 max-w-sm text-sm leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}
