"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { applyTableSort } from "@fieldflow360/org-ui";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QuickActionsService } from "@/api/services";
import type { QuickAction, QuickActionCreatePayload } from "@/api/types";
import {
  AddQuickActionModal,
  EditQuickActionModal,
  type QuickActionFormValues,
  QuickActionsTable,
} from "@/features/quick-actions";
import { useDialogManager, useMapping, useRouteIds } from "@/hooks";
import { useCreateQuickAction, useDeleteQuickAction } from "@/hooks/mutations";
import {
  QUICK_ACTIONS_QUERY_KEY,
  useIsAdmin,
  useQuickActions,
} from "@/hooks/queries";
import { APP_ROUTES, orgPath } from "@/shared/config/routes";
import type { ContentTypeMapping } from "@/shared/lib";
import { bulkConfirmationCopy, bulkDeleteSuccessMessage } from "@/shared/lib";
import {
  CMS_DEFAULT_PAGE_SIZE,
  createCmsTableStateKey,
  useCmsServerTableQuery,
} from "@/shared/lib/table";
import { DialogManager, ErrorState, PageRenderer } from "@/shared/ui/common";

export default function QuickActionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const dialogManager = useDialogManager();
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();
  const isAdmin = useIsAdmin();
  const { data: contentTypes } = useMapping("content_types");

  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [showAddQuickAction, setShowAddQuickAction] = useState(false);
  const [editingQuickActionId, setEditingQuickActionId] = useState<
    number | null
  >(null);

  const contentTypeId = contentTypes?.find(
    (entry: ContentTypeMapping) =>
      entry.model === "quickaction" || entry.model === "quick_action"
  )?.id;

  const tableKey = useMemo(
    () =>
      createCmsTableStateKey({
        pathname,
        orgId: organizationId ? Number(organizationId) : null,
        tabKey: "quick-actions",
      }) ?? "quick-actions_pending",
    [pathname, organizationId]
  );

  const [lastTotalPages, setLastTotalPages] = useState<number | undefined>();

  const {
    query,
    currentPage,
    pageSize,
    searchConfig,
    sortRules,
    setSortRules,
    buildPaginationConfig,
  } = useCmsServerTableQuery({
    tableKey,
    pageSize: CMS_DEFAULT_PAGE_SIZE,
    onQueryChange: () => {},
    totalPages: lastTotalPages,
  });

  const {
    data: quickActions = [],
    isLoading,
    isFetching,
    error,
  } = useQuickActions(
    { search: query.search.trim() || undefined },
    Boolean(organizationId)
  );

  const createMutation = useCreateQuickAction();
  const deleteMutation = useDeleteQuickAction();

  const sortedItems = useMemo(
    () =>
      applyTableSort(quickActions, sortRules, (row, columnKey) => {
        switch (columnKey) {
          case "name":
            return row.name ?? "";
          case "phone_number":
            return row.phone_number ?? "";
          case "email":
            return row.email ?? "";
          default:
            return "";
        }
      }),
    [quickActions, sortRules]
  );

  const totalCount = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    setLastTotalPages(totalPages);
  }, [totalPages]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedItems]);

  const pagination = useMemo(
    () =>
      buildPaginationConfig(
        {
          totalCount,
          totalPages,
          currentPage,
          pageSize,
        },
        { itemLabel: "quick actions", isLoading: isFetching }
      ),
    [
      buildPaginationConfig,
      currentPage,
      isFetching,
      pageSize,
      totalCount,
      totalPages,
    ]
  );

  const handleView = useCallback(
    (quickAction: QuickAction) => {
      router.push(
        orgPath(organizationId, `${APP_ROUTES.quickActions}/${quickAction.id}`)
      );
    },
    [organizationId, router]
  );

  const handleAddSubmit = useCallback(
    async (values: QuickActionFormValues) => {
      const payload: QuickActionCreatePayload = {
        name: values.name.trim() || undefined,
        phone_number: values.phone_number.trim() || undefined,
        email: values.email.trim() || undefined,
        description: values.description.trim() || undefined,
      };

      createMutation.mutate(payload, {
        onSuccess: async (created) => {
          if (
            values.files.length > 0 &&
            organizationId &&
            contentTypeId != null
          ) {
            let failed = 0;
            for (const file of values.files) {
              try {
                await QuickActionsService.uploadFileForQuickAction(
                  organizationId,
                  created.id,
                  contentTypeId,
                  {
                    file,
                    title: `other_file_${file.name}`,
                    description: "—",
                  }
                );
              } catch {
                failed += 1;
              }
            }
            queryClient.invalidateQueries({
              queryKey: [QUICK_ACTIONS_QUERY_KEY, organizationId],
            });
            if (failed > 0) {
              toast.error(
                `Quick action created but ${failed} file(s) failed to upload.`
              );
            }
          }
          setShowAddQuickAction(false);
        },
      });
    },
    [contentTypeId, createMutation, organizationId, queryClient]
  );

  const handleAddClick = useCallback(() => {
    setShowAddQuickAction(true);
  }, []);

  const handleEdit = useCallback((quickAction: QuickAction) => {
    setEditingQuickActionId(quickAction.id);
  }, []);

  const handleDelete = useCallback(
    (quickAction: QuickAction) => {
      dialogManager.openConfirmationDialog({
        title: "Delete Quick Action",
        confirmationType: "delete",
        itemTitle:
          quickAction.name?.trim() || `quick action #${quickAction.id}`,
        variant: "destructive",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        description:
          "This action cannot be undone. The item and all associated files will be permanently removed.",
        onConfirm: async () => {
          deleteMutation.mutate(quickAction.id, {
            onSuccess: () => {
              dialogManager.closeDialog();
            },
          });
        },
      });
    },
    [dialogManager, deleteMutation]
  );

  const handleBulkDelete = useCallback(
    (ids: (string | number)[]) => {
      const numericIds = ids
        .map((id) => (typeof id === "string" ? Number.parseInt(id, 10) : id))
        .filter((id) => !Number.isNaN(id));

      if (numericIds.length === 0) return;

      const count = numericIds.length;
      const { title, description, confirmButtonText } = bulkConfirmationCopy({
        count,
        entitySingular: "quick action",
        entityPlural: "quick actions",
        action: "delete",
        suffix: " This cannot be undone.",
      });

      dialogManager.openConfirmationDialog({
        title,
        description,
        variant: "destructive",
        confirmButtonText,
        onConfirm: async () => {
          try {
            await Promise.all(
              numericIds.map((id) =>
                deleteMutation.mutateAsync({ id, silent: true })
              )
            );
            toast.success(
              bulkDeleteSuccessMessage(count, "quick action", "quick actions")
            );
            dialogManager.closeDialog();
            setSelectedIds([]);
          } catch {
            toast.error("Failed to delete some quick actions.");
            dialogManager.setConfirmationProcessing(false);
          }
        },
      });
    },
    [dialogManager, deleteMutation]
  );

  if (error) {
    return (
      <ErrorState
        action={{
          label: "Back to dashboard",
          onClick: () =>
            router.push(orgPath(organizationId, APP_ROUTES.dashboard)),
        }}
        error={error}
      />
    );
  }

  return (
    <PageRenderer
      renderChildrenWhenEmpty
      data={sortedItems}
      description="Manage and action your quick action items."
      emptyState={{
        title: "No quick actions found",
        description:
          "There are no quick action items yet. Click Add Quick Action to create one.",
      }}
      isLoading={isLoading}
      loadingMessage="Loading quick actions..."
      title="Quick Actions"
    >
      {() => (
        <>
          <QuickActionsTable
            canManage={isAdmin}
            data={paginatedData}
            isLoading={isLoading}
            organizationId={organizationId ?? null}
            pagination={pagination}
            search={searchConfig}
            selectable={isAdmin}
            selectedIds={selectedIds}
            sortRules={sortRules}
            onAdd={handleAddClick}
            onBulkDelete={handleBulkDelete}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onSelectChange={setSelectedIds}
            onSortRulesChange={setSortRules}
            onView={handleView}
          />
          <AddQuickActionModal
            isSubmitting={createMutation.isPending}
            open={showAddQuickAction}
            onOpenChange={setShowAddQuickAction}
            onSubmit={handleAddSubmit}
          />
          <EditQuickActionModal
            open={editingQuickActionId != null}
            quickActionId={editingQuickActionId}
            onOpenChange={(open) => {
              if (!open) {
                setEditingQuickActionId(null);
              }
            }}
          />
          <DialogManager manager={dialogManager} />
        </>
      )}
    </PageRenderer>
  );
}
