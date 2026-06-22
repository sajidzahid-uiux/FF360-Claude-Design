"use client";
import { useEffect, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  SearchInput,
} from "@fieldflow360/org-ui";
import { Download } from "lucide-react";

import { useBilling } from "@/hooks";
import { Dropdown } from "@/shared/ui/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

interface DisplayInvoice {
  id: string;
  status: string;
  billingDate: string;
  amount: number;
  pdfUrl: string;
}

const getPdfUrl = (invoice: Record<string, unknown>) => {
  if (typeof invoice.pdf === "string") return invoice.pdf;

  if (
    Object.keys(invoice).some(
      (key) =>
        typeof invoice[key] === "string" &&
        (invoice[key] as string).includes("/invoice/acct")
    )
  ) {
    const pdfKey = Object.keys(invoice).find(
      (key) =>
        typeof invoice[key] === "string" &&
        (invoice[key] as string).includes("/invoice/acct")
    );

    if (pdfKey && typeof invoice[pdfKey] === "string") return invoice[pdfKey];
  }

  return "";
};

export default function InvoicesList() {
  const can_view_billing = true;
  const { getSubscriptionInfoWithPermission } = useBilling();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [invoices, setInvoices] = useState<DisplayInvoice[]>([]);
  const fetchBillingRef = useRef(false);

  useEffect(() => {
    if (!fetchBillingRef.current) {
      const fetchInvoicesData = async () => {
        try {
          setLoading(true);
          const info =
            await getSubscriptionInfoWithPermission(can_view_billing);

          if (info?.invoices && Array.isArray(info.invoices)) {
            setInvoices(
              info.invoices.map((invoice, index: number) => {
                const pdfUrl = getPdfUrl(
                  invoice as unknown as Record<string, unknown>
                );

                return {
                  id: index.toString(),
                  status: invoice.status || "paid",
                  billingDate: new Date(invoice.created).toLocaleString(),
                  amount: invoice.amount_paid || 0,
                  pdfUrl: pdfUrl,
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
      fetchBillingRef.current = true;
    }
  }, [can_view_billing, getSubscriptionInfoWithPermission]);

  const filteredInvoices = invoices.filter((invoice) => {
    if (
      searchQuery &&
      !`Invoice #${invoice.id}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (statusFilter !== "all" && invoice.status !== statusFilter) {
      return false;
    }

    const invoiceYear = new Date(invoice.billingDate).getFullYear().toString();
    if (yearFilter !== "all" && invoiceYear !== yearFilter) {
      return false;
    }

    return true;
  });

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Invoices</CardTitle>
        <CardDescription>
          View and download your billing history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            className="w-full min-w-0 lg:max-w-xs"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onClear={() => setSearchQuery("")}
          />
          <div className="flex flex-wrap gap-2">
            <Dropdown
              items={[
                { id: "all", label: "All statuses" },
                { id: "paid", label: "Paid" },
                { id: "open", label: "Open" },
                { id: "draft", label: "Draft" },
                { id: "void", label: "Void" },
                { id: "uncollectible", label: "Uncollectible" },
              ]}
              mode="select"
              placeholder="Status"
              selectedValue={statusFilter}
              onValueChange={setStatusFilter}
            />
            <Dropdown
              items={[
                { id: "all", label: "All years" },
                { id: "2035", label: "2035" },
                { id: "2034", label: "2034" },
                { id: "2033", label: "2033" },
                { id: "2032", label: "2032" },
                { id: "2031", label: "2031" },
                { id: "2030", label: "2030" },
                { id: "2029", label: "2029" },
                { id: "2028", label: "2028" },
                { id: "2027", label: "2027" },
                { id: "2026", label: "2026" },
                { id: "2025", label: "2025" },
                { id: "2024", label: "2024" },
              ]}
              mode="select"
              placeholder="Year"
              selectedValue={yearFilter}
              onValueChange={setYearFilter}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-text-muted py-8 text-center text-sm">
            Loading invoices...
          </p>
        ) : (
          <div className="border-border-subtle -mx-1 overflow-x-auto rounded-xl border sm:mx-0">
            <table className="w-full min-w-[36rem] border-collapse">
              <thead>
                <tr className="border-border-subtle border-b text-left text-sm">
                  <th className="text-text-muted px-4 py-3 font-medium">
                    Invoice
                  </th>
                  <th className="text-text-muted px-4 py-3 font-medium">
                    Status
                  </th>
                  <th className="text-text-muted px-4 py-3 font-medium">
                    Billing date
                  </th>
                  <th className="text-text-muted px-4 py-3 font-medium">
                    Amount
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice, index) => (
                    <tr
                      key={index}
                      className="border-border-subtle hover:bg-bg-hover/30 border-b last:border-b-0"
                    >
                      <td className="text-text-primary px-4 py-3">
                        Invoice #{Number(index) + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            invoice.status === "paid"
                              ? "bg-[var(--color-feedback-success-soft)] text-[var(--color-feedback-success-strong)]"
                              : invoice.status === "due"
                                ? "bg-[var(--color-feedback-error-soft)] text-[var(--color-feedback-error-strong)]"
                                : "bg-bg-app text-text-secondary"
                          }`}
                        >
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="text-text-primary px-4 py-3 text-sm">
                        {invoice.billingDate}
                      </td>
                      <td className="text-text-primary px-4 py-3 text-sm font-medium">
                        ${invoice.amount}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {invoice.pdfUrl ? (
                          <Button
                            iconOnly
                            aria-label="Download invoice"
                            leftIcon={<Download className="h-4 w-4" />}
                            size={ComponentSizeEnum.SM}
                            variant={ButtonVariantEnum.GHOST}
                            onClick={() =>
                              window.open(invoice.pdfUrl, "_blank", "noopener")
                            }
                          />
                        ) : (
                          <Button
                            disabled
                            iconOnly
                            aria-label="Download invoice"
                            leftIcon={<Download className="h-4 w-4" />}
                            size={ComponentSizeEnum.SM}
                            variant={ButtonVariantEnum.GHOST}
                          />
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="text-text-muted px-4 py-8 text-center text-sm"
                      colSpan={5}
                    >
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
