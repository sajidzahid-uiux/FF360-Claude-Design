import { ReactNode } from 'react';
import { ComponentSizeEnum } from '../../../constants';
import { cn } from '../../../utils/cn';
import { Checkbox } from '../../ui-components/Checkbox';
import {
  tableCollectionCardClass,
  tableCollectionCardHeaderClass,
  tableCollectionCardSelectedClass,
} from './tableCollectionStyles';

export interface TableGridCardProps {
  title: ReactNode;
  actions?: ReactNode;
  /** Optional row below the title row (metadata, badges, etc.). */
  headerContent?: ReactNode;
  children: ReactNode;
  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  className?: string;
}

export function TableGridCard({
  title,
  actions,
  headerContent,
  children,
  selectable = false,
  selected = false,
  onSelectedChange,
  className,
}: TableGridCardProps) {
  return (
    <article
      className={cn(
        'group/table-card flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl',
        tableCollectionCardClass,
        selected && tableCollectionCardSelectedClass,
        className
      )}
    >
      <header
        className={cn(
          tableCollectionCardHeaderClass,
          'relative px-4 py-3',
          actions && 'overflow-visible'
        )}
      >
        {actions ? (
          <div className="absolute top-3 right-4 z-10 flex items-center justify-end">
            {actions}
          </div>
        ) : null}
        <div
          className={cn(
            'grid min-w-0 items-start gap-x-2.5 gap-y-1.5',
            selectable ? 'grid-cols-[auto_1fr]' : 'grid-cols-1',
            actions && 'pr-10'
          )}
        >
          {selectable ? (
            <div className="flex items-center self-center">
              <Checkbox
                size={ComponentSizeEnum.MD}
                checked={selected}
                onChange={() => onSelectedChange?.(!selected)}
                aria-label="Select card"
              />
            </div>
          ) : null}

          <div className="min-w-0 space-y-1.5">
            <h3 className="text-text-primary text-sm leading-5 font-semibold">{title}</h3>
            {headerContent ? (
              <div className="text-text-secondary min-w-0 text-xs leading-relaxed">
                {headerContent}
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <div className="text-text-primary min-h-0 flex-1 px-4 py-3 text-sm">{children}</div>
    </article>
  );
}
