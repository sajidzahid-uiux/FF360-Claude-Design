import type { ColumnDef, RowData } from "@tanstack/react-table";

import { Progress } from "@/shared/ui/primitives";

import type { ProgressPresetOptions } from "./types";

export function progressColumnPreset<TData extends RowData, TContext = unknown>(
  options: ProgressPresetOptions<TData, TContext>
): {
  column: ColumnDef<TData, unknown>;
  when?: ProgressPresetOptions<TData, TContext>["when"];
} {
  const column: ColumnDef<TData, unknown> = {
    id: options.id ?? "progress",
    header: () => <div className="font-semibold">{options.title}</div>,
    cell: ({ row }) => {
      const { percent, label } = options.getProgress(row.original);
      const clamped = Math.max(0, Math.min(100, percent));
      return (
        <div className="flex items-center gap-2">
          <Progress className="w-24" value={clamped} />
          {label ? <span className="text-xs">{label}</span> : null}
        </div>
      );
    },
    size: options.size,
    enableSorting: false,
    enableHiding: options.enableHiding,
  };

  return { column, when: options.when };
}
