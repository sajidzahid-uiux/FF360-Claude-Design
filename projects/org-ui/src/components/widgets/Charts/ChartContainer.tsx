import { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '../../../utils/cn';
import { chartContainerClassName } from './chartTheme';

export interface ChartContainerProps {
  children: ReactElement;
  height?: number;
  minHeight?: number;
  className?: string;
  ariaLabel?: string;
}

export function ChartContainer({
  children,
  height = 260,
  minHeight = 180,
  className,
  ariaLabel,
}: ChartContainerProps) {
  return (
    <div
      className={cn('relative min-h-0 w-full min-w-0', chartContainerClassName, className)}
      style={{ height, minHeight }}
      aria-label={ariaLabel}
      role="img"
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
