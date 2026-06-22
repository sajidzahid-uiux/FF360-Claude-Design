import type { ColumnDef, RowData } from "@tanstack/react-table";

import type { ActionsPresetOptions } from "./types";

export function actionsColumnPreset<TData extends RowData, TContext = unknown>(
  options: ActionsPresetOptions<TData, TContext>
): {
  column: ColumnDef<TData, unknown>;
  when?: ActionsPresetOptions<TData, TContext>["when"];
} {
  const id = options.id ?? "actions";
  const enableHiding = options.enableHiding ?? false;

  const column: ColumnDef<TData, unknown> = {
    id,
    header: options.header ?? "",
    cell: options.cell,
    size: options.size,
    enableSorting: false,
    enableHiding,
  };

  return { column, when: options.when };
}
