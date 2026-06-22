import type { DropdownOption } from "@fieldflow360/org-ui";
import { Check, CircleDot, FileText, Package, X } from "lucide-react";

import type { JobActiveInvoice } from "@/api/types";

export type JobDetailsMoreActionId =
  | "estimate"
  | "contract"
  | "order-pipe"
  | "create-invoice"
  | "invoice-checked"
  | "invoice-sent"
  | "invoice-paid";

export type JobDetailsInvoiceState = Pick<
  JobActiveInvoice,
  "checked_by_admin" | "sent_to_client" | "paid"
>;

export interface BuildJobDetailsMoreActionsParams {
  disabled?: boolean;
  showDocumentSentActions?: boolean;
  estimateSent?: boolean;
  contractSent?: boolean;
  onToggleEstimateSent?: () => void;
  onToggleContractSent?: () => void;
  showInvoice?: boolean;
  entityInvoice?: JobDetailsInvoiceState | null;
  onCreateInvoice?: () => void;
  onToggleInvoiceStatus?: (
    field: "checked_by_admin" | "sent_to_client" | "paid"
  ) => void;
  canToggleInvoiceStatus?: boolean;
  invoiceLoading?: boolean;
  invoiceDisabled?: boolean;
  showOrderPipe?: boolean;
  hasExistingPipeOrder?: boolean;
  canOrderPipe?: boolean;
  onCreatePipeOrder?: () => void;
  onViewPipeOrder?: () => void;
  orderPipeButtonText?: string;
}

export function buildJobDetailsMoreActionOptions(
  params: BuildJobDetailsMoreActionsParams
): DropdownOption<JobDetailsMoreActionId>[] {
  const {
    disabled = false,
    showDocumentSentActions = true,
    estimateSent = false,
    contractSent = false,
    onToggleEstimateSent,
    onToggleContractSent,
    showInvoice = false,
    entityInvoice,
    canToggleInvoiceStatus = false,
    invoiceLoading = false,
    invoiceDisabled = false,
    showOrderPipe = false,
    hasExistingPipeOrder = false,
    canOrderPipe = false,
    orderPipeButtonText,
  } = params;

  const options: DropdownOption<JobDetailsMoreActionId>[] = [];

  if (showDocumentSentActions && onToggleEstimateSent && onToggleContractSent) {
    options.push({
      value: "estimate",
      label: estimateSent ? "Estimate sent" : "Mark estimate sent",
      disabled,
      icon: estimateSent ? (
        <Check aria-hidden className="h-4 w-4 text-green-600" strokeWidth={2} />
      ) : (
        <X aria-hidden className="h-4 w-4 text-red-500" strokeWidth={2} />
      ),
    });
    options.push({
      value: "contract",
      label: contractSent ? "Contract sent" : "Mark contract sent",
      disabled,
      icon: contractSent ? (
        <Check aria-hidden className="h-4 w-4 text-green-600" strokeWidth={2} />
      ) : (
        <X aria-hidden className="h-4 w-4 text-red-500" strokeWidth={2} />
      ),
    });
  }

  if (showOrderPipe) {
    options.push({
      value: "order-pipe",
      label:
        orderPipeButtonText ||
        (hasExistingPipeOrder ? "View order pipe" : "Order pipe"),
      disabled: disabled || (!hasExistingPipeOrder && !canOrderPipe),
      icon: <Package aria-hidden className="h-4 w-4" strokeWidth={2} />,
    });
  }

  if (showInvoice) {
    if (!entityInvoice) {
      options.push({
        value: "create-invoice",
        label: "Create invoice",
        disabled: disabled || invoiceDisabled || invoiceLoading,
        icon: <FileText aria-hidden className="h-4 w-4" strokeWidth={2} />,
      });
    } else {
      const invoiceDisabledState =
        disabled || !canToggleInvoiceStatus || invoiceLoading;

      options.push({
        value: "invoice-checked",
        label: entityInvoice.checked_by_admin
          ? "Checked by admin"
          : "Mark checked by admin",
        disabled: invoiceDisabledState || !!entityInvoice.paid,
        icon: (
          <CircleDot
            aria-hidden
            className={`h-4 w-4 ${
              entityInvoice.checked_by_admin ? "text-green-600" : "text-red-400"
            }`}
            strokeWidth={2}
          />
        ),
      });
      options.push({
        value: "invoice-sent",
        label: entityInvoice.sent_to_client
          ? "Sent to client"
          : "Mark sent to client",
        disabled: invoiceDisabledState || !!entityInvoice.paid,
        icon: (
          <CircleDot
            aria-hidden
            className={`h-4 w-4 ${
              entityInvoice.sent_to_client ? "text-green-600" : "text-red-400"
            }`}
            strokeWidth={2}
          />
        ),
      });
      options.push({
        value: "invoice-paid",
        label: entityInvoice.paid ? "Paid" : "Mark paid",
        disabled: invoiceDisabledState,
        icon: (
          <CircleDot
            aria-hidden
            className={`h-4 w-4 ${
              entityInvoice.paid ? "text-green-600" : "text-red-400"
            }`}
            strokeWidth={2}
          />
        ),
      });
    }
  }

  return options;
}

export function runJobDetailsMoreAction(
  actionId: JobDetailsMoreActionId,
  params: BuildJobDetailsMoreActionsParams
) {
  switch (actionId) {
    case "estimate":
      params.onToggleEstimateSent?.();
      break;
    case "contract":
      params.onToggleContractSent?.();
      break;
    case "order-pipe":
      if (params.hasExistingPipeOrder) {
        params.onViewPipeOrder?.();
      } else {
        params.onCreatePipeOrder?.();
      }
      break;
    case "create-invoice":
      params.onCreateInvoice?.();
      break;
    case "invoice-checked":
      params.onToggleInvoiceStatus?.("checked_by_admin");
      break;
    case "invoice-sent":
      params.onToggleInvoiceStatus?.("sent_to_client");
      break;
    case "invoice-paid":
      params.onToggleInvoiceStatus?.("paid");
      break;
    default:
      break;
  }
}
