import { cn } from '../../../utils/cn';

export interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
  value?: string | number;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  showValues?: boolean;
  className?: string;
  scrollable?: boolean;
}

export function ChartLegend({
  items,
  showValues = false,
  className,
  scrollable = false,
}: ChartLegendProps) {
  if (!items.length) return null;

  return (
    <div
      className={cn(
        scrollable &&
          '[&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-track]:bg-border-subtle/40 flex gap-2 overflow-x-auto pb-1 whitespace-nowrap [&::-webkit-scrollbar]:h-1',
        !scrollable && 'flex flex-wrap items-center justify-center gap-2',
        className
      )}
      role="list"
      aria-label="Chart legend"
    >
      {items.map((item) => (
        <span
          key={item.id}
          role="listitem"
          className={cn(
            'border-border-subtle/80 bg-bg-surface-elevated/90 inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm',
            scrollable && 'shrink-0'
          )}
        >
          <span
            className="ring-bg-surface-elevated h-2.5 w-2.5 shrink-0 rounded-full ring-2"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <span className="text-text-secondary truncate">{item.label}</span>
          {showValues && item.value !== undefined ? (
            <span className="text-text-primary tabular-nums font-semibold">{item.value}</span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
