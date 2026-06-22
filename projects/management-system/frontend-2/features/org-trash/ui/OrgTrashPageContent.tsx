"use client";

import { useMemo } from "react";

import {
  type TableBulkAction,
  TableDataModeEnum,
  TableToolbar,
} from "@fieldflow360/org-ui";
import { RotateCcw, Trash } from "lucide-react";

import { useOrgTrashPage } from "@/features/org-trash/hooks/useOrgTrashPage";
import { CmsOrgUiTable } from "@/shared/ui";
import { Filter, FilterType, PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

import { OrgTrashDetailCard } from "./OrgTrashDetailCard";

export default function OrgTrashPageContent() {
  const {
    data,
    card,
    closeCard,
    filters,
    selectedIds,
    setSelectedIds,
    trash_write,
    trash_delete,
    leadStatuses,
    canViewTrash,
    canSelectRows,
    tableRows,
    visibleColumns,
    tablePreferences,
    categoryFilterItems,
    assignedToFilterItems,
    getActiveFilterLabel,
    handleFiltersChange,
    trashEmptyDescription,
    hasJobsAccess,
    promptDelete,
    handleRestore,
    handleRestoreAll,
    promptDeleteAll,
  } = useOrgTrashPage();

  const filterConfigs = useMemo(() => {
    const configs = [
      {
        key: FilterType.TRASH_CATEGORIES,
        items: categoryFilterItems,
        labelField: "name" as const,
        idField: "id" as const,
        label: "Category",
        multiSelect: true,
        showSelectAll: true,
        showClear: true,
      },
    ];

    if (hasJobsAccess) {
      configs.push({
        key: FilterType.TRASH_ASSIGNED_TO,
        items: assignedToFilterItems,
        labelField: "name" as const,
        idField: "id" as const,
        label: "Owner",
        multiSelect: false,
        showSelectAll: false,
        showClear: true,
      });
    }

    return configs;
  }, [assignedToFilterItems, categoryFilterItems, hasJobsAccess]);

  const bulkActions = useMemo((): TableBulkAction[] => {
    const actions: TableBulkAction[] = [];

    if (trash_write) {
      actions.push({
        id: "restore-selected",
        label: "Restore Selected",
        icon: <RotateCcw aria-hidden className="h-4 w-4" strokeWidth={2} />,
        onClick: handleRestoreAll,
      });
    }

    if (trash_delete) {
      actions.push({
        id: "delete-selected",
        label: "Delete Selected",
        icon: <Trash aria-hidden className="h-4 w-4" strokeWidth={2} />,
        variant: "danger",
        onClick: promptDeleteAll,
      });
    }

    return actions;
  }, [handleRestoreAll, promptDeleteAll, trash_delete, trash_write]);

  if (card) {
    return (
      <OrgTrashDetailCard
        item={card}
        leadStatuses={leadStatuses || []}
        trashDelete={Boolean(trash_delete)}
        trashWrite={Boolean(trash_write)}
        onClose={closeCard}
        onDelete={promptDelete}
        onRestore={handleRestore}
      />
    );
  }

  return (
    <PageRenderer
      renderChildrenWhenEmpty
      data={data}
      emptyState={{
        title: "No items in trash",
        description: trashEmptyDescription,
      }}
      error={null}
      isLoading={false}
      loadingMessage="Loading trash items..."
      padding="none"
      title=""
    >
      {() => {
        if (!canViewTrash) {
          return <AccessDeniedView />;
        }

        return (
          <div className="w-full min-w-0">
            <Card className="w-full rounded-2xl py-0">
              <CardHeader className="border-border-subtle border-b px-4 py-4 sm:px-6">
                <CardTitle className="text-lg">
                  {getActiveFilterLabel} Deleted Items
                </CardTitle>
                <CardDescription>
                  {data.length} deleted item{data.length !== 1 && "s"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 sm:px-0">
                <CmsOrgUiTable
                  showHeaderWhenEmpty
                  bulkActions={bulkActions}
                  className="w-full"
                  columns={visibleColumns}
                  data={tableRows}
                  dataMode={TableDataModeEnum.CLIENT}
                  emptyState={{
                    title: "No items in trash",
                    description: trashEmptyDescription,
                  }}
                  selectable={canSelectRows}
                  selectedIds={selectedIds}
                  toolbar={
                    <TableToolbar
                      actions={
                        <Filter
                          showClearAll
                          wrapInModal
                          buttonLabel="Filters"
                          configs={filterConfigs}
                          direction="vertical"
                          filterState={filters}
                          modalTitle="Filter trash"
                          modalWidth="320px"
                          page="org-trash"
                          onFilterChange={handleFiltersChange}
                        />
                      }
                      tableSettings={tablePreferences.tableSettings}
                      variant={tablePreferences.variant}
                    />
                  }
                  variant={tablePreferences.variant}
                  onSelectChange={setSelectedIds}
                />
              </CardContent>
            </Card>
          </div>
        );
      }}
    </PageRenderer>
  );
}
