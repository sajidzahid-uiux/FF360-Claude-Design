import { ReactNode, useRef } from 'react';
import { useTablePageMotion } from './useTablePageMotion';
import { cn } from '../../../utils/cn';
import { injectTableToolbarEmptyState } from './injectTableToolbarEmptyState';
import { TableBulkBar, type TableBulkAction } from './TableBulkBar';
import { TableReveal } from './TableReveal';
import type { TableEmptyStateProps } from './TableEmptyState';
import { TableGridView } from './TableGridView';
import { TableKanbanView } from './TableKanbanView';
import { TableListView } from './TableListView';
import { TablePagination, type TablePaginationConfig } from './TablePagination';
import type { TableSortRule } from './tableTypes';
import type { TableDataMode } from './tableServerTypes';
import { TableVariantEnum, type TableVariant } from './tableVariantTypes';
import {
  TableViewMode,
  TableViewModeEnum,
  type TableGridViewConfig,
  type TableKanbanViewConfig,
} from './tableViewTypes';

export interface Column<T extends { id: string | number }> {
  key: string;
  header: ReactNode;
  render: (item: T) => ReactNode;
  width?: string;
  /** Enables column header sort cycling when `onSortRulesChange` is provided. */
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  headerClassName?: string;
  cellClassName?: string;
  /** Plain label for the column editor when `header` is not a string. */
  label?: string;
  /** When false, column cannot be hidden or reordered (e.g. row actions). Default true. */
  hideable?: boolean;
  /** Initial visibility before user customization. Default true. */
  defaultVisible?: boolean;
}

export interface TableProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  /** @deprecated Prefer `emptyState` for title, description, and icon. */
  emptyMessage?: string;
  emptyState?: TableEmptyStateProps;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  /**
   * `card` (default): bordered elevated shell.
   * `plain`: no outer border; transparent header (tile design lists).
   */
  variant?: TableVariant;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectChange?: (ids: (string | number)[]) => void;
  bulkActions?: TableBulkAction[];
  pagination?: TablePaginationConfig;
  /**
   * `client` (default): parent may filter/sort/paginate locally.
   * `server`: `data` is the current API page; use {@link useServerTableQuery} + {@link serializeTableServerQuery}.
   */
  dataMode?: TableDataMode;
  /** When true, table header stays visible while body shows empty state. Default true. */
  showHeaderWhenEmpty?: boolean;
  /** Toolbar row (search / filter / sort / view switcher / add actions). Use `TableToolbar`. */
  toolbar?: ReactNode;
  /**
   * When true (default), {@link TableToolbar} omits search/filter/sort while the dataset is empty
   * and not loading. Primary actions (e.g. Add) remain visible.
   */
  hideToolbarRefinementsWhenEmpty?: boolean;
  sortRules?: TableSortRule[];
  onSortRulesChange?: (rules: TableSortRule[]) => void;
  /** Active layout. Default `list`. */
  view?: TableViewMode;
  /** Grid card layout — enable grid in view switcher when provided. */
  grid?: TableGridViewConfig<T>;
  /** Kanban columns — enable kanban in view switcher when provided. */
  kanban?: TableKanbanViewConfig<T>;
  /**
   * When true, table fills available height: toolbar on top, pagination on bottom,
   * scrollable body in between. Parent should be a flex column with `min-h-0 flex-1`.
   */
  fillHeight?: boolean;
}

