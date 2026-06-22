import { ReactNode } from 'react';
import { ButtonVariantEnum, ComponentSizeEnum } from '../../../constants';
import { Button } from '../../ui-components/Button';
import { cn } from '../../../utils/cn';

export interface TableBulkAction {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'danger';
  onClick: (selectedIds: (string | number)[]) => void;
}

export interface TableBulkBarProps {
  selectedCount: number;
  selectedIds: (string | number)[];
  actions: TableBulkAction[];
  onClearSelection: () => void;
  className?: string;
}

export function TableBulkBar({
  selectedCount,
  selectedIds,
  actions,
  onClearSelection,
  className,
}: TableBulkBarProps) {
  if (selectedCount <= 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className={cn(
        'border-border-subtle/80 bg-accent-light/50 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5',
        'table-bulk-bar-content motion-reduce:transition-none',
        className
      )}
    >
      <div className="table-reveal-stagger-item flex flex-wrap items-center gap-3">
        <span className="text-text-primary text-sm font-medium">
          {selectedCount} selected
        </span>
        <button
          type="button"
          onClick={onClearSelection}
          className="text-text-secondary hover:text-text-primary text-sm font-medium underline-offset-2 transition-colors hover:underline"
        >
          Clear selection
        </button>
      </div>

      <div className="table-reveal-stagger-item flex flex-wrap items-center gap-2 [animation-delay:60ms]">
        {actions.map((action) => (
          <Button
            key={action.id}
            type="button"
            size={ComponentSizeEnum.SM}
            variant={
              action.variant === 'danger'
                ? ButtonVariantEnum.DANGER
                : ButtonVariantEnum.SURFACE
            }
            leftIcon={action.icon}
            title={action.label}
            onClick={() => action.onClick(selectedIds)}
          />
        ))}
      </div>
    </div>
  );
}
