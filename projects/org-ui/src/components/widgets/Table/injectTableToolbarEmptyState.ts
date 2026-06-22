import { ReactNode, cloneElement, isValidElement } from 'react';

import { TableToolbar } from './TableToolbar';
import type { TableToolbarProps } from './TableToolbar';

export interface InjectTableToolbarEmptyStateOptions {
  rowCount: number;
  totalCount?: number;
  isLoading?: boolean;
  hideRefinementsWhenEmpty?: boolean;
}

export function injectTableToolbarEmptyState(
  toolbar: ReactNode,
  options: InjectTableToolbarEmptyStateOptions
): ReactNode {
  if (!isValidElement<TableToolbarProps>(toolbar) || toolbar.type !== TableToolbar) {
    return toolbar;
  }

  return cloneElement(toolbar, {
    rowCount: options.rowCount,
    totalCount: options.totalCount ?? toolbar.props.totalCount,
    isLoading: options.isLoading ?? toolbar.props.isLoading,
    hideRefinementsWhenEmpty:
      options.hideRefinementsWhenEmpty ?? toolbar.props.hideRefinementsWhenEmpty,
  });
}
