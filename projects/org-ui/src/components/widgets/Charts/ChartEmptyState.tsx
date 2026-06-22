import { ReactNode } from 'react';
import { cn } from '../../../utils/cn';

export interface ChartEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
  icon?: ReactNode;
  /** Matches chart plot area height so empty state aligns with filled charts. */
  height?: number;
}

const DefaultChartIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="h-8 w-8"
    aria-hidden
  >
    <path strokeLinecap="round" d="M4 19V5M10 19V9M16 19V13M22 19V7" />
  </svg>
);

export function ChartEmptyState({
  title = 'No data yet',
  description = 'Data will appear here once it is available.',
  className,
  icon = DefaultChartIcon,
  height = 220,
}: ChartEmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'border-border-subtle/60 bg-bg-hover/30 flex w-full shrink-0 flex-col items-center justify-center rounded-lg border border-dashed px-5 py-6 text-center',
        className
      )}
      style={{ height }}
    >
      <span className="text-text-muted mb-2">{icon}</span>
      <p className="text-text-primary text-sm font-semibold">{title}</p>
      {description ? (
        <p className="text-text-muted mt-1 max-w-xs text-sm leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}
