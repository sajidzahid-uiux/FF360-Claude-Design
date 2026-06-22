"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  TableBulkAction,
  TableFilterDefinition,
  TableGridViewConfig,
  TableKanbanViewConfig,
  TableViewMode,
} from "@fieldflow360/org-ui";
import { TableActions } from "@fieldflow360/org-ui";
import { Trash } from "lucide-react";
import { toast } from "sonner";

import type { InvoiceListRow } from "@/api/types";
import { JOB_KANBAN_COLUMN_WIDTH, ViewMode } from "@/constants";
import { useDialogManager, useInvoicesData, useViewPreference } from "@/hooks";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { bulkConfirmationCopy, bulkDeleteSuccessMessage } from "@/shared/lib";
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

import { BookKeepingPageLayout } from "./BookKeepingPageLayout";
import { InvoiceCard } from "./InvoiceCard";
import InvoiceShowMoreCard, {
  type InvoiceShowMoreCardData,
} from "./InvoiceShowMoreCard";

export default function BookKeepingPage() {
  const roleName = useDataFromStorageByKey(StorageKey.USER_ROLE)?.name;
  const hasAccess = roleName === "Admin" || roleName === "Bookkeeper";

  const {
    data: invoices = [],
    deleteInvoice,
    isLoading,
    error,
  } = useInvoicesData();
  const dialogManager = useDialogManager();
  const [showDetails, setShowDetails] = useState<InvoiceListRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const { view: currentView, setView } = useViewPreference(ViewMode.LIST);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<FilterState>({
    [FilterType.STATUS]: [],
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  // Pagination ref for API calls (updated by pagination component callback)
  const currentPageRef = useRef<number>(1);
  const [, forceUpdate] = useState({});
  const invoiceFromParam = id
    ? invoices.find((inv) => String(inv.id) === String(id))
    : null;

  // Define invoice status types based on boolean fields
  const invoiceStatusTypes = useMemo(
    () => [
      {
        id: "to_be_checked",
        title: "To Check",
        color: "var(--accent)", // accent color
      },
      {
        id: "to_be_sent",
        title: "To Send",
        color: "var(--accent)", // accent color
      },
      {
        id: "to_pay",
        title: "To Pay",
        color: "var(--accent)", // accent color
      },
      {
        id: "paid",
        title: "Paid",
        color: "var(--accent)", // accent color
      },
    ],
    []
  );

  // Function to determine invoice status based on boolean fields
  const getInvoiceStatus = (invoice: {
    checked_by_admin?: boolean;
    sent_to_client?: boolean;
    paid?: boolean;
  }) => {
    const { checked_by_admin, sent_to_client, paid } = invoice;

    if (paid && sent_to_client && checked_by_admin) {
      return "paid";
    } else if (sent_to_client && checked_by_admin) {
      return "to_pay";
    } else if (checked_by_admin) {
      return "to_be_sent";
    } else {
      return "to_be_checked";
    }
  };

  // Add invoice_status to each invoice for Kanban grouping and apply filters
  const invoicesWithStatus = useMemo(() => {
    const withStatus = invoices.map((invoice) => ({
      ...invoice,
      invoice_status: getInvoiceStatus(invoice),
    })) as InvoiceListRow[];

    let result = withStatus;
    const statusFilters = (filters[FilterType.STATUS] || []) as string[];

    // Apply status filtering
    if (Array.isArray(statusFilters) && statusFilters.length > 0) {
      result = result.filter((invoice) => {
        const statusValue = getInvoiceStatus(invoice);
        const statusObj = invoiceStatusTypes.find((s) => s.id === statusValue);
        const statusTitle = statusObj ? statusObj.title : statusValue;
        return statusFilters.includes(statusTitle);
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((invoice) => {
        const title = invoice.title || "";
        const invoiceNumber = invoice.invoice_number || "";
        const contactName = invoice.contact_info?.full_name || "";
        return (
          title.toLowerCase().includes(query) ||
          invoiceNumber.toLowerCase().includes(query) ||
          contactName.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [invoices, filters, searchQuery, invoiceStatusTypes]);

  // Pagination info
  const paginationInfo = useMemo(() => {
    const totalCount = invoicesWithStatus.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));

    return {
      totalPages,
      totalCount,
    };
  }, [invoicesWithStatus.length]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPageRef.current - 1) * DEFAULT_PAGE_SIZE;
    const endIndex = startIndex + DEFAULT_PAGE_SIZE;
    return invoicesWithStatus.slice(startIndex, endIndex);
  }, [invoicesWithStatus]);

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

  const clearSelections = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Handle row double click
  const handleRowDoubleClick = useCallback(
    (row: { id: string | number }) => {
      router.replace(`?id=${row.id}`);
    },
    [router]
  );

  const handleSingleDelete = useCallback(
    (invoice: {
      id: string | number;
      title?: string;
      invoice_number?: string;
    }) => {
      const invoiceName =
        invoice?.title || invoice?.invoice_number || `Invoice #${invoice.id}`;
      dialogManager.openConfirmationDialog({
        title: "Delete Invoice",
        confirmationType: "delete",
        itemTitle: invoiceName,
        variant: "destructive",
        confirmButtonText: "Delete",
        onConfirm: async () => {
          try {
            await deleteInvoice.mutateAsync(invoice.id as string);
            toast.success("Invoice deleted successfully");
            dialogManager.closeDialog();
          } catch (error: unknown) {
            let errorMsg = "Failed to delete invoice";
            const err = error as {
              response?: { data?: string | string[] | Record<string, unknown> };
            };
            if (err?.response?.data) {
              if (Array.isArray(err.response.data)) {
                errorMsg = err.response.data.join(" | ");
              } else if (typeof err.response.data === "string") {
                errorMsg = err.response.data;
              } else if (typeof err.response.data === "object") {
                errorMsg = Object.values(err.response.data).flat().join(" | ");
              }
            }
            toast.error(errorMsg);
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [dialogManager, deleteInvoice]
  );

  const columns = useMemo(
    (): OrgUiDataTableColumn<InvoiceListRow>[] => [
      {
        key: "invoice_status",
        label: "Status",
        render: (row) => {
          const statusValue = row.invoice_status;
          const statusObj = invoiceStatusTypes.find(
            (s) => s.id === statusValue
          );
          return statusObj ? statusObj.title : statusValue;
        },
      },
      {
        key: "title",
        label: "Invoice Name",
        render: (row) => {
          const contactName = row.contact_info?.full_name ?? "N/A";
          const farmName = row.farm_name;
          return farmName
            ? `Invoices for ${contactName} — ${farmName}`
            : `Invoices for ${contactName}`;
        },
      },
      {
        key: "invoice_number",
        label: "Invoice Number",
        render: (row) => row.invoice_number,
      },
      {
        key: "amount",
        label: "Amount",
        render: (row) => {
          const amount = (row.invoice_items ?? []).reduce(
            (acc: number, item: { unit_price?: number; quantity?: number }) =>
              acc + Number(item.unit_price) * Number(item.quantity),
            0
          );
          return `$${amount.toFixed(2) ?? "0.00"}`;
        },
      },
      {
        key: "checked_by_admin",
        label: "Checked by Admin",
        render: (row) => (
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              row.checked_by_admin
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {row.checked_by_admin ? "Yes" : "No"}
          </span>
        ),
      },
      {
        key: "sent_to_client",
        label: "Sent to Client",
        render: (row) => (
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              row.sent_to_client
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {row.sent_to_client ? "Yes" : "No"}
          </span>
        ),
      },
      {
        key: "paid",
        label: "Paid",
        render: (row) => (
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              row.paid
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {row.paid ? "Yes" : "No"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (row) => {
          const items = buildRowActions({
            canView: true,
            canEdit: false,
            canDelete: true,
            canArchive: false,
            canTrack: false,
            isArchived: false,
            onView: () => router.replace(`?id=${row.id}`),
            onTrash: () => handleSingleDelete(row),
          });
          const actions = mapDropdownItemsToTableActions<InvoiceListRow>({
            items,
          });
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
    [invoiceStatusTypes, router, handleSingleDelete]
  );

  const handleBulkDelete = useCallback(
    (ids: (string | number)[] = selectedIds) => {
      const invoicesToDelete = invoicesWithStatus.filter((inv) =>
        ids.includes(inv.id)
      );

      if (invoicesToDelete.length === 0) return;

      const count = invoicesToDelete.length;
      const { title, description, confirmButtonText } = bulkConfirmationCopy({
        count,
        entitySingular: "invoice",
        entityPlural: "invoices",
        action: "delete",
      });

      dialogManager.openConfirmationDialog({
        title,
        description,
        variant: "destructive",
        confirmButtonText,
        onConfirm: async () => {
          try {
            dialogManager.setConfirmationProcessing(true);
            const totalInvoices = invoicesToDelete.length;

            for (let i = 0; i < invoicesToDelete.length; i++) {
              const invoice = invoicesToDelete[i];

              const invoiceName =
                invoice?.title ||
                invoice?.invoice_number ||
                `Invoice #${invoice.id}`;
              dialogManager.setConfirmationProgress(
                Math.round((i / totalInvoices) * 100),
                invoiceName
              );

              await deleteInvoice.mutateAsync(String(invoice.id));

              dialogManager.setConfirmationProgress(
                Math.round(((i + 1) / totalInvoices) * 100),
                invoiceName
              );
            }

            dialogManager.setConfirmationProgress(100);
            toast.success(
              bulkDeleteSuccessMessage(count, "invoice", "invoices", {
                pastTense: "deleted successfully",
              })
            );

            clearSelections();
            dialogManager.closeDialog();
          } catch (error: unknown) {
            let errorMsg = "Failed to delete one or more invoices";
            const err = error as {
              response?: { data?: string | string[] | Record<string, unknown> };
            };
            if (err?.response?.data) {
              if (Array.isArray(err.response.data)) {
                errorMsg = err.response.data.join(" | ");
              } else if (typeof err.response.data === "string") {
                errorMsg = err.response.data;
              } else if (typeof err.response.data === "object") {
                errorMsg = Object.values(err.response.data).flat().join(" | ");
              }
            }
            toast.error(errorMsg);
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [
      clearSelections,
      deleteInvoice,
      dialogManager,
      invoicesWithStatus,
      selectedIds,
    ]
  );

  const filterDefinitions = useMemo(
    (): TableFilterDefinition[] => [
      {
        id: FilterType.STATUS,
        label: "Status",
        options: [
          { value: "To Check", label: "To Check" },
          { value: "To Send", label: "To Send" },
          { value: "To Pay", label: "To Pay" },
          { value: "Paid", label: "Paid" },
        ],
      },
    ],
    []
  );

  const bulkActions = useMemo(
    (): TableBulkAction[] => [
      {
        id: "delete-selected",
        label: "Delete Selected",
        icon: <Trash aria-hidden className="h-4 w-4" />,
        variant: "danger",
        onClick: (ids) => {
          setSelectedIds(ids);
          handleBulkDelete(ids);
        },
      },
    ],
    [handleBulkDelete]
  );

  const renderInvoiceCard = useCallback(
    (
      invoice: InvoiceListRow,
      context: {
        selected: boolean;
        onSelectedChange: (selected: boolean) => void;
      },
      compact: boolean
    ) => (
      <InvoiceCard
        compact={compact}
        invoice={invoice}
        selected={context.selected}
        onDelete={() => handleSingleDelete(invoice)}
        onDeselect={() => context.onSelectedChange(false)}
        onSelect={() => context.onSelectedChange(true)}
        onView={() => router.replace(`?id=${invoice.id}`)}
      />
    ),
    [handleSingleDelete, router]
  );

  const grid = useMemo(
    (): TableGridViewConfig<InvoiceListRow> => ({
      minColumnWidth: "minmax(18rem, 1fr)",
      renderCard: (invoice, context) =>
        renderInvoiceCard(invoice, context, false),
    }),
    [renderInvoiceCard]
  );

  const kanban = useMemo(
    (): TableKanbanViewConfig<InvoiceListRow> => ({
      columns: invoiceStatusTypes.map((status) => ({
        key: status.id,
        label: status.title,
        color: status.color,
      })),
      columnMinWidth: `min(${JOB_KANBAN_COLUMN_WIDTH}, 85vw)`,
      draggable: false,
      getItemStatus: (row) => row.invoice_status ?? "to_be_checked",
      renderCard: (invoice, context) =>
        renderInvoiceCard(invoice, context, true),
    }),
    [invoiceStatusTypes, renderInvoiceCard]
  );

  const isListView = currentView === ViewMode.LIST;
  const tableData = isListView ? paginatedData : invoicesWithStatus;

  if (showDetails || invoiceFromParam) {
    return (
      <InvoiceShowMoreCard
        invoice={(showDetails || invoiceFromParam) as InvoiceShowMoreCardData}
        onClose={() => {
          setShowDetails(null);
          const params = new URLSearchParams(window.location.search);
          params.delete("id");
          router.replace(
            window.location.pathname +
              (params.toString() ? `?${params.toString()}` : "")
          );
        }}
      />
    );
  }

  return (
    <BookKeepingPageLayout
      data={invoicesWithStatus}
      description="Manage your invoices and track payment status"
      dialogManager={dialogManager}
      emptyState={{
        title: "No invoices found",
        description: "Try adjusting your search or filters to find invoices.",
      }}
      error={
        error ? new Error(error.message || "Failed to load invoices") : null
      }
      hasAccess={hasAccess}
      isLoading={isLoading || false}
      loadingMessage="Loading invoices..."
      table={
        <OrgUiDataTable
          bulkActions={bulkActions}
          columns={columns}
          data={tableData}
          emptyState={{
            title: "No invoices found",
            description:
              "Try adjusting your search or filters to find invoices.",
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
                  itemLabel: "invoices",
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
            placeholder: "Search invoices...",
          }}
          selectable={true}
          selectedIds={selectedIds}
          showKanbanView={true}
          storageKey="book-keeping-table"
          view={currentView as TableViewMode}
          onFilterValuesChange={(values) =>
            setFilters(tableValuesToFilterState<FilterState>(values))
          }
          onRowDoubleClick={handleRowDoubleClick}
          onSelectChange={setSelectedIds}
          onViewChange={(view) => {
            setView(view as ViewMode);
            clearSelections();
          }}
        />
      }
      title="Book Keeping"
    />
  );
}

BookKeepingPage.displayName = "BookKeepingPage";
