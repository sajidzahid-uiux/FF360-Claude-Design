"use client";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  type Column,
  ComponentSizeEnum,
  type TableFilterDefinition,
  type TableFilterValue,
  TableToolbar,
  applyTableFilters,
  applyTableSearch,
} from "@fieldflow360/org-ui";
import { Download } from "lucide-react";

import { useBilling } from "@/hooks";
import { CmsOrgUiTable } from "@/shared/ui";

interface DisplayInvoice {
  id: string;
  number: string;
  status: string;
  billingDate: string;
  createdISO: string;
  amount: number;
  pdfUrl: string;
}

const getPdfUrl = (invoice: Record<string, unknown>) => {
  if (typeof invoice.pdf === "string") return invoice.pdf;

  const pdfKey = Object.keys(invoice).find(
    (key) =>
      typeof invoice[key] === "string" &&
      (invoice[key] as string).includes("/invoice/acct")
  );
  return pdfKey ? (invoice[pdfKey] as string) : "";
};

function InvoiceStatusBadge({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const tone =
    status === "paid"
      ? "bg-[var(--color-feedback-success-soft)] text-[var(--color-feedback-success-text)]"
      : status === "open" || status === "due"
        ? "bg-[var(--color-feedback-error-soft)] text-[var(--color-feedback-error-strong)]"
        : "bg-bg-app text-text-secondary";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}

export default function InvoicesList() {
  const can_view_billing = true;
  const { getSubscriptionInfoWithPermission } = useBilling();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<TableFilterValue[]>([]);
  const [invoices, setInvoices] = useState<DisplayInvoice[]>([]);
  const fetchBillingRef = useRef(false);

  useEffect(() => {
    if (fetchBillingRef.current) return;
    fetchBillingRef.current = true;

    const fetchInvoicesData = async () => {
      try {
        setLoading(true);
        const info = await getSubscriptionInfoWithPermission(can_view_billing);

        if (info?.invoices && Array.isArray(info.invoices)) {
          setInvoices(
            info.invoices.map((invoice, index) => {
              const created = new Date(invoice.created);
              return {
                id: index.toString(),
                number: `Invoice #${index + 1}`,
                status: invoice.status || "paid",
                billingDate: created.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
                createdISO: invoice.created,
                amount: invoice.amount_paid || 0,
                pdfUrl: getPdfUrl(
                  invoice as unknown as Record<string, unknown>
                ),
              };
            })
          );
        } else {
          setInvoices([]);
        }
      } catch {
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchInvoicesData();
  }, [can_view_billing, getSubscriptionInfoWithPermission]);

  const filterDefinitions = useMemo<TableFilterDefinition[]>(() => {
    const years = Array.from(
      new Set(
        invoices.map((inv) =>
          new Date(inv.createdISO).getFullYear().toString()
        )
      )
    ).sort((a, b) => Number(b) - Number(a));

    return [
      {
        id: "status",
        label: "Status",
        options: [
          { value: "paid", label: "Paid" },
          { value: "open", label: "Open" },
          { value: "draft", label: "Draft" },
          { value: "void", label: "Void" },
          { value: "uncollectible", label: "Uncollectible" },
        ],
      },
      {
        id: "year",
        label: "Year",
        options: years.map((year) => ({ value: year, label: year })),
      },
    ];
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    let rows = applyTableSearch(invoices, searchQuery, (row) => row.number);
    rows = applyTableFilters(rows, filterValues, {
      status: (row, values) => values.includes(row.status),
      year: (row, values) =>
        values.includes(new Date(row.createdISO).getFullYear().toString()),
    });
    return rows;
  }, [invoices, searchQuery, filterValues]);

  const columns = useMemo<Column<DisplayInvoice>[]>(
    () => [
      {
        key: "number",
        header: "Invoice",
        sortable: true,
        render: (row) => (
          <span className="text-text-primary font-medium">{row.number}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "140px",
        render: (row) => <InvoiceStatusBadge status={row.status} />,
      },
      {
        key: "billingDate",
        header: "Billing date",
        sortable: true,
        render: (row) => (
          <span className="text-text-secondary text-sm">{row.billingDate}</span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        sortable: true,
        render: (row) => (
          <span className="text-text-primary text-sm font-medium tabular-nums">
            ${row.amount.toLocaleString()}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        align: "right",
        hideable: false,
        width: "1%",
        render: (row) => (
          <div data-no-row-nav className="flex justify-end">
            <Button
              iconOnly
              aria-label="Download invoice"
              disabled={!row.pdfUrl}
              leftIcon={<Download className="h-4 w-4" />}
              size={ComponentSizeEnum.SM}
              variant={ButtonVariantEnum.GHOST}
              onClick={() =>
                row.pdfUrl &&
                window.open(row.pdfUrl, "_blank", "noopener")
              }
            />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <CmsOrgUiTable
      compact
      columns={columns}
      data={filteredInvoices}
      emptyState={{
        title: "No invoices found",
        description: "Invoices will appear here once you have billing history.",
      }}
      isLoading={loading}
      loadingText="Loading invoices…"
      toolbar={
        <TableToolbar
          filterValues={filterValues}
          filters={filterDefinitions}
          search={{
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: "Search invoices...",
          }}
          onFilterValuesChange={setFilterValues}
        />
      }
    />
  );
}