function resolveView<T extends { id: string | number }>(
  view: TableViewMode | undefined,
  grid: TableGridViewConfig<T> | undefined,
  kanban: TableKanbanViewConfig<T> | undefined
): TableViewMode {
  const requested = view ?? TableViewModeEnum.LIST;
  if (requested === TableViewModeEnum.GRID && grid) return TableViewModeEnum.GRID;
  if (requested === TableViewModeEnum.KANBAN && kanban) return TableViewModeEnum.KANBAN;
  return TableViewModeEnum.LIST;
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  emptyMessage,
  emptyState,
  isLoading,
  loadingText = 'Loading…',
  className,
  variant = TableVariantEnum.CARD,
  selectable = false,
  selectedIds = [],
  onSelectChange,
  bulkActions = [],
  pagination,
  showHeaderWhenEmpty = true,
  toolbar,
  hideToolbarRefinementsWhenEmpty = true,
  sortRules = [],
  onSortRulesChange,
  view,
  grid,
  kanban,
  fillHeight = false,
}: TableProps<T>) {
  const rowData = data ?? [];
  const activeView = resolveView(view, grid, kanban);
  const hasBulkActions = selectable && bulkActions.length > 0;
  const showBulkBar = hasBulkActions && selectedIds.length > 0;
  const renderedToolbar = toolbar
    ? injectTableToolbarEmptyState(toolbar, {
        rowCount: rowData.length,
        totalCount: pagination?.totalCount,
        isLoading,
        hideRefinementsWhenEmpty: hideToolbarRefinementsWhenEmpty,
      })
    : null;
  const hasToolbar = Boolean(renderedToolbar);

  const bulkSnapshotRef = useRef<{ count: number; ids: (string | number)[] }>({
    count: 0,
    ids: [],
  });

  if (selectedIds.length > 0) {
    bulkSnapshotRef.current = {
      count: selectedIds.length,
      ids: [...selectedIds],
    };
  }

  const resolvedEmptyState: TableEmptyStateProps = emptyState ?? {
    title: emptyMessage ?? 'No items yet',
    description: emptyMessage
      ? ''
      : 'When records are added, they will appear in this table.',
  };

  const handleClearSelection = () => {
    onSelectChange?.([]);
  };

  const renderBody = () => {
    if (activeView === TableViewModeEnum.GRID && grid) {
      return (
        <TableGridView
          data={rowData}
          config={grid}
          isLoading={isLoading}
          loadingText={loadingText}
          emptyState={resolvedEmptyState}
          selectable={selectable}
          selectedIds={selectedIds}
          onSelectChange={onSelectChange}
        />
      );
    }

    if (activeView === TableViewModeEnum.KANBAN && kanban) {
      return (
        <TableKanbanView
          data={rowData}
          config={kanban}
          isLoading={isLoading}
          loadingText={loadingText}
          emptyState={resolvedEmptyState}
          selectable={selectable}
          selectedIds={selectedIds}
          onSelectChange={onSelectChange}
        />
      );
    }

    return (
      <TableListView
        data={rowData}
        columns={columns}
        variant={variant}
        isLoading={isLoading}
        loadingText={loadingText}
        emptyState={resolvedEmptyState}
        emptyMessage={emptyMessage}
        selectable={selectable}
        selectedIds={selectedIds}
        onSelectChange={onSelectChange}
        showHeaderWhenEmpty={showHeaderWhenEmpty}
        sortRules={sortRules}
        onSortRulesChange={onSortRulesChange}
      />
    );
  };

  const isPlain = variant === TableVariantEnum.PLAIN;
  const { motionKey: pageMotionKey, direction: pageDirection } = useTablePageMotion(
    pagination?.currentPage
  );
  const pageTurnClassName =
    pagination &&
    (pageDirection === 'forward' ? 'table-page-turn-forward' : 'table-page-turn-back');

  const bodyScrollClassName = fillHeight
    ? cn(
        'min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]',
        activeView === TableViewModeEnum.KANBAN
          ? 'overflow-x-auto'
          : 'overflow-x-hidden'
      )
    : undefined;

  return (
    <div
      className={cn(
        'w-full overflow-hidden',
        fillHeight && 'flex h-full min-h-0 flex-col',
        isPlain
          ? 'border-0 bg-transparent shadow-none'
          : 'border-border-subtle/80 bg-bg-surface-elevated rounded-xl border shadow-sm shadow-black/[0.03] dark:shadow-black/20',
        className
      )}
    >
      {hasBulkActions ? (
        <TableReveal
          show={showBulkBar}
          className="border-border-subtle/80 border-b"
          durationMs={300}
        >
          <TableBulkBar
            selectedCount={bulkSnapshotRef.current.count}
            selectedIds={bulkSnapshotRef.current.ids}
            actions={bulkActions}
            onClearSelection={handleClearSelection}
            className="rounded-none border-0"
          />
        </TableReveal>
      ) : null}

      {hasToolbar ? (
        <div
          className={cn(
            'shrink-0',
            isPlain ? 'pb-3' : 'px-4 pt-3 pb-3'
          )}
        >
          {renderedToolbar}
        </div>
      ) : null}

      {fillHeight ? (
        <div className={bodyScrollClassName}>
          <div
            key={pageMotionKey}
            className={cn(pageTurnClassName, 'motion-reduce:animate-none')}
          >
            {renderBody()}
          </div>
        </div>
      ) : (
        <div
          key={pageMotionKey}
          className={cn(pageTurnClassName, 'motion-reduce:animate-none')}
        >
          {renderBody()}
        </div>
      )}

      {pagination ? (
        <div className="shrink-0">
          <TablePagination pagination={pagination} variant={variant} />
        </div>
      ) : null}
    </div>
  );
}
