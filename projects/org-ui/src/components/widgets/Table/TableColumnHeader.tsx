import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '../../../utils/cn';
import type { TableSortDirection, TableSortRule } from './tableTypes';

export interface TableColumnHeaderProps {
  columnKey: string;
  header: ReactNode;
  sortable?: boolean;
  sortRules?: TableSortRule[];
  onSortToggle?: (columnKey: string) => void;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

function SortIndicator({
  direction,
  priority,
}: {
  direction?: TableSortDirection;
  priority?: number;
}) {
  if (!direction) {
    return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden strokeWidth={2} />;
  }

  const Icon = direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <span className="text-accent inline-flex items-center gap-0.5" aria-hidden>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      {priority !== undefined && priority > 0 ? (
        <span className="text-text-muted text-[10px] font-semibold tabular-nums">
          {priority + 1}
        </span>
      ) : null}
    </span>
  );
}

const headerCellClass =
  'text-text-muted px-4 py-3 text-left align-middle text-xs font-medium tracking-normal';

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

export function TableColumnHeader({
  columnKey,
  header,
  sortable = false,
  sortRules = [],
  onSortToggle,
  width,
  align = 'left',
  className,
}: TableColumnHeaderProps) {
  const ruleIndex = sortRules.findIndex((rule) => rule.columnKey === columnKey);
  const activeRule = ruleIndex >= 0 ? sortRules[ruleIndex] : undefined;

  const cellClassName = cn(
    headerCellClass,
    alignClass[align],
    align === 'right' && 'pr-4 pl-3',
    className
  );

  if (!sortable || !onSortToggle) {
    return (
      <th
        scope="col"
        className={cellClassName}
        style={width ? { width, maxWidth: width } : undefined}
      >
        <div className="flex min-h-5 min-w-0 items-center overflow-hidden">{header}</div>
      </th>
    );
  }

  return (
    <th
      scope="col"
      className={cellClassName}
      style={width ? { width, maxWidth: width } : undefined}
      aria-sort={
        activeRule
          ? activeRule.direction === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
    >
      <div
        className={cn(
          'flex min-h-5 items-center',
          align === 'right' && 'justify-end',
          align === 'center' && 'justify-center'
        )}
      >
        <button
          type="button"
          onClick={() => onSortToggle(columnKey)}
          className={cn(
            'hover:text-text-primary inline-flex min-w-0 max-w-full items-center gap-1.5 transition-colors',
            activeRule && 'text-text-primary'
          )}
        >
          <span className="min-w-0 truncate">{header}</span>
          <SortIndicator direction={activeRule?.direction} priority={ruleIndex} />
        </button>
      </div>
    </th>
  );
}
