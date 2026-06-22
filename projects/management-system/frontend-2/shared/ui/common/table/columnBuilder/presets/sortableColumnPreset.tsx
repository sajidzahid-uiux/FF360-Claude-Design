import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import type { Column, ColumnDef, RowData } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import type { SortDirection, SortablePresetOptions } from "./types";

function toSortDirection(value: false | "asc" | "desc"): SortDirection {
  if (value === false) return null;
  return value;
}

function toggleSort<TData extends RowData, TValue>(
  column: Column<TData, TValue>
) {
  const current = column.getIsSorted(); // false | 'asc' | 'desc'
  if (current === false) {
    column.toggleSorting(false); // asc
  } else if (current === "asc") {
    column.toggleSorting(true); // desc
  } else {
    column.clearSorting(); // none
  }
}

export function sortableColumnPreset<
  TData extends RowData,
  TValue = unknown,
  TContext = unknown,
>(
  options: SortablePresetOptions<TData, TValue, TContext>
): {
  column: ColumnDef<TData, TValue>;
  when?: SortablePresetOptions<TData, TValue, TContext>["when"];
} {
  const sortBy = options.sortBy ?? options.accessorKey ?? options.id ?? "";

  const header: ColumnDef<TData, TValue>["header"] = ({ column }) => {
    return (
      <div
        className="flex items-center gap-2 select-none"
        onClick={() => {
          // backend sort callback first, then local UI state for feedback
          if (options.onSortChange) {
            const current = toSortDirection(column.getIsSorted());
            const next: SortDirection =
              current === null ? "asc" : current === "asc" ? "desc" : null;
            options.onSortChange(sortBy, next);
          }

          toggleSort(column);
        }}
      >
        <Button
          aria-label={options.title}
          className="justify-start"
          title={options.title}
          variant={ButtonVariantEnum.GHOST}
        />
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4" />
        )}
      </div>
    );
  };

  const base = {
    id: options.id,
    header,
    cell: options.cell,
    size: options.size,
    enableSorting: true,
    enableHiding: options.enableHiding,
  };

  let column: ColumnDef<TData, TValue>;
  if (options.accessorFn !== undefined) {
    const id = options.id ?? options.accessorKey;
    if (!id) {
      throw new Error(
        "sortableColumnPreset: `id` is required when using `accessorFn`."
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
