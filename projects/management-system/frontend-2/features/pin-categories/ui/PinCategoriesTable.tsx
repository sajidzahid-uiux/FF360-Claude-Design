"use client";

import { useMemo } from "react";

import {
  Button,
  ButtonVariantEnum,
  type Column,
  ComponentSizeEnum,
  TableDataModeEnum,
  TableVariantEnum,
} from "@fieldflow360/org-ui";
import { Pencil, Trash2 } from "lucide-react";

import type { MapPinCategory } from "@/api/types/mapPinCategory";
import { CmsOrgUiTable } from "@/shared/ui";

import {
  canDeletePinCategory,
  getPinCategoryColorLabel,
} from "../lib/pinCategoryColors";

function CategoryDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="inline-block h-4 w-4 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function PinCountLabel({ count }: { count: number }) {
  return (
    <span>
      {count} {count === 1 ? "Pin" : "Pins"}
    </span>
  );
}

export interface PinCategoriesTableProps {
  categories: MapPinCategory[];
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit: (category: MapPinCategory) => void;
  onDelete: (category: MapPinCategory) => void;
}

export function PinCategoriesTable({
  categories,
  canEdit = true,
  canDelete = true,
  onEdit,
  onDelete,
}: PinCategoriesTableProps) {
  const columns = useMemo((): Column<MapPinCategory>[] => {
    const actionColumns: Column<MapPinCategory>[] = [];

    if (canEdit || canDelete) {
      actionColumns.push({
        key: "actions",
        label: "",
        hideable: false,
        width: "6rem",
        header: <span className="sr-only">Actions</span>,
        render: (category) => {
          const deleteAllowed = canDeletePinCategory(category.pin_count);
          return (
            <div className="flex items-center justify-end gap-1">
              {canEdit ? (
                <Button
                  aria-label={`Edit ${category.name}`}
                  leftIcon={<Pencil aria-hidden className="h-4 w-4" />}
                  size={ComponentSizeEnum.SM}
                  title="Edit"
                  variant={ButtonVariantEnum.GHOST}
                  onClick={() => onEdit(category)}
                />
              ) : null}
              {canDelete ? (
                <Button
                  aria-label={`Delete ${category.name}`}
                  disabled={!deleteAllowed}
                  leftIcon={<Trash2 aria-hidden className="h-4 w-4" />}
                  size={ComponentSizeEnum.SM}
                  title="Delete"
                  variant={ButtonVariantEnum.GHOST}
                  onClick={() => onDelete(category)}
                />
              ) : null}
            </div>
          );
        },
      });
    }

    return [
      {
        key: "name",
        label: "Category name",
        header: "Category name",
        render: (category) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <CategoryDot color={category.color} />
            <span className="text-text-primary truncate text-sm font-medium">
              {category.name}
            </span>
          </div>
        ),
      },
      {
        key: "color",
        label: "Color",
        header: "Color",
        render: (category) => (
          <div className="flex items-center gap-2.5">
            <CategoryDot color={category.color} />
            <span className="text-text-muted text-sm">
              {getPinCategoryColorLabel(category.color)}
            </span>
          </div>
        ),
      },
      {
        key: "pin_count",
        label: "Assigned pins",
        header: "Assigned pins",
        render: (category) => (
          <span className="text-text-muted text-sm">
            <PinCountLabel count={category.pin_count ?? 0} />
          </span>
        ),
      },
      ...actionColumns,
    ];
  }, [canDelete, canEdit, onDelete, onEdit]);

  if (categories.length === 0) {
    return (
      <p className="text-text-muted py-8 text-center text-sm">
        No categories yet. Create your first pin category to get started.
      </p>
    );
  }

  return (
    <CmsOrgUiTable
      compact
      showHeaderWhenEmpty
      columns={columns}
      data={categories}
      dataMode={TableDataModeEnum.CLIENT}
      emptyState={{
        title: "No categories",
        description: "Create your first pin category to get started.",
      }}
      variant={TableVariantEnum.PLAIN}
    />
  );
}
