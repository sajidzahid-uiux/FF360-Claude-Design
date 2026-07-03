"use client";

import { useCallback, useMemo, useState } from "react";

import {
  Button,
  type Column,
  Pencil,
  type TableAction,
  TableActions,
  TableDataModeEnum,
  TableToolbar,
  TableVariantEnum,
  Trash2,
} from "@fieldflow360/org-ui";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { ContactCategory } from "@/api/types";
import { CategoryDialog } from "@/features/contacts";
import { useCategoryMutations, useDialogManager } from "@/hooks";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { CmsOrgUiTable } from "@/shared/ui";
import { DialogManager } from "@/shared/ui/common";
import { getErrorMessage } from "@/utils/apiError";

function filterCategories(
  categories: ContactCategory[],
  query: string
): ContactCategory[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return categories;

  return categories.filter((category) =>
    category.name.toLowerCase().includes(normalized)
  );
}

function buildCategoryActions(
  category: ContactCategory,
  handlers: {
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (category: ContactCategory) => void;
    onDelete: (category: ContactCategory) => void;
  }
): TableAction<ContactCategory>[] {
  const actions: TableAction<ContactCategory>[] = [];

  if (handlers.canEdit) {
    actions.push({
      label: "Edit",
      icon: <Pencil aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: handlers.onEdit,
    });
  }

  if (handlers.canDelete && !category.is_default) {
    actions.push({
      label: "Delete",
      icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
      variant: "danger",
      onClick: handlers.onDelete,
    });
  }

  return actions;
}

export interface CategoriesTabProps {
  categories: ContactCategory[];
  isLoading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function CategoriesTab({
  categories,
  isLoading = false,
  canEdit = false,
  canDelete = false,
}: CategoriesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { stack, openModal, closeModalKey } = useModalStack();

  const showAddCategoryDialog = stack.some((f) => f.key === "add-category");
  const editFrame = stack.find((f) => f.key === "edit-category");
  const editDialogOpen = editFrame !== undefined;
  const editingCategoryId = editFrame
    ? Number(editFrame.params.id)
    : null;
  const editingCategory = useMemo(
    () =>
      editingCategoryId !== null
        ? (categories.find((c) => c.id === editingCategoryId) ?? null)
        : null,
    [categories, editingCategoryId]
  );

  const dialogManager = useDialogManager();
  const {
    create: createCategory,
    update: updateCategory,
    remove: deleteCategory,
  } = useCategoryMutations();

  const filteredCategories = useMemo(
    () => filterCategories(categories, searchQuery),
    [categories, searchQuery]
  );

  const handleEdit = useCallback(
    (category: ContactCategory) => {
      openModal("edit-category", { id: String(category.id) });
    },
    [openModal]
  );

  const handleDelete = useCallback(
    (category: ContactCategory) => {
      dialogManager.openConfirmationDialog({
        title: "Category",
        confirmationType: "delete",
        itemTitle: category.name,
        variant: "destructive",
        onConfirm: async () => {
          if ((category.contact_count ?? 0) > 0) {
            toast.error("Cannot delete category with contacts");
            throw new Error("Cannot delete category with contacts");
          }
          await deleteCategory.mutateAsync(category.id);
        },
      });
    },
    [dialogManager, deleteCategory]
  );

  const handleCreateCategory = async (name: string, color: string) => {
    await createCategory.mutateAsync({ name, color });
  };

  const handleSaveEdit = async (name: string, color: string) => {
    if (!editingCategory) return;

    try {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        data: { name, color },
      });
      closeModalKey("edit-category");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update category"));
      throw error;
    }
  };

  const columns = useMemo((): Column<ContactCategory>[] => {
    const actionHandlers = {
      canEdit,
      canDelete,
      onEdit: handleEdit,
      onDelete: handleDelete,
    };

    return [
      {
        key: "color",
        label: "",
        hideable: false,
        width: "3rem",
        header: <span className="sr-only">Color</span>,
        render: (category) => (
          <span
            aria-hidden
            className="border-border-subtle inline-block h-3 w-3 shrink-0 rounded-full border"
            style={{ backgroundColor: category.color || "#3b82f6" }}
          />
        ),
      },
      {
        key: "name",
        label: "Category",
        header: "Category",
        render: (category) => (
          <p className="text-text-primary truncate text-sm font-medium">
            {category.is_default ? `${category.name} (default)` : category.name}
          </p>
        ),
      },
      {
        key: "contact_count",
        label: "Contacts",
        header: "Contacts",
        width: "8rem",
        render: (category) => {
          const count = category.contact_count ?? 0;
          return (
            <p className="text-text-muted text-sm tabular-nums">
              {count === 1 ? "1 contact" : `${count} contacts`}
            </p>
          );
        },
      },
      {
        key: "actions",
        label: "",
        hideable: false,
        align: "right",
        width: "4rem",
        header: <span className="sr-only">Actions</span>,
        render: (category) => {
          const actions = buildCategoryActions(category, actionHandlers);
          if (actions.length === 0) return null;
          return <TableActions actions={actions} item={category} />;
        },
      },
    ];
  }, [canDelete, canEdit, handleDelete, handleEdit]);

  const emptyTitle = searchQuery.trim()
    ? "No categories match your search"
    : "No categories yet";
  const emptyDescription = searchQuery.trim()
    ? "Try another name or clear the search field."
    : canEdit
      ? "Add a category to organize your contacts."
      : "Categories will appear here once they are created.";

  return (
    <>
      <div className="w-full">
        <CmsOrgUiTable
          showHeaderWhenEmpty
          columns={columns}
          data={filteredCategories}
          dataMode={TableDataModeEnum.CLIENT}
          emptyState={{
            title: emptyTitle,
            description: emptyDescription,
          }}
          isLoading={isLoading}
          toolbar={
            <TableToolbar
              actions={
                canEdit ? (
                  <Button
                    leftIcon={
                      <Plus aria-hidden className="h-4 w-4" strokeWidth={2} />
                    }
                    title="Add category"
                    onClick={() => openModal("add-category")}
                  />
                ) : undefined
              }
              search={{
                value: searchQuery,
                onChange: setSearchQuery,
                placeholder: "Search categories…",
              }}
              showViewSwitcher={false}
            />
          }
          variant={TableVariantEnum.PLAIN}
        />
      </div>

      <CategoryDialog
        categoryColor=""
        categoryName=""
        open={showAddCategoryDialog}
        title="Add New Category"
        onOpenChange={(o) => {
          if (!o) closeModalKey("add-category");
        }}
        onSave={handleCreateCategory}
      />

      <CategoryDialog
        categoryColor={editingCategory?.color || "#FFFFFF"}
        categoryName={editingCategory?.name || ""}
        isDefault={editingCategory?.is_default || false}
        open={editDialogOpen}
        title="Edit Category"
        onCancel={() => {
          closeModalKey("edit-category");
        }}
        onOpenChange={(o) => {
          if (!o) closeModalKey("edit-category");
        }}
        onSave={handleSaveEdit}
      />

      <DialogManager manager={dialogManager} />
    </>
  );
}
