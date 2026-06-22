import { ReactNode } from 'react';
import { ComponentSizeEnum } from '../../../constants';
import { cn } from '../../../utils/cn';
import { Checkbox } from '../../ui-components/Checkbox';
import { TableSelectAllCheckbox } from './TableSelectionCheckbox';
import { Loader } from '../Loader';
import { TableColumnHeader } from './TableColumnHeader';
import { TableEmptyState, type TableEmptyStateProps } from './TableEmptyState';
import { cycleTableColumnSort } from './tableDataUtils';
import type { Column } from './Table';
import type { TableSortRule } from './tableTypes';
import { TableVariantEnum, type TableVariant } from './tableVariantTypes';

const TABLE_ROW_ACTIONS_COLUMN_KEY = 'actions';
const TABLE_ROW_ACTIONS_COLUMN_WIDTH = '5.5rem';

export interface TableListViewProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  variant?: TableVariant;
  isLoading?: boolean;
  loadingText?: string;
  emptyState?: TableEmptyStateProps;
  /** @deprecated Prefer `emptyState`. */
  emptyMessage?: string;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectChange?: (ids: (string | number)[]) => void;
  showHeaderWhenEmpty?: boolean;
  sortRules?: TableSortRule[];
  onSortRulesChange?: (rules: TableSortRule[]) => void;
}

export function TableListView<T extends { id: string | number }>({
  data,
  columns,
  variant = TableVariantEnum.CARD,
  isLoading,
  loadingText = 'Loading…',
  emptyState,
  emptyMessage,
  selectable = false,
  selectedIds = [],
  onSelectChange,
  showHeaderWhenEmpty = true,
  sortRules = [],
  onSortRulesChange,
}: TableListViewProps<T>) {
  const rowData = data ?? [];
  const isEmpty = rowData.length === 0;
  const columnCount = columns.length + (selectable ? 1 : 0);

  const allSelected =
    rowData.length > 0 && rowData.every((item) => selectedIds.includes(item.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectChange?.([]);
      return;
    }
    onSelectChange?.(rowData.map((item) => item.id));
  };

  const handleSelectRow = (id: string | number) => {
    if (selectedIds.includes(id)) {
      onSelectChange?.(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }
    onSelectChange?.([...selectedIds, id]);
  };

  const handleSortToggle = (columnKey: string) => {
    if (!onSortRulesChange) return;
    onSortRulesChange(cycleTableColumnSort(sortRules, columnKey));
  };

  const resolvedEmptyState: TableEmptyStateProps = emptyState ?? {
    title: emptyMessage ?? 'No items yet',
    description: emptyMessage
      ? ''
      : 'When records are added, they will appear in this table.',
  };

  const isPlain = variant === TableVariantEnum.PLAIN;

  const renderBody = (): ReactNode => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={columnCount} className="p-0">
            <Loader text={loadingText} centerInContainer={false} className="py-14" />
          </td>
        </tr>
      );
    }

    if (isEmpty) {
      return (
        <tr>
          <td colSpan={columnCount} className="p-0">
            <TableEmptyState {...resolvedEmptyState} />
          </td>
        </tr>
      );
    }

    return rowData.map((item) => {
      const isSelected = selectedIds.includes(item.id);

      return (
        <tr
          key={item.id}
          className={cn(
            'group/table-row border-border-subtle/60 border-b last:border-b-0',
            isPlain
              ? 'bg-bg-surface/70 hover:bg-bg-surface night:bg-[#152331]/80 night:hover:bg-[#1a2a38] transition-colors duration-150 ease-out'
              : 'bg-bg-surface-elevated transition-[background-color,box-shadow] duration-200 ease-out hover:bg-bg-hover/50',
            isSelected &&
              (isPlain
                ? 'bg-accent-light/50 hover:bg-accent-light/65'
                : 'bg-accent-light/60 hover:bg-accent-light/80')
          )}
        >
          {selectable && (
            <td className="w-11 px-4 py-3.5 align-middle">
              <div className="flex min-h-5 items-center">
                <Checkbox
                  size={ComponentSizeEnum.MD}
                  checked={isSelected}
                  onChange={() => handleSelectRow(item.id)}
                  aria-label={`Select row ${item.id}`}
                />
              </div>
            </td>
          )}
          {columns.map((column) => {
            const isActionsColumn = column.key === TABLE_ROW_ACTIONS_COLUMN_KEY;

            return (
              <td
                key={column.key}
                style={
                  isActionsColumn
                    ? { width: TABLE_ROW_ACTIONS_COLUMN_WIDTH }
                    : column.width
                      ? { width: column.width, maxWidth: column.width }
                      : undefined
                }
                className={cn(
                  'text-text-primary py-3.5 text-sm align-middle',
                  isActionsColumn
                    ? 'w-[5.5rem] min-w-[5.5rem] max-w-[5.5rem] overflow-visible px-2 text-right'
                    : 'min-w-0 overflow-hidden px-4',
                  column.align === 'right' && 'text-right',
                  column.align === 'center' && 'text-center',
                  column.cellClassName,
                  isActionsColumn &&
                    '!w-[5.5rem] !min-w-[5.5rem] !max-w-[5.5rem]'
                )}
              >
                {column.render(item)}
              </td>
            );
          })}
        </tr>
      );
    });
  };

  const showHeader = showHeaderWhenEmpty || !isEmpty || isLoading;

  return (
    <div className="table-view-body-enter overflow-x-auto [scrollbar-gutter:stable]">
      <table className="w-full table-fixed border-collapse">
        {showHeader ? (
          <thead
            className={cn(
              'border-border-subtle/60 border-b border-t-0',
              isPlain
                ? 'bg-transparent'
                : 'border-border-subtle/80 bg-bg-surface/90 sticky top-0 z-[1] backdrop-blur-sm'
            )}
          >
            <tr>
              {selectable && (
                <th
                  scope="col"
                  className="text-text-muted w-11 px-4 py-3 text-left align-middle"
                >
                  <div className="flex min-h-5 items-center">
                    {!isEmpty && !isLoading ? (
                      <TableSelectAllCheckbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={handleSelectAll}
                        label="Select all rows on this page"
                      />
                    ) : null}
                  </div>
                </th>
              )}
              {columns.map((column) => (
                <TableColumnHeader
                  key={column.key}
                  columnKey={column.key}
                  header={column.header}
                  sortable={column.sortable}
                  sortRules={sortRules}
                  onSortToggle={onSortRulesChange ? handleSortToggle : undefined}
                  width={
                    column.key === TABLE_ROW_ACTIONS_COLUMN_KEY
                      ? TABLE_ROW_ACTIONS_COLUMN_WIDTH
                      : column.width
                  }
                  align={
                    column.key === TABLE_ROW_ACTIONS_COLUMN_KEY
                      ? 'right'
                      : column.align
                  }
                  className={cn(
                    column.headerClassName,
                    column.key === TABLE_ROW_ACTIONS_COLUMN_KEY &&
                      '!w-[5.5rem] !min-w-[5.5rem] !max-w-[5.5rem] px-2'
                  )}
                />
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>{renderBody()}</tbody>
      </table>
    </div>
  );
}
