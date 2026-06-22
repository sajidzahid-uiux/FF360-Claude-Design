import { useMemo } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Dropdown } from "@/shared/ui/common";

import type { InstalledHoursLogRow } from "../model/types";

function memberIdsMatch(
  entryMemberId: number | string | null | undefined,
  currentMemberId: number | null
): boolean {
  if (currentMemberId == null) return false;
  if (entryMemberId == null || entryMemberId === "") return false;
  return Number(entryMemberId) === Number(currentMemberId);
}

function formatHours(hours: number): string {
  const n = Number.isFinite(hours) ? hours : 0;
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function InstalledHoursRowActions({
  row,
  disabled = false,
  onEdit,
  onDelete,
}: {
  row: InstalledHoursLogRow;
  disabled?: boolean;
  onEdit: (row: InstalledHoursLogRow) => void;
  onDelete: (row: InstalledHoursLogRow) => void;
}) {
  const items = useMemo(
    () => [
      {
        id: "edit",
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onSelect: () => onEdit(row),
      },
      {
        id: "delete",
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        destructive: true,
        onSelect: () => onDelete(row),
      },
    ],
    [row, onEdit, onDelete]
  );

  return (
    <Dropdown
      align="end"
      disabled={disabled}
      items={items}
      side="bottom"
      trigger={
        <Button
          iconOnly
          aria-label="More actions"
          disabled={disabled}
          leftIcon={<MoreHorizontal className="h-4 w-4" />}
          size={ComponentSizeEnum.SM}
          variant={ButtonVariantEnum.GHOST}
        />
      }
      triggerAriaLabel="More actions"
      width="auto"
    />
  );
}

export interface InstalledHoursLogsTableProps {
  rows: InstalledHoursLogRow[];
  /** When set, only rows with matching `enteredByMemberId` show edit/delete. */
  currentMemberId: number | null;
  /** When true, the current user may edit/delete their own entries (subject to row match). */
  canModifyOwnEntries?: boolean;
  actionsDisabled?: boolean;
  onEdit?: (row: InstalledHoursLogRow) => void;
  onDelete?: (row: InstalledHoursLogRow) => void;
}

export function InstalledHoursLogsTable({
  rows,
  currentMemberId,
  canModifyOwnEntries = false,
  actionsDisabled = false,
  onEdit,
  onDelete,
}: InstalledHoursLogsTableProps) {
  const showActionsColumn =
    canModifyOwnEntries && onEdit != null && onDelete != null;

  if (rows.length === 0) {
    return (
      <p className="text-text-muted py-6 text-center text-sm">
        No installed hours entries yet.
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
            <th className="px-4 py-4 font-semibold">Hours</th>
            <th className="px-4 py-4 font-semibold">Description</th>
            {showActionsColumn ? (
              <th
                aria-label="Row actions"
                className="w-16 min-w-16 px-2 py-4"
              />
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isOwnEntry = memberIdsMatch(
              row.enteredByMemberId,
              currentMemberId
            );
            const showRowMenu = showActionsColumn && isOwnEntry;

            return (
              <tr key={row.id} className="border-t align-top">
                <td className="px-4 py-5">{row.member}</td>
                <td className="px-4 py-5">{row.date}</td>
                <td className="px-4 py-5">{formatHours(row.hours)}</td>
                <td className="px-4 py-5">{row.description}</td>
                {showActionsColumn ? (
                  <td className="px-2 py-3 text-center">
                    <div className="flex justify-center">
                      {showRowMenu ? (
                        <InstalledHoursRowActions
                          disabled={actionsDisabled}
                          row={row}
                          onDelete={onDelete!}
                          onEdit={onEdit!}
                        />
                      ) : (
                        <span className="text-text-muted inline-block min-w-8 text-center text-sm">
                          —
                        </span>
                      )}
                    </div>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
