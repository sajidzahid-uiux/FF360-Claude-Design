"use client";

import { useMemo } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { InstalledFootageLogEntry } from "@/api/types/installedFootageLogs";
import { Dropdown } from "@/shared/ui/common";

export function FootageRowActions({
  entry,
  disabled,
  canModify,
  onEdit,
  onDelete,
}: {
  entry: InstalledFootageLogEntry;
  disabled?: boolean;
  canModify: boolean;
  onEdit: (e: InstalledFootageLogEntry) => void;
  onDelete: (e: InstalledFootageLogEntry) => void;
}) {
  const items = useMemo(
    () => [
      {
        id: "edit",
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onSelect: () => onEdit(entry),
      },
      {
        id: "delete",
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        destructive: true,
        onSelect: () => onDelete(entry),
      },
    ],
    [entry, onEdit, onDelete]
  );

  if (!canModify) {
    return (
      <span className="text-text-muted inline-block min-w-8 text-center text-sm">
        —
      </span>
    );
  }

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
