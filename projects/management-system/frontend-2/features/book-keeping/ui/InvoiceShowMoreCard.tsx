import { useMemo, useState } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type {
  InvoiceDetailRow,
  OrganizationInvoiceLineItem,
} from "@/api/types";
import {
  useDialogManager,
  useInvoicesData,
  useOrganizationById,
  useRouteIds,
} from "@/hooks";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { DialogManager, Dropdown, TouchSlideText } from "@/shared/ui/common";
import {
  Card,
  SanitizedInput,
  SanitizedTextarea,
} from "@/shared/ui/primitives";
import { buildRowActions } from "@/utils/actions";
import { getErrorMessage } from "@/utils/apiError";

import { InvoicePDF } from "./InvoicePDF";

export type InvoiceShowMoreCardData = InvoiceDetailRow;

// Helper function to truncate and handle scrolling text for invoice title
const InvoiceTitle = ({ title }: { title?: string }) => {
  if (!title)
    return <span className="text-3xl font-semibold">Invoice Title</span>;

  const isLongTitle = title.length > 50;

  if (!isLongTitle) {
    return <span className="text-3xl font-semibold">{title}</span>;
  }

  return (
    <div className="max-w-full overflow-hidden whitespace-nowrap">
      <TouchSlideText
        className="text-3xl font-semibold"
        maxWidth="max-w-full"
        text={title}
      />
    </div>
  );
};

