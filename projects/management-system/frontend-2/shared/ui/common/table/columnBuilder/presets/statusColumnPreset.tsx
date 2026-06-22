import type { ColumnDef, RowData } from "@tanstack/react-table";

import type { StatusPresetOptions } from "./types";

export function statusColumnPreset<
  TData extends RowData,
  TValue = unknown,
  TContext = unknown,
>(
  options: StatusPresetOptions<TData, TValue, TContext>
): {
  column: ColumnDef<TData, TValue>;
  when?: StatusPresetOptions<TData, TValue, TContext>["when"];
} {
  const header: ColumnDef<TData, TValue>["header"] = () => (
    <div className="font-semibold">{options.title}</div>
  );

  const cell: ColumnDef<TData, TValue>["cell"] = ({ row, getValue }) => {
    const value = getValue();
    return (
      <div className="flex items-center">
        {options.renderStatus(value as TValue, row.original)}
      </div>
    );
  };

  const base = {
    id: options.id,
    header,
    cell,
    size: options.size,
    enableSorting: false,
    enableHiding: options.enableHiding,
  };

  let column: ColumnDef<TData, TValue>;
  if (options.accessorFn !== undefined) {
    const id = options.id ?? options.accessorKey;
    if (!id) {
      throw new Error(
        "statusColumnPreset: `id` is required when using `accessorFn`."
      );
    }
    column = { ...base, id, accessorFn: options.accessorFn };
  } else if (options.accessorKey !== undefined) {
    if (options.id !== undefined) {
      column = { ...base, id: options.id, accessorKey: options.accessorKey };
    } else {
      column = { ...base, accessorKey: options.accessorKey };
    }
  } else {
    // Display-only column
    if (options.id !== undefined) {
      column = { ...base, id: options.id } as unknown as ColumnDef<
        TData,
        TValue
      >;
    } else {
      column = base as unknown as ColumnDef<TData, TValue>;
    }
  }

  return { column, when: options.when };
}
