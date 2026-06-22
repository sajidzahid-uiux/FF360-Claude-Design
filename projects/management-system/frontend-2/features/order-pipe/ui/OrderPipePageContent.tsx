"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  TableFilterDefinition,
  TableGridViewConfig,
  TableKanbanViewConfig,
  TableViewMode,
} from "@fieldflow360/org-ui";
import { TableActions } from "@fieldflow360/org-ui";

import type { VendorFormV2 } from "@/api/types";
import {
  JOB_KANBAN_COLUMN_WIDTH,
  ORDER_PIPE_STATUSES,
  ORDER_PIPE_STATUS_LABELS,
  OrderPipeStatus,
  ViewMode,
} from "@/constants";
import {
  useDialogManager,
  useMapping,
  useRouteIds,
  useViewPreference,
} from "@/hooks";
import { useDeleteVendorForm } from "@/hooks/mutations";
import {
  PERMISSION_RESOURCES,
  usePermissionsFromStorage,
} from "@/hooks/permissions";
import { useVendorFormsV2 } from "@/hooks/queries";
import { orgPath } from "@/shared/config/routes";
import { CMS_DEFAULT_PAGE_SIZE as DEFAULT_PAGE_SIZE } from "@/shared/lib/table";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";
import { mapDropdownItemsToTableActions } from "@/shared/lib/table/org-ui";
import {
  OrgUiDataTable,
  type OrgUiDataTableColumn,
  filterStateToTableValues,
  tableValuesToFilterState,
} from "@/shared/ui";
import { FilterState, FilterType } from "@/shared/ui/common";
import { buildRowActions } from "@/utils/actions";

import type { TransformedVendorForm } from "../model/types";
import { OrderPipeCard } from "./OrderPipeCard";
import { OrderPipePageLayout } from "./OrderPipePageLayout";

