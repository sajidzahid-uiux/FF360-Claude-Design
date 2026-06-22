import type { ColumnDef, RowData } from "@tanstack/react-table";

import { TableCheckbox } from "../cells/TableCheckbox";
import type { SelectPresetOptions } from "./types";

export function selectColumnPreset<TData extends RowData, TContext = unknown>(
  options?: SelectPresetOptions<TContext>
): {
  column: ColumnDef<TData, unknown>;
  when?: SelectPresetOptions<TContext>["when"];
} {
  const id = options?.id ?? "select";
  const enableHiding = options?.enableHiding ?? false;

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
    size: options?.size,
    enableSorting: false,
    enableHiding,
  };

  return { column, when: options?.when };
}
