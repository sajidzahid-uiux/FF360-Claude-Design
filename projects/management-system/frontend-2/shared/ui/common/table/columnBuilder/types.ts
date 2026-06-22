import type { ColumnDef, RowData } from "@tanstack/react-table";

export type ColumnVisibilityPredicate<TContext> = (
  context: TContext
) => boolean;

export interface ColumnBuilderBuildOptions<TContext> {
  /**
   * Optional context used for permissions / feature flags.
   * If omitted, all columns are returned.
   */
  context?: TContext;
}

export interface ColumnRegistration<TData extends RowData, TContext> {
  column: ColumnDef<TData, unknown>;
  when?: ColumnVisibilityPredicate<TContext>;
}

export interface SelectColumnConfig<TContext> {
  /**
   * Column id used by table renderers (some renderers treat `select` specially).
   * Defaults to "select".
   */
  id?: string;
  size?: number;
  when?: ColumnVisibilityPredicate<TContext>;
  /**
   * Defaults to false (selection columns should not be hidable).
   */
  enableHiding?: boolean;
}

export interface SortableColumnConfig<
  TData extends RowData,
  TValue = unknown,
  TContext = unknown,
> {
  id?: string;
  accessorKey?: string;
  accessorFn?: (row: TData) => TValue;
  header: ColumnDef<TData, TValue>["header"];
  cell?: ColumnDef<TData, TValue>["cell"];
  size?: number;
  enableSorting?: boolean;
  enableHiding?: boolean;
  meta?: ColumnDef<TData, TValue>["meta"];
  when?: ColumnVisibilityPredicate<TContext>;
}

export interface StatusColumnConfig<
  TData extends RowData,
  TValue = unknown,
  TContext = unknown,
> {
  id?: string;
  accessorKey?: string;
  accessorFn?: (row: TData) => TValue;
  header: ColumnDef<TData, TValue>["header"];
  cell: ColumnDef<TData, TValue>["cell"];
  size?: number;
  enableSorting?: boolean;
  enableHiding?: boolean;
  meta?: ColumnDef<TData, TValue>["meta"];
  when?: ColumnVisibilityPredicate<TContext>;
}

export interface ActionsColumnConfig<
  TData extends RowData,
  TContext = unknown,
> {
  /**
   * Column id used by table renderers (some renderers treat `actions` specially).
   * Defaults to "actions".
   */
  id?: string;
  header?: ColumnDef<TData, unknown>["header"];
  cell: ColumnDef<TData, unknown>["cell"];
  size?: number;
  when?: ColumnVisibilityPredicate<TContext>;
  /**
   * Defaults to false (actions columns should not be hidable).
   */
  enableHiding?: boolean;
}