export default function OrderPipePage() {
  const { permissionCodes: orderPipesPermissions } = usePermissionsFromStorage(
    PERMISSION_RESOURCES.ORDER_PIPES_LIST
  );
  const canViewPage = orderPipesPermissions.includes("read");
  const canDelete = orderPipesPermissions.includes("delete");
  const { orgId } = useRouteIds();

  const [filters, setFilters] = useState<FilterState>({
    [FilterType.STATUS]: [],
  });
  const router = useRouter();
  const { view: currentView, setView } = useViewPreference(ViewMode.LIST);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination ref for API calls (updated by pagination component callback)
  const currentPageRef = useRef<number>(1);
  const [, forceUpdate] = useState({});

  // List params for backend search + Order Pipe Status filter
  const listParams = useMemo(() => {
    const orderStatuses = (filters[FilterType.STATUS] || []) as string[];
    return {
      ...(searchQuery.trim() && { search: searchQuery.trim() }),
      ...(orderStatuses.length > 0 && {
        order_status:
          orderStatuses.length === 1 ? orderStatuses[0] : orderStatuses,
      }),
    };
  }, [searchQuery, filters]);

  const { vendorForms, isLoading, error } = useVendorFormsV2(listParams);
  const deleteVendorForm = useDeleteVendorForm();
  const dialogManager = useDialogManager();

  const handleDeleteOrder = useCallback(
    (orderId: number | string, orderName?: string) => {
      const displayName = orderName || `Order #${orderId}`;
      dialogManager.openConfirmationDialog({
        title: "Delete Order",
        confirmationType: "delete",
        itemTitle: displayName,
        variant: "destructive",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        description:
          "This action cannot be undone. The order will be permanently removed from the system.",
        onConfirm: async () => {
          try {
            dialogManager.setConfirmationProcessing(true);
            await deleteVendorForm.mutateAsync(orderId);
            dialogManager.closeDialog();
          } catch {
            dialogManager.setConfirmationProcessing(false);
          }
        },
      });
    },
    [dialogManager, deleteVendorForm]
  );

  // Transform vendor forms for views: add job_status alias used by kanban
  const transformedVendorForms: TransformedVendorForm[] = useMemo(
    () =>
      vendorForms.map((form: VendorFormV2) => ({
        ...form,
        job_status: form.vendor_status,
      })),
    [vendorForms]
  );

  const {
    data: vendorMappings,
    isLoading: vendorMappingsIsLoading,
    error: vendorMappingsError,
  } = useMapping("vendor_statuses");

  // Transform vendorMappings if needed
  const vendorStatusMap = Array.isArray(vendorMappings)
    ? Object.fromEntries(vendorMappings)
    : vendorMappings;

  // Order Pipe Status filter options from shared constants
  const statusTypes = useMemo(
    () =>
      ORDER_PIPE_STATUSES.map((id) => ({
        id,
        title: ORDER_PIPE_STATUS_LABELS[id],
      })),
    []
  );

  // Pagination: backend returns filtered list; we paginate that list client-side
  const paginationInfo = useMemo(() => {
    const totalCount = transformedVendorForms.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
    return { totalPages, totalCount };
  }, [transformedVendorForms.length]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPageRef.current - 1) * DEFAULT_PAGE_SIZE;
    const endIndex = startIndex + DEFAULT_PAGE_SIZE;
    return transformedVendorForms.slice(startIndex, endIndex);
  }, [transformedVendorForms]);

  // Reset page when search or filters change
  useEffect(() => {
    currentPageRef.current = 1;
    forceUpdate({});
  }, [searchQuery, filters]);

  // Handle page change from pagination component
  const handlePageChange = useCallback((page: number) => {
    currentPageRef.current = page;
    forceUpdate({});
  }, []);

  const columns = useMemo(
    (): OrgUiDataTableColumn<TransformedVendorForm>[] => [
      {
        key: "job_name",
        label: "Name",
        render: (row) => row.job_name || `Job #${row.job}`,
      },
      {
        key: "number",
        label: "Number",
        render: (row) => {
          const value = row.estimate_number ?? row.po_number ?? null;
          return value || "—";
        },
      },
      {
        key: "order_status",
        label: "Order Status",
        render: (row) => <span>{row.order_status || "—"}</span>,
      },
      {
        key: "actions",
        label: "Actions",
        render: (row) => {
          const rowName = row.job_name || `Job #${row.job}`;
          const items = buildRowActions({
            canView: canViewPage,
            canEdit: false,
            canDelete: canDelete,
            canArchive: false,
            canTrack: false,
            isArchived: false,
            onView: () => router.push(orgPath(orgId, `/order-pipe/${row.id}`)),
            onEdit: () => router.push(orgPath(orgId, `/order-pipe/${row.id}`)),
            onLogs: () =>
              router.push(orgPath(orgId, `/order-pipe/${row.id}/logs`)),
            onDelete: () => handleDeleteOrder(row.id, rowName),
          });
          const actions = mapDropdownItemsToTableActions<TransformedVendorForm>(
            { items }
          );
          return (
            <TableActions
              actions={actions}
              item={row}
              {...INLINE_TABLE_ROW_ACTIONS_PROPS}
            />
          );
        },
        width: "72px",
      },
    ],
    [router, canDelete, canViewPage, handleDeleteOrder, orgId]
  );

  const handleRowDoubleClick = useCallback(
    (row: VendorFormV2) => {
      router.push(orgPath(orgId, `/order-pipe/${row.id}`));
    },
    [router, orgId]
  );

  const handleOrderPipeLogs = useCallback(
    (orderId: number | string) => {
      if (!orderId && orderId !== 0) return;
      router.push(orgPath(orgId, `/order-pipe/${orderId}/logs`));
    },
    [router, orgId]
  );

  const filterDefinitions = useMemo(
    (): TableFilterDefinition[] => [
      {
        id: FilterType.STATUS,
        label: "Order Pipe Status",
        options: statusTypes.map((status) => ({
          value: String(status.id),
          label: String(status.title),
        })),
      },
    ],
    [statusTypes]
  );

  const grid = useMemo(
    (): TableGridViewConfig<TransformedVendorForm> => ({
      minColumnWidth: "minmax(18rem, 1fr)",
      renderCard: (data, context) => (
        <OrderPipeCard
          key={data.id}
          canDelete={canDelete}
          canView={canViewPage}
          order={data}
          selected={context.selected}
          vendorStatusMap={vendorStatusMap}
          onAction={(action) => {
            if (action === "view")
              router.push(orgPath(orgId, `/order-pipe/${data.id}`));
          }}
          onDelete={() =>
            handleDeleteOrder(data.id, data.job_name || `Job #${data.job}`)
          }
          onLogs={() => handleOrderPipeLogs(data.id)}
          onSelect={(checked) => context.onSelectedChange(checked)}
        />
      ),
    }),
    [
      canDelete,
      canViewPage,
      handleDeleteOrder,
      handleOrderPipeLogs,
      orgId,
      router,
      vendorStatusMap,
    ]
  );

  const kanban = useMemo(
    (): TableKanbanViewConfig<TransformedVendorForm> => ({
      columns: ORDER_PIPE_STATUSES.map((status) => ({
        key: status,
        label:
          ORDER_PIPE_STATUS_LABELS[status as OrderPipeStatus] ?? String(status),
        color: "var(--accent)",
      })),
      columnMinWidth: `min(${JOB_KANBAN_COLUMN_WIDTH}, 85vw)`,
      draggable: false,
      getItemStatus: (row) => row.order_status ?? ORDER_PIPE_STATUSES[0],
      renderCard: grid.renderCard,
    }),
    [grid.renderCard]
  );

  const isListView = currentView === ViewMode.LIST;
  const tableData = isListView ? paginatedData : transformedVendorForms;

  return (
    <OrderPipePageLayout
      canViewPage={!!canViewPage}
      data={transformedVendorForms}
      description="Manage your pipe orders, track status, and organize deliveries."
      dialogManager={dialogManager}
      emptyState={{
        title: "No orders found",
        description: "There are no pipe orders available at this time.",
      }}
      error={
        error || vendorMappingsError
          ? new Error(
              (error && error.message) ||
                (vendorMappingsError && vendorMappingsError.message) ||
                "Failed to load orders or statuses."
            )
          : null
      }
      isLoading={isLoading || vendorMappingsIsLoading}
      loadingMessage="Loading orders..."
      table={
        <OrgUiDataTable
          columns={columns}
          data={tableData}
          emptyState={{
            title: "No orders found",
            description: "There are no pipe orders available at this time.",
          }}
          filterDefinitions={filterDefinitions}
          filterValues={filterStateToTableValues(filters)}
          grid={grid}
          isLoading={isLoading}
          kanban={kanban}
          pagination={
            isListView
              ? {
                  currentPage: currentPageRef.current,
                  isLoading,
                  itemLabel: "orders",
                  onPageChange: handlePageChange,
                  pageSize: DEFAULT_PAGE_SIZE,
                  totalCount: paginationInfo.totalCount,
                  totalPages: paginationInfo.totalPages,
                }
              : undefined
          }
          search={{
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: "Search orders...",
          }}
          showKanbanView={true}
          storageKey={`order-pipe-table:${orgId ?? "unknown"}`}
          view={currentView as TableViewMode}
          onFilterValuesChange={(values) =>
            setFilters(tableValuesToFilterState<FilterState>(values))
          }
          onRowDoubleClick={handleRowDoubleClick}
          onViewChange={(view) => setView(view as ViewMode)}
        />
      }
      title="Order Pipe"
    />
  );
}
