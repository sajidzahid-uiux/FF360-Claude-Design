'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ButtonVariantEnum, ComponentSizeEnum } from '../../../constants';
import { Button } from '../../ui-components/Button';
import { cn } from '../../../utils/cn';
import { DEFAULT_TABLE_PAGE_SIZE } from './tableConstants';
import type { TablePageDirection } from './useTablePageMotion';
import { TableVariantEnum, type TableVariant } from './tableVariantTypes';

export interface TablePaginationConfig {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
  /** Shown in the range label, e.g. "fields" → "Showing 1 to 10 of 42 fields". */
  itemLabel?: string;
  /** Disables prev/next while a server fetch is in flight. */
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export interface TablePaginationProps {
  pagination: TablePaginationConfig;
  variant?: TableVariant;
  className?: string;
}

export function TablePagination({
  pagination,
  variant = TableVariantEnum.CARD,
  className,
}: TablePaginationProps) {
  const isPlain = variant === TableVariantEnum.PLAIN;
  const {
    currentPage,
    totalPages,
    totalCount,
    pageSize = DEFAULT_TABLE_PAGE_SIZE,
    itemLabel = 'items',
    isLoading = false,
    onPageChange,
  } = pagination;

  const safePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const [pageFlipKey, setPageFlipKey] = useState(safePage);
  const [flipDirection, setFlipDirection] = useState<TablePageDirection>('forward');
  const previousPageRef = useRef(safePage);

  useEffect(() => {
    if (safePage === previousPageRef.current) {
      return;
    }

    setFlipDirection(safePage > previousPageRef.current ? 'forward' : 'back');
    setPageFlipKey(safePage);
    previousPageRef.current = safePage;
  }, [safePage]);

  if (totalCount <= 0) {
    return null;
  }

  const startItem = (safePage - 1) * pageSize + 1;
  const endItem =
    safePage >= totalPages ? totalCount : Math.min(safePage * pageSize, totalCount);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t py-3',
        isPlain
          ? 'border-border-subtle/60 bg-transparent px-0'
          : 'border-border-subtle/80 bg-bg-surface/50 px-4',
        className
      )}
    >
      <p className="text-text-muted text-sm">
        Showing {startItem} to {endItem} of {totalCount} {itemLabel}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size={ComponentSizeEnum.SM}
          variant={ButtonVariantEnum.GHOST}
          iconOnly
          aria-label="Previous page"
          disabled={safePage <= 1 || isLoading}
          leftIcon={<ChevronLeft className="h-4 w-4" aria-hidden strokeWidth={2} />}
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
        />
        <span
          key={pageFlipKey}
          className={cn(
            'text-text-secondary relative flex min-w-[4.5rem] items-center justify-center overflow-hidden text-center text-sm tabular-nums',
            flipDirection === 'forward'
              ? 'table-pagination-page-forward motion-reduce:animate-none'
              : 'table-pagination-page-back motion-reduce:animate-none'
          )}
        >
          {safePage} / {totalPages}
        </span>
        <Button
          type="button"
          size={ComponentSizeEnum.SM}
          variant={ButtonVariantEnum.GHOST}
          iconOnly
          aria-label="Next page"
          disabled={safePage >= totalPages || isLoading}
          leftIcon={<ChevronRight className="h-4 w-4" aria-hidden strokeWidth={2} />}
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
        />
      </div>
    </div>
  );
}