export default function InvoiceShowMoreCard({
  invoice: initialInvoice,
  onClose,
}: {
  invoice: InvoiceShowMoreCardData;
  onClose: () => void;
}) {
  const validateField = (field: string, value: string, maxValue: number) => {
    const input = document.getElementById(field) as HTMLInputElement;
    if (input) {
      if (value !== "" && (isNaN(Number(value)) || Number(value) > maxValue)) {
        input.setCustomValidity(
          `Maximum value allowed is ${maxValue.toLocaleString()}`
        );
        input.reportValidity(); // Show popup immediately like FilterCard
        return false;
      } else {
        input.setCustomValidity("");
        return true;
      }
    }
    return true;
  };
  const { patchInvoice, deleteInvoice } = useInvoicesData();
  const [invoice, setInvoice] = useState(initialInvoice);
  const [item, setItem] = useState({
    activity: "",
    description: "",
    unit_price: 1,
    quantity: 1,
  });
  const [adding, setAdding] = useState(false);
  const [billTo, setBillTo] = useState({
    client_name: invoice.client_name || "",
    client_address: invoice.client_address || "",
    client_contact: invoice.client_contact || "",
    description: invoice.description || "",
    due_date: invoice.due_date || "",
  });
  const [billToLoading, setBillToLoading] = useState(false);
  const [showPdfDownload, setShowPdfDownload] = useState(true);
  const { orgId } = useRouteIds();

  const {
    isLoading: orgLoading,
    error: orgError,
    refetch: refetchOrganization,
  } = useOrganizationById(orgId);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const dialogManager = useDialogManager();
  const can_check_invoice =
    useDataFromStorageByKey(StorageKey.USER_ROLE).is_admin ?? false;

  // Add Invoice Item
  const handleAddItem = async () => {
    // Validation before submit
    if (item.activity.length > 100) {
      toast.error("Activity cannot exceed 100 characters.");
      return;
    }
    if (item.activity.length <= 0) {
      toast.error("Activity cannot be empty.");
      return;
    }

    if (item.description.length > 300) {
      toast.error("Description cannot exceed 300 characters.");
      return;
    }

    // Validate unit price and quantity with browser popups
    const unitPriceValid = validateField(
      "unitPrice",
      item.unit_price.toString(),
      1000000
    );
    const quantityValid = validateField(
      "quantity",
      item.quantity.toString(),
      1000000
    );

    if (!unitPriceValid || !quantityValid) {
      return;
    }

    if (item.unit_price <= 0) {
      toast.error("Unit price cannot be 0.");
      return;
    }

    if (item.quantity <= 0) {
      toast.error("Quantity cannot be 0.");
      return;
    }
    setAdding(true);
    // Hide PDF before updating to prevent crashes
    setShowPdfDownload(false);

    const updatedItems = [...(invoice.invoice_items || []), item];
    try {
      const updatedInvoice = await patchInvoice.mutateAsync({
        id: invoice.id.toString(),
        updatedInvoice: { invoice_items: updatedItems },
      });
      setInvoice(updatedInvoice);
      toast.success("Invoice item added successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to add invoice item"));
    } finally {
      setAdding(false);
      setItem({ activity: "", description: "", unit_price: 1, quantity: 1 });

      // Show PDF again after a brief delay
      setTimeout(() => {
        setShowPdfDownload(true);
      }, 100);
    }
  };

  // Update Bill To
  const handleUpdateBillTo = async () => {
    setBillToLoading(true);
    // Remove due_date if empty/null/''
    const billToPayload = { ...billTo };
    if (!billToPayload.due_date) {
      delete (billToPayload as Record<string, unknown>)?.due_date;
    }
    const updatedInvoice = { ...invoice, ...billToPayload };
    try {
      await patchInvoice.mutateAsync({
        id: invoice.id.toString(),
        updatedInvoice: billToPayload,
      });
      setInvoice(updatedInvoice);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update bill to info"));
    } finally {
      setBillToLoading(false);
    }
  };

  // Toggle status fields
  const handleToggleStatus = async (
    field: "checked_by_admin" | "sent_to_client" | "paid"
  ) => {
    const updatedInvoice = { ...invoice, [field]: !invoice[field] };
    try {
      await patchInvoice.mutateAsync({
        id: invoice.id.toString(),
        updatedInvoice: { [field]: !invoice[field] },
      });
      setInvoice(updatedInvoice);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update status"));
    }
  };

  // Delete Invoice Item with PDF crash prevention
  const handleDeleteItem = (idx: number) => {
    const item = invoice.invoice_items?.[idx];
    const itemTitle = item?.activity || `Item ${idx + 1}`;

    dialogManager.openConfirmationDialog({
      title: "Delete Invoice Item",
      description: `Are you sure you want to delete "${itemTitle}"?`,
      variant: "destructive",
      confirmButtonText: "Delete",
      onConfirm: async () => {
        setDeletingItemId(idx);
        try {
          // Hide PDF before updating to prevent crashes
          setShowPdfDownload(false);

          const updatedItems = [...(invoice.invoice_items || [])];
          updatedItems.splice(idx, 1);
          await patchInvoice.mutateAsync({
            id: invoice.id.toString(),
            updatedInvoice: { invoice_items: updatedItems },
          });
          setInvoice({ ...invoice, invoice_items: updatedItems });

          // Show PDF again after a brief delay
          setTimeout(() => {
            setShowPdfDownload(true);
          }, 100);
          dialogManager.closeDialog();
        } catch (error) {
          console.error("Error deleting item:", error);
          toast.error("Failed to delete invoice item");
          dialogManager.setConfirmationProcessing(false);
        } finally {
          setDeletingItemId(null);
        }
      },
    });
  };

  const toBase64 = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  // Custom PDF download handler that refetches organization data
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      // Refetch organization data to get fresh logo URL with retry logic
      let freshOrgData;
      let retryCount = 0;
      const maxRetries = 6;

      while (retryCount < maxRetries) {
        try {
          const result = await refetchOrganization();
          freshOrgData = result.data;

          // If we got the data and it has a logo, break
          if (freshOrgData && freshOrgData.logo) {
            break;
          }

          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        } catch (error) {
          console.error(error);
          retryCount++;
          if (retryCount >= maxRetries) {
            console.warn(
              "Failed to fetch organization data after retries, proceeding without logo"
            );
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Create PDF document with fresh organization data
      const validItems = (invoice.invoice_items || [])
        .filter(Boolean)
        .map((item) => ({
          activity: item.activity,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.unit_price * item.quantity,
        }));
      const logoUrl = freshOrgData?.logo
        ? await toBase64(freshOrgData.logo)
        : null;
      const dynamicPdfDoc = (
        <InvoicePDF
          companyInfo={{
            name: freshOrgData?.name || "Your Company Name",
            email: freshOrgData?.email || "info@company.com",
            address: freshOrgData?.address || "",
            phone: freshOrgData?.phone_number || "",
            logo: logoUrl || "",
          }}
          invoiceInfo={{
            invoice_number: invoice.invoice_number || "000",
            date: invoice.created_at || new Date().toISOString(),
            due_date: invoice.due_date || "",
            customer_name: invoice.client_name || "",
            customer_address: invoice.client_address || "",
            customer_email: invoice.client_contact || "",
            description: invoice.description || "",
          }}
          invoiceItems={validItems}
        />
      );

      const blob = await pdf(dynamicPdfDoc).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoice.invoice_number || "draft"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };
  const items = useMemo(
    () =>
      buildRowActions({
        canView: false,
        canEdit: false,
        canDelete: true,
        canArchive: false,
        canTrack: false,
        isArchived: false,
        onView: () => {},
        onDelete: () => {
          const itemTitle =
            invoice?.contact_info?.full_name ||
            invoice.invoice_number ||
            "Invoice";
          dialogManager.openConfirmationDialog({
            title: "Delete Invoice",
            confirmationType: "delete",
            itemTitle: itemTitle,
            variant: "destructive",
            confirmButtonText: "Delete",
            onConfirm: async () => {
              try {
                await deleteInvoice.mutateAsync(invoice.id.toString());
                toast.success("Invoice deleted successfully");
                onClose();
                dialogManager.closeDialog();
              } catch (error: unknown) {
                toast.error(getErrorMessage(error, "Failed to delete invoice"));
                dialogManager.setConfirmationProcessing(false);
                throw error;
              }
            },
          });
        },
      }),
    [
      deleteInvoice,
      dialogManager,
      invoice?.contact_info?.full_name,
      invoice?.id,
      invoice?.invoice_number,
      onClose,
    ]
  );

  if (orgLoading) return <div>Loading organization info...</div>;
  if (orgError) return <div>Error loading organization info</div>;

  const invoiceTotal = (invoice.invoice_items || []).reduce(
    (acc: number, item: OrganizationInvoiceLineItem) =>
      acc + item.unit_price * item.quantity,
    0
  );

  return (
    <div className="bg-bg-app min-h-screen w-full p-4 sm:p-8">
      {/* Top Bar */}
      <div className="mb-4 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button
            iconOnly
            aria-label="Close"
            leftIcon={<ArrowLeft className="h-5 w-5" />}
            variant={ButtonVariantEnum.GHOST}
            onClick={onClose}
          />
          <span className="text-2xl font-bold md:text-3xl">
            Invoice Details
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-label="Checked by Admin"
            disabled={invoice?.paid || !can_check_invoice}
            title="Checked by Admin"
            variant={
              invoice.checked_by_admin
                ? ButtonVariantEnum.DEFAULT
                : ButtonVariantEnum.SURFACE
            }
            onClick={() => handleToggleStatus("checked_by_admin")}
          />
          <Button
            aria-label="Sent to Client"
            disabled={invoice?.paid || false}
            title="Sent to Client"
            variant={
              invoice.sent_to_client
                ? ButtonVariantEnum.DEFAULT
                : ButtonVariantEnum.SURFACE
            }
            onClick={() => handleToggleStatus("sent_to_client")}
          />
          <Button
            aria-label="Paid"
            disabled={invoice?.paid || false}
            title="Paid"
            variant={
              invoice?.paid
                ? ButtonVariantEnum.DEFAULT
                : ButtonVariantEnum.SURFACE
            }
            onClick={() => handleToggleStatus("paid")}
          />

          {/* PDF Download Button - only show if there are invoice items and showPdfDownload is true */}
          {invoice.invoice_items &&
            invoice.invoice_items.length > 0 &&
            showPdfDownload && (
              <Button
                aria-label="Download Invoice PDF"
                className="ml-2 flex items-center"
                disabled={downloadingPdf}
                leftIcon={<Download className="h-4 w-4" />}
                loading={downloadingPdf}
                title="Download Invoice PDF"
                variant={ButtonVariantEnum.SURFACE}
                onClick={handleDownloadPdf}
              />
            )}

          <Dropdown items={items} />
        </div>
      </div>
      {/* Main Content */}
      <div className="mb-4 flex w-full flex-col gap-4 md:mb-[20px] md:h-[500px] md:flex-row md:gap-8">
        {/* Left: Invoice Details & Items */}
        <Card className="bg-bg-surface-elevated dark:bg-bg-surface-elevated/80 text-text-primary border-border-subtle border-border-subtle/50 text-text-primary mb-0 flex h-full w-full flex-col justify-between rounded-xl border p-4 md:w-[50%] md:p-6">
          <div>
            <div className="mb-2">
              <div className="mb-4">
                <InvoiceTitle title={invoice?.contact_info?.full_name} />
              </div>
              <div className="text-text-muted mb-1 text-sm">
                Invoice Number: <b>{invoice.invoice_number}</b>
              </div>
              <div className="text-text-muted mb-1 text-sm">
                Created on:{" "}
                <b>
                  {invoice.created_at
                    ? format(new Date(invoice.created_at), "PPP p")
                    : "-"}{" "}
                  by {invoice.created_by || "N/A"}
                </b>
              </div>
            </div>
            <div className="mt-4 mb-2 text-xl font-bold">Bill to</div>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-1 font-semibold">Client Name/Company</div>
                <SanitizedInput
                  disabled={invoice?.paid}
                  unstyled={false}
                  value={billTo.client_name}
                  onChange={(e) =>
                    setBillTo({ ...billTo, client_name: e.target.value })
                  }
                />
                <div className="mb-1 font-semibold">Client Address</div>
                <SanitizedInput
                  disabled={invoice?.paid}
                  unstyled={false}
                  value={billTo.client_address}
                  onChange={(e) =>
                    setBillTo({ ...billTo, client_address: e.target.value })
                  }
                />
                <div className="mb-1 font-semibold">Client Contact</div>
                <SanitizedInput
                  disabled={invoice?.paid}
                  unstyled={false}
                  value={billTo.client_contact}
                  onChange={(e) =>
                    setBillTo({ ...billTo, client_contact: e.target.value })
                  }
                />
              </div>
              <div>
                <div className="mb-1 font-semibold">Description</div>
                <SanitizedTextarea
                  disabled={invoice?.paid}
                  rows={5}
                  unstyled={false}
                  value={billTo.description}
                  onChange={(e) =>
                    setBillTo({ ...billTo, description: e.target.value })
                  }
                />
                <div className="mb-1 font-semibold">Due Date</div>
                <SanitizedInput
                  disabled={invoice?.paid}
                  type="date"
                  unstyled={false}
                  value={billTo.due_date}
                  onChange={(e) =>
                    setBillTo({ ...billTo, due_date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <Button
            aria-label="Update Bill To"
            className="mt-2"
            disabled={billToLoading || invoice?.paid}
            loading={billToLoading}
            title="Update Bill To"
            onClick={handleUpdateBillTo}
          />
        </Card>
        {/* Right: Create Invoice Item */}
        <Card className="bg-bg-surface dark:bg-bg-surface/50 text-text-primary border-border-subtle border-border-subtle/50 text-text-primary flex h-full w-full flex-col justify-between rounded-xl border p-4 md:w-[50%] md:p-6">
          <div>
            <h3 className="mb-8 text-3xl font-semibold">Create Invoice Item</h3>
            <div className="mb-4">
              <div className="mb-4 text-lg font-semibold">Activity</div>
              <SanitizedInput
                disabled={invoice?.paid}
                placeholder="Enter Activity"
                unstyled={false}
                value={item.activity}
                onChange={(e) => setItem({ ...item, activity: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <div className="mb-4 text-lg font-semibold">Description</div>
              <SanitizedInput
                disabled={invoice?.paid}
                placeholder="Enter Description"
                unstyled={false}
                value={item.description}
                onChange={(e) =>
                  setItem({ ...item, description: e.target.value })
                }
              />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div>
                <div className="mb-4 text-lg font-semibold">Unit Price</div>
                <SanitizedInput
                  disabled={invoice?.paid}
                  id="unitPrice"
                  min={0}
                  type="number"
                  unstyled={false}
                  value={item.unit_price}
                  onBlur={(e) =>
                    validateField("unitPrice", e.target.value, 1000000)
                  }
                  onChange={(e) => {
                    setItem({ ...item, unit_price: Number(e.target.value) });
                    // Clear any previous validation message when user starts typing
                    const input = document.getElementById(
                      "unitPrice"
                    ) as HTMLInputElement;
                    if (input) input.setCustomValidity("");
                  }}
                />
              </div>
              <div>
                <div className="mb-4 text-lg font-semibold">Quantity</div>
                <SanitizedInput
                  disabled={invoice?.paid}
                  id="quantity"
                  min={1}
                  type="number"
                  unstyled={false}
                  value={item?.quantity}
                  onBlur={(e) =>
                    validateField("quantity", e.target.value, 1000000)
                  }
                  onChange={(e) => {
                    setItem({ ...item, quantity: Number(e.target.value) });
                    // Clear any previous validation message when user starts typing
                    const input = document.getElementById(
                      "quantity"
                    ) as HTMLInputElement;
                    if (input) input.setCustomValidity("");
                  }}
                />
              </div>
            </div>
          </div>
          <Button
            aria-label="Add Order"
            className="w-full"
            disabled={adding || invoice?.paid}
            loading={adding}
            title="+ Add Order"
            onClick={handleAddItem}
          />
        </Card>
      </div>
      <div>
        <Card className="bg-bg-surface-elevated dark:bg-bg-surface-elevated/80 text-text-primary border-border-subtle border-border-subtle/50 text-text-primary mb-0 rounded-xl border p-4 md:p-6">
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div className="mb-2 text-xl font-semibold md:mb-4">
              Invoice Items
            </div>
            <div className="mb-2 md:mb-0">
              <span className="text-text-muted border-1 px-2 py-1 font-semibold md:px-4 md:py-2">
                Total
              </span>
              <span className="text-text-muted border-1 px-2 py-1 font-semibold md:px-4 md:py-2">
                ${invoiceTotal.toFixed(2)}
              </span>
            </div>
          </div>
          {(invoice.invoice_items || []).length === 0 ? (
            <div className="text-text-muted bg-bg-surface rounded-lg border p-4 text-center text-base md:p-8 md:text-lg">
              No invoice items added yet. Use the form above to add items.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="bg-bg-surface-elevated text-text-primary border-border-subtle border-border-subtle/50 text-text-primary mb-4 w-full min-w-[600px] border text-sm dark:bg-[#18181b]">
                <thead>
                  <tr className="text-text-primary text-text-primary">
                    <th className="p-2 text-left">Activity</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">Qty</th>
                    <th className="p-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.invoice_items || []).map(
                    (it: OrganizationInvoiceLineItem, idx: number) => (
                      <tr
                        key={idx}
                        className="bg-bg-surface-elevated text-text-primary text-text-primary border-t dark:bg-[#18181b]"
                      >
                        <td className="max-w-[150px] p-2 text-wrap break-all">
                          {it.activity}
                        </td>
                        <td className="text-text-primary text-text-primary max-w-[150px] p-2 text-wrap break-all">
                          {it.description}
                        </td>
                        <td className="p-2">
                          ${it?.unit_price?.toFixed(2) ?? "0.00"}
                        </td>
                        <td className="p-2">{it?.quantity}</td>
                        <td className="p-2">
                          $
                          {(
                            (it?.unit_price || 0) * (it?.quantity || 0)
                          ).toFixed(2)}
                        </td>
                        {!invoice?.paid && (
                          <td className="flex gap-2 pr-2">
                            <Button
                              iconOnly
                              aria-label="Delete item"
                              disabled={deletingItemId !== null}
                              leftIcon={
                                <Trash2 className="h-4 w-4 text-red-500" />
                              }
                              loading={deletingItemId === idx}
                              variant={ButtonVariantEnum.GHOST}
                              onClick={() => handleDeleteItem(idx)}
                            />
                          </td>
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      <DialogManager manager={dialogManager} />
    </div>
  );
}
