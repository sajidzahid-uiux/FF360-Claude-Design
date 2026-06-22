"use client";

import { FootageRowActions } from "./FootageRowActions";
import { formatLogDate, memberLabel, wallTypeLabel } from "./footageLogFormat";
import type { FootageLogTableProps } from "./footageLogTableTypes";

export function MainFootageTable({
  rows,
  isLoading,
  isError,
  disabled,
  actionsBusy,
  canModifyRow,
  onEdit,
  onDelete,
}: FootageLogTableProps) {
  if (isLoading) {
    return <p className="text-text-muted py-6 text-center text-sm">Loading…</p>;
  }
  if (isError) {
    return (
      <p className="text-feedback-error py-6 text-center text-sm">
        Could not load installed footage logs.
      </p>
    );
  }
  if (rows.length === 0) {
    return (
      <p className="text-text-muted py-6 text-center text-sm">
        No main line entries yet.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th className="px-4 py-4 font-semibold">Member</th>
            <th className="px-4 py-4 font-semibold">Date</th>
            <th className="px-4 py-4 font-semibold">Size</th>
            <th className="px-4 py-4 font-semibold">Installed</th>
            <th aria-label="Row actions" className="w-16 min-w-16 px-2 py-4" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.log_type !== "main") return null;
            const mod = canModifyRow(row);
            return (
              <tr key={`main:${row.id}`} className="border-t align-top">
                <td className="px-4 py-5">{memberLabel(row)}</td>
                <td className="px-4 py-5">{formatLogDate(row.date)}</td>
                <td className="px-4 py-5">
                  {row.size != null && row.size !== "" ? String(row.size) : "—"}{" "}
                  <span className="text-text-muted text-xs">
                    ({wallTypeLabel(row.pipe_wall_type)})
                  </span>
                </td>
                <td className="px-4 py-5">{row.installed} ft</td>
                <td className="px-2 py-3 text-center">
                  <div className="flex justify-center">
                    <FootageRowActions
                      canModify={mod}
                      disabled={disabled || actionsBusy}
                      entry={row}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
