import type { ColumnDef, RowData } from "@tanstack/react-table";

import { TableCheckbox } from "./cells/TableCheckbox";
import type {
  ActionsColumnConfig,
  ColumnBuilderBuildOptions,
  ColumnRegistration,
  SelectColumnConfig,
  SortableColumnConfig,
  StatusColumnConfig,
} from "./types";

/**
 * Generic builder for TanStack table columns.
 *
 * Step 1 scope: infrastructure only (common typed entrypoints + permission gating).
 * Presets / styling standardization will be introduced in Step 2.
 */
export class ColumnBuilder<TData extends RowData, TContext = unknown> {
  private registrations: ColumnRegistration<TData, TContext>[] = [];

  static create<TData extends RowData, TContext = unknown>() {
    return new ColumnBuilder<TData, TContext>();
  }

  /**
   * Add any arbitrary TanStack column.
   */
  addColumn(
    column: ColumnDef<TData, unknown>,
    options?: { when?: ColumnRegistration<TData, TContext>["when"] }
  ) {
    this.registrations.push({ column, when: options?.when });
    return this;
  }

  /**
   * Standard selection checkbox column using TableCheckbox component.
   */
  addSelectColumn(config?: SelectColumnConfig<TContext>) {
    const id = config?.id ?? "select";
    const enableHiding = config?.enableHiding ?? false;

    const column: ColumnDef<TData, unknown> = {
      id,
      header: ({ table }) => {
        const isAllSelected = table.getIsAllPageRowsSelected();
        const isSomeSelected = table.getIsSomePageRowsSelected();

        return (
          <TableCheckbox
            aria-label="Select all"
            checked={isAllSelected || isSomeSelected}
            indeterminate={isSomeSelected && !isAllSelected}
            onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
          />
        );
      },
      cell: ({ row }) => (
        <TableCheckbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onChange={(checked) => row.toggleSelected(checked)}
        />
      ),
      size: config?.size,
      enableSorting: false,
      enableHiding,
    };

    return this.addColumn(column, { when: config?.when });
  }

  /**
   * Sortable column helper (behavior is driven by TanStack; header presets come in Step 2).
   */
  addSortableColumn<TValue = unknown>(
    config: SortableColumnConfig<TData, TValue, TContext>
  ) {
    const base = {
      header: config.header,
      cell: config.cell,
      size: config.size,
      enableSorting: config.enableSorting ?? true,
      enableHiding: config.enableHiding,
      meta: config.meta,
    };

    let column: ColumnDef<TData, TValue>;
    if (config.accessorFn !== undefined) {
      const id = config.id ?? config.accessorKey;
      if (!id) {
        throw new Error(
          "ColumnBuilder.addSortableColumn: `id` is required when using `accessorFn`."
        );
      }
      column = { ...base, id, accessorFn: config.accessorFn };
    } else if (config.accessorKey !== undefined) {
      if (config.id !== undefined) {
        column = { ...base, id: config.id, accessorKey: config.accessorKey };
      } else {
        column = { ...base, accessorKey: config.accessorKey };
      }
    } else {
      // Display-only column
      if (config.id !== undefined) {
        column = { ...base, id: config.id } as unknown as ColumnDef<
          TData,
          TValue
        >;
      } else {
        column = base as unknown as ColumnDef<TData, TValue>;
      }
    }

    return this.addColumn(column as ColumnDef<TData, unknown>, {
      when: config.when,
    });
  }

  /**
   * Status column helper (rendering/visual standardization comes in Step 2).
   */
  addStatusColumn<TValue = unknown>(
    config: StatusColumnConfig<TData, TValue, TContext>
  ) {
    const base = {
      header: config.header,
      cell: config.cell,
      size: config.size,
      enableSorting: config.enableSorting ?? false,
      enableHiding: config.enableHiding,
      meta: config.meta,
    };

    let column: ColumnDef<TData, TValue>;
    if (config.accessorFn !== undefined) {
      const id = config.id ?? config.accessorKey;
      if (!id) {
        throw new Error(
          "ColumnBuilder.addStatusColumn: `id` is required when using `accessorFn`."
        );
      }
      column = { ...base, id, accessorFn: config.accessorFn };
    } else if (config.accessorKey !== undefined) {
      if (config.id !== undefined) {
        column = { ...base, id: config.id, accessorKey: config.accessorKey };
      } else {
        column = { ...base, accessorKey: config.accessorKey };
      }
    } else {
      // Display-only column
      if (config.id !== undefined) {
        column = { ...base, id: config.id } as unknown as ColumnDef<
          TData,
          TValue
        >;
      } else {
        column = base as unknown as ColumnDef<TData, TValue>;
      }
    }

    return this.addColumn(column as ColumnDef<TData, unknown>, {
      when: config.when,
    });
  }

  /**
   * Actions column helper (dropdown/menu contents stay table-specific; UI preset comes in Step 2).
   */
  addActionsColumn(config: ActionsColumnConfig<TData, TContext>) {
    const id = config.id ?? "actions";
    const enableHiding = config.enableHiding ?? false;

    const column: ColumnDef<TData, unknown> = {
      id,
      header: config.header ?? "",
      cell: config.cell,
      size: config.size,
      enableSorting: false,
      enableHiding,
    };

    return this.addColumn(column, { when: config.when });
  }

  build(
    options?: ColumnBuilderBuildOptions<TContext>
  ): ColumnDef<TData, unknown>[] {
    const context = options?.context;
    return this.registrations
      .filter((r) => {
        if (!r.when) return true;
        if (context === undefined) return true;
        return r.when(context);
      })
      .map((r) => r.column);
  }
}
