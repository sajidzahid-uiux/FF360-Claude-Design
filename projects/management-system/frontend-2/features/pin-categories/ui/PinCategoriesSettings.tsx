"use client";

import { useCallback, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { MapPinCategory } from "@/api/types/mapPinCategory";
import { useMapPinCategoryMutations } from "@/hooks/mutations/useMapPinCategoryMutations";
import { useRoutePermissions } from "@/hooks/permissions";
import { useMapPinCategories } from "@/hooks/queries/useMapPinCategories";
import { useDialogManager } from "@/hooks/useDialogManager";
import { DialogManager } from "@/shared/ui/common";
import { getErrorMessage } from "@/utils/apiError";

import { canDeletePinCategory } from "../lib/pinCategoryColors";
import { PinCategoriesTable } from "./PinCategoriesTable";
import { PinCategoryEditorDialog } from "./PinCategoryEditorDialog";

type EditorMode = "create" | "edit" | null;

export interface PinCategoriesSettingsProps {
  useSettingsPrefix?: boolean;
  compact?: boolean;
}

export function PinCategoriesSettings({
  useSettingsPrefix = false,
  compact = false,
}: PinCategoriesSettingsProps) {
  const dialogManager = useDialogManager();
  const {
    read: canView,
    write: canEdit,
    delete: canDelete,
  } = useRoutePermissions() || {};

  const { categories, isLoading, error } = useMapPinCategories({
    useSettingsPrefix,
  });
  const { createCategory, updateCategory, deleteCategory } =
    useMapPinCategoryMutations({ useSettingsPrefix });

  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [editingCategory, setEditingCategory] = useState<MapPinCategory | null>(
    null
  );

  const isEditorOpen = editorMode !== null;
  const isSaving = createCategory.isPending || updateCategory.isPending;

  const editorInitialValues = useMemo(() => {
    if (editorMode === "edit" && editingCategory) {
      return {
        name: editingCategory.name,
        color: editingCategory.color,
      };
    }
    return { name: "", color: undefined };
  }, [editorMode, editingCategory]);

  const handleOpenCreate = useCallback(() => {
    setEditingCategory(null);
    setEditorMode("create");
  }, []);

  const handleOpenEdit = useCallback((category: MapPinCategory) => {
    setEditingCategory(category);
    setEditorMode("edit");
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditorMode(null);
    setEditingCategory(null);
  }, []);

  const handleSave = useCallback(
    async (name: string, color: string) => {
      if (!canEdit) {
        toast.error("You don't have permission to edit categories");
        return;
      }

      try {
        if (editorMode === "edit" && editingCategory) {
          await updateCategory.mutateAsync({
            id: editingCategory.id,
            data: { name, color },
          });
        } else {
          await createCategory.mutateAsync({ name, color });
        }
        handleCloseEditor();
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to save category"));
        throw error;
      }
    },
    [
      canEdit,
      createCategory,
      editorMode,
      editingCategory,
      handleCloseEditor,
      updateCategory,
    ]
  );

  const handleDelete = useCallback(
    (category: MapPinCategory) => {
      if (!canDelete) {
        toast.error("You don't have permission to delete categories");
        return;
      }

      if (!canDeletePinCategory(category.pin_count)) {
        toast.error("Cannot delete a category with assigned pins");
        return;
      }

      dialogManager.openConfirmationDialog({
        title: "Delete Category",
        confirmationType: "delete",
        itemTitle: category.name,
        variant: "destructive",
        onConfirm: async () => {
          await deleteCategory.mutateAsync(category.id);
        },
      });
    },
    [canDelete, deleteCategory, dialogManager]
  );

  if (!canView) {
    return (
      <p className="text-text-muted py-8 text-center text-sm">
        You don&apos;t have permission to view pin categories.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="text-text-muted py-8 text-center text-sm">
        Loading pin categories...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-feedback-error py-8 text-center text-sm">
        Failed to load pin categories.
      </p>
    );
  }

  return (
    <>
      <div className={compact ? "space-y-4" : "space-y-6"}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              className={
                compact
                  ? "text-text-primary text-lg font-bold"
                  : "text-text-primary text-xl font-bold sm:text-2xl"
              }
            >
              Pin Categories
            </h2>
            <p className="text-text-muted mt-1 text-sm">
              Configure organization-wide pin categories used across Leads and
              Jobs
            </p>
          </div>
          {canEdit ? (
            <Button
              disabled={isEditorOpen}
              leftIcon={<Plus aria-hidden className="h-4 w-4" />}
              size={ComponentSizeEnum.SM}
              title="Create Category"
              variant={ButtonVariantEnum.ACCENT}
              onClick={handleOpenCreate}
            />
          ) : null}
        </div>

        <PinCategoryEditorDialog
          disabled={!canEdit}
          initialColor={editorInitialValues.color}
          initialName={editorInitialValues.name}
          isSaving={isSaving}
          mode={editorMode === "edit" ? "edit" : "create"}
          open={isEditorOpen}
          onOpenChange={(open) => {
            if (!open) handleCloseEditor();
          }}
          onSave={handleSave}
        />

        <PinCategoriesTable
          canDelete={canDelete}
          canEdit={canEdit}
          categories={categories}
          onDelete={handleDelete}
          onEdit={handleOpenEdit}
        />
      </div>

      <DialogManager manager={dialogManager} />
    </>
  );
}
