import { LayoutGrid, LayoutPanelTop, List } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { TableViewMode, TableViewModeEnum } from './tableViewTypes';

export interface TableViewSwitcherProps {
  value: TableViewMode;
  onValueChange: (value: TableViewMode) => void;
  showKanban?: boolean;
  className?: string;
}

const VIEW_OPTIONS: {
  value: TableViewMode;
  label: string;
  shortLabel: string;
  icon: typeof List;
  requiresKanban?: boolean;
}[] = [
  {
    value: TableViewModeEnum.LIST,
    label: 'List view',
    shortLabel: 'List',
    icon: List,
  },
  {
    value: TableViewModeEnum.GRID,
    label: 'Grid view',
    shortLabel: 'Grid',
    icon: LayoutGrid,
  },
  {
    value: TableViewModeEnum.KANBAN,
    label: 'Kanban view',
    shortLabel: 'Board',
    icon: LayoutPanelTop,
    requiresKanban: true,
  },
];

/** Minimal segmented view control (icon + label), separate from CMS pill switcher. */
export function TableViewSwitcher({
  value,
  onValueChange,
  showKanban = false,
  className,
}: TableViewSwitcherProps) {
  const visibleOptions = VIEW_OPTIONS.filter(
    (opt) => !opt.requiresKanban || showKanban
  );

  return (
    <div
      aria-label="View mode"
      role="tablist"
      className={cn('inline-flex shrink-0 items-center', className)}
    >
      {visibleOptions.map((opt, index) => {
        const isActive = value === opt.value;
        const Icon = opt.icon;

        return (
          <div key={opt.value} className="flex items-center">
            {index > 0 ? (
              <span
                className="bg-border-subtle/80 mx-0.5 hidden h-4 w-px shrink-0 sm:block"
                aria-hidden
              />
            ) : null}
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={opt.label}
              title={opt.label}
              onClick={() => onValueChange(opt.value)}
              className={cn(
                'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2 transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35',
                isActive
                  ? 'text-text-primary bg-bg-hover font-medium'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-hover/60'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2} />
              <span className="hidden text-xs sm:inline">{opt.shortLabel}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
