import { ReactNode } from 'react';

export const TableViewModeEnum = {
  LIST: 'list',
  GRID: 'grid',
  KANBAN: 'kanban',
} as const;

export type TableViewMode =
  (typeof TableViewModeEnum)[keyof typeof TableViewModeEnum];

/** Context passed to grid/kanban card renderers (selection, etc.). */
export interface TableItemRenderContext {
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
}

export interface TableKanbanColumnDefinition {
  key: string;
  label: string;
  /** Accent dot color for the column header. */
  color?: string;
}

export interface TableGridViewConfig<T extends { id: string | number }> {
  renderCard: (item: T, context: TableItemRenderContext) => ReactNode;
  /** CSS grid min column width. Default `minmax(16rem, 1fr)`. */
  minColumnWidth?: string;
}

export interface TableKanbanMoveEvent<T> {
  item: T;
  fromColumnKey: string;
  toColumnKey: string;
  fromIndex: number;
  toIndex: number;
}

export interface TableKanbanViewConfig<T extends { id: string | number }> {
  columns: TableKanbanColumnDefinition[];
  /** Fixed column width for horizontal scrolling boards. Default `min(18rem, 85vw)`. */
  columnMinWidth?: string;
  getItemStatus: (item: T) => string;
  renderCard: (item: T, context: TableItemRenderContext) => ReactNode;
  /** Enables drag-and-drop between columns. Requires {@link onItemMove}. */
  draggable?: boolean;
  /**
   * Called when a card is dropped in a new column or position.
   * Parent should call the API and refresh data (optimistic updates optional).
   */
  onItemMove?: (event: TableKanbanMoveEvent<T>) => void | Promise<void>;
  /** When true, card cannot be dragged (e.g. archived rows). */
  isItemDragDisabled?: (item: T) => boolean;
}
