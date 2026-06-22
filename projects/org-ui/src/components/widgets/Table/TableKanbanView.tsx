import { DragEvent, useCallback, useMemo, useState } from 'react';
import { cn } from '../../../utils/cn';
import { Loader } from '../Loader';
import { TableSelectAllCheckbox } from './TableSelectionCheckbox';
import { TableEmptyState, type TableEmptyStateProps } from './TableEmptyState';
import {
  buildKanbanMoveEvent,
  resolveKanbanDropIndex,
} from './kanbanDragUtils';
import {
  tableCollectionCanvasClass,
  tableKanbanColumnClass,
  tableKanbanColumnHeaderClass,
} from './tableCollectionStyles';
import { groupTableItemsByStatus } from './tableViewUtils';
import type { TableItemRenderContext, TableKanbanViewConfig } from './tableViewTypes';

export interface TableKanbanViewProps<T extends { id: string | number }> {
  data: T[];
  config: TableKanbanViewConfig<T>;
  isLoading?: boolean;
  loadingText?: string;
  emptyState?: TableEmptyStateProps;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectChange?: (ids: (string | number)[]) => void;
  className?: string;
}

const KANBAN_DRAG_MIME = 'application/x-fieldflow-kanban-item';

function buildItemContext<T extends { id: string | number }>(
  item: T,
  selectedIds: (string | number)[],
  onSelectChange?: (ids: (string | number)[]) => void
): TableItemRenderContext {
  const selected = selectedIds.includes(item.id);
  return {
    selected,
    onSelectedChange: (next) => {
      if (!onSelectChange) return;
      if (next) {
        if (!selectedIds.includes(item.id)) {
          onSelectChange([...selectedIds, item.id]);
        }
        return;
      }
      onSelectChange(selectedIds.filter((id) => id !== item.id));
    },
  };
}

