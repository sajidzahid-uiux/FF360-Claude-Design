import type { ColumnDef, RowData } from "@tanstack/react-table";

import type { ColumnVisibilityPredicate } from "../types";

export type SortDirection = "asc" | "desc" | null;

export interface PresetOptions<TContext> {
  /**
   * Optional permission gate for the column.
   * If you pass this into ColumnBuilder via `addColumn(column, { when })`,
   * it will be evaluated against the build context.
   */
  when?: ColumnVisibilityPredicate<TContext>;
}

export interface SelectPresetOptions<TContext> extends PresetOptions<TContext> {
  id?: string; // defaults to "select"
  size?: number;
  enableHiding?: boolean; // defaults to false
}

export interface ActionsPresetOptions<
  TData extends RowData,
  TContext,
> extends PresetOptions<TContext> {
  id?: string; // defaults to "actions"
  header?: ColumnDef<TData, unknown>["header"];
  cell: ColumnDef<TData, unknown>["cell"];
  size?: number;
  enableHiding?: boolean; // defaults to false
}

export interface SortablePresetOptions<
  TData extends RowData,
  TValue,
  TContext,
> extends PresetOptions<TContext> {
  id?: string;
  accessorKey?: string;
  accessorFn?: (row: TData) => TValue;
  title: string;
  cell?: ColumnDef<TData, TValue>["cell"];
  size?: number;
  enableHiding?: boolean;
  /**
   * Optional backend sort callback; allows tables that do server sorting to
   * stay consistent with UI sort toggles.
   */
  onSortChange?: (sortBy: string, direction: SortDirection) => void;
  /**
   * sortBy value sent to onSortChange (defaults to accessorKey or id).
   */
  sortBy?: string;
}

export interface StatusPresetOptions<
  TData extends RowData,
  TValue,
  TContext,
> extends PresetOptions<TContext> {
  id?: string;
  accessorKey?: string;
  accessorFn?: (row: TData) => TValue;
  title: string;
  /**
   * Render a badge-like status. Preset standardizes the wrapper.
   */
  renderStatus: (value: TValue, row: TData) => React.ReactNode;
  size?: number;
  enableHiding?: boolean;
}

export interface ProgressPresetOptions<
  TData extends RowData,
  TContext,
> extends PresetOptions<TContext> {
  id?: string;
  title: string;
  /**
   * Provide percent 0..100 for the progress bar and optional label.
   */
  getProgress: (row: TData) => { percent: number; label?: string | null };
  size?: number;
  enableHiding?: boolean;
}