export function TableKanbanView<T extends { id: string | number }>({
  data,
  config,
  isLoading,
  loadingText = 'Loading…',
  emptyState,
  selectable = false,
  selectedIds = [],
  onSelectChange,
  className,
}: TableKanbanViewProps<T>) {
  const grouped = useMemo(
    () => groupTableItemsByStatus(data, config.columns, config.getItemStatus),
    [config.columns, config.getItemStatus, data]
  );

  const dragEnabled = Boolean(config.draggable && config.onItemMove);
  const [draggingId, setDraggingId] = useState<string | number | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    columnKey: string;
    index: number;
  } | null>(null);

  const itemById = useMemo(() => new Map(data.map((item) => [item.id, item])), [data]);

  const clearDragState = useCallback(() => {
    setDraggingId(null);
    setDropTarget(null);
  }, []);

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>, item: T) => {
      if (!dragEnabled) return;
      if (config.isItemDragDisabled?.(item)) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData(KANBAN_DRAG_MIME, String(item.id));
      event.dataTransfer.effectAllowed = 'move';
      setDraggingId(item.id);
    },
    [config, dragEnabled]
  );

  const handleDragOverList = useCallback(
    (event: DragEvent<HTMLUListElement>, columnKey: string) => {
      if (!dragEnabled || !event.dataTransfer?.types.includes(KANBAN_DRAG_MIME)) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      const index = resolveKanbanDropIndex(event.currentTarget, event.clientY);
      setDropTarget({ columnKey, index });
    },
    [dragEnabled]
  );

  const handleDropOnList = useCallback(
    (event: DragEvent<HTMLUListElement>, columnKey: string) => {
      if (!dragEnabled || !config.onItemMove) return;
      event.preventDefault();
      const rawId = event.dataTransfer.getData(KANBAN_DRAG_MIME);
      if (!rawId) {
        clearDragState();
        return;
      }

      const item =
        itemById.get(rawId) ??
        itemById.get(Number.isNaN(Number(rawId)) ? rawId : Number(rawId));
      if (!item) {
        clearDragState();
        return;
      }

      const toIndex = resolveKanbanDropIndex(event.currentTarget, event.clientY);
      const moveEvent = buildKanbanMoveEvent(
        item,
        data,
        config.columns,
        config.getItemStatus,
        columnKey,
        toIndex
      );

      clearDragState();
      if (moveEvent) {
        void config.onItemMove(moveEvent);
      }
    },
    [clearDragState, config, data, dragEnabled, itemById]
  );

  if (isLoading) {
    return <Loader text={loadingText} centerInContainer={false} className="py-14" />;
  }

  if (data.length === 0) {
    return <TableEmptyState {...(emptyState ?? { title: 'No items yet' })} />;
  }

  const columnWidth = config.columnMinWidth ?? 'min(18rem, 85vw)';

  return (
    <div
      data-kanban-board
      className={cn(
        'table-view-body-enter w-full min-w-0',
        tableCollectionCanvasClass,
        className
      )}
    >
      <div
        role="list"
        aria-label="Kanban board"
        className="flex w-max min-w-full gap-3 px-4 py-4 pb-5 sm:gap-4"
      >
        {config.columns.map((column) => {
          const columnItems = grouped.get(column.key) ?? [];
          const columnIds = columnItems.map((item) => item.id);
          const allColumnSelected =
            columnItems.length > 0 &&
            columnIds.every((id) => selectedIds.includes(id));
          const someColumnSelected =
            columnIds.some((id) => selectedIds.includes(id)) && !allColumnSelected;
          const isDropColumn = dropTarget?.columnKey === column.key;

          const handleColumnSelectAll = () => {
            if (!onSelectChange) return;
            if (allColumnSelected) {
              onSelectChange(selectedIds.filter((id) => !columnIds.includes(id)));
              return;
            }
            const merged = new Set([...selectedIds, ...columnIds]);
            onSelectChange([...merged]);
          };

          return (
          <section
            key={column.key}
            className={cn(
              'flex shrink-0 flex-col overflow-hidden rounded-xl transition-shadow',
              tableKanbanColumnClass,
              isDropColumn && draggingId !== null && 'ring-accent/50 ring-2'
            )}
            style={{ width: columnWidth, minWidth: columnWidth, maxWidth: columnWidth }}
            aria-label={`${column.label} column`}
          >
            <header
              className={cn(tableKanbanColumnHeaderClass, 'px-3 py-3 sm:px-4')}
            >
              <div className="flex items-center gap-2">
                {selectable ? (
                  <TableSelectAllCheckbox
                    checked={allColumnSelected}
                    indeterminate={someColumnSelected}
                    onChange={handleColumnSelectAll}
                    label={`Select all in ${column.label}`}
                  />
                ) : null}
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: column.color ?? 'var(--color-accent)' }}
                  aria-hidden
                />
                <h3 className="text-text-primary min-w-0 flex-1 truncate text-sm font-semibold">
                  {column.label}
                </h3>
                <span className="bg-bg-hover text-text-muted inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums">
                  {columnItems.length}
                </span>
              </div>
            </header>

            <ul
              className="flex max-h-[min(70vh,32rem)] min-h-[12rem] flex-1 flex-col gap-2 overflow-y-auto p-3 sm:p-3.5"
              onDragOver={(event) => handleDragOverList(event, column.key)}
              onDrop={(event) => handleDropOnList(event, column.key)}
              onDragLeave={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node)) return;
                setDropTarget((current) =>
                  current?.columnKey === column.key ? null : current
                );
              }}
            >
              {columnItems.length === 0 ? (
                <li className="text-text-muted flex flex-1 items-center justify-center rounded-lg border border-dashed border-border-subtle/80 px-3 py-8 text-center text-xs">
                  {draggingId !== null ? 'Drop here' : 'No items'}
                </li>
              ) : (
                columnItems.map((item, index) => {
                  const isDragging = draggingId === item.id;
                  const showDropBefore =
                    isDropColumn && dropTarget?.index === index && !isDragging;

                  return (
                    <li key={item.id} className="relative w-full min-w-0">
                      {showDropBefore ? (
                        <span
                          className="bg-accent absolute -top-1 right-0 left-0 z-[1] h-0.5 rounded-full"
                          aria-hidden
                        />
                      ) : null}
                      <div
                        data-kanban-item
                        draggable={
                          dragEnabled && !config.isItemDragDisabled?.(item)
                        }
                        onDragStart={(event) => handleDragStart(event, item)}
                        onDragEnd={clearDragState}
                        className={cn(
                          'w-full min-w-0',
                          dragEnabled &&
                            !config.isItemDragDisabled?.(item) &&
                            'cursor-grab active:cursor-grabbing',
                          isDragging && 'opacity-45'
                        )}
                      >
                        {config.renderCard(
                          item,
                          buildItemContext(item, selectedIds, onSelectChange)
                        )}
                      </div>
                    </li>
                  );
                })
              )}
              {isDropColumn &&
              dropTarget?.index === columnItems.length &&
              columnItems.length > 0 ? (
                <li aria-hidden className="relative h-0.5 w-full">
                  <span className="bg-accent absolute inset-x-0 top-0 h-0.5 rounded-full" />
                </li>
              ) : null}
            </ul>
          </section>
          );
        })}
      </div>
    </div>
  );
}
