"use client";

import { useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  Dropdown,
  type DropdownOption,
  cn,
} from "@fieldflow360/org-ui";
import { ChevronDown } from "lucide-react";

import type { JobActiveInvoice } from "@/api/types";
import {
  type JobDetailsMoreActionId,
  buildJobDetailsMoreActionOptions,
  runJobDetailsMoreAction,
} from "@/features/job-lead/lib/buildJobDetailsMoreActions";

interface DetailsActionsDropdownProps {
  disabled?: boolean;
  className?: string;
  width?: number;
  fullWidthBelowDesktop?: boolean;

  showDocumentSentActions?: boolean;
  estimateSent?: boolean;
  contractSent?: boolean;
  onToggleEstimateSent?: () => void;
  onToggleContractSent?: () => void;

  showInvoice?: boolean;
  entityInvoice?: JobActiveInvoice | null;
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

export function DetailsActionsDropdown({
  disabled = false,
  className = "",
  width = 220,
  fullWidthBelowDesktop = false,
  showDocumentSentActions = true,
  estimateSent = false,
  contractSent = false,
  onToggleEstimateSent,
  onToggleContractSent,
  showInvoice = false,
  entityInvoice,
  onCreateInvoice,
  onToggleInvoiceStatus,
  canToggleInvoiceStatus = false,
  invoiceLoading = false,
  invoiceDisabled = false,
  showOrderPipe = false,
  hasExistingPipeOrder = false,
  canOrderPipe = false,
  onCreatePipeOrder,
  onViewPipeOrder,
  orderPipeButtonText,
}: DetailsActionsDropdownProps) {
  const [menuValue, setMenuValue] = useState<
    JobDetailsMoreActionId | undefined
  >(undefined);

  const actionParams = useMemo(
    () => ({
      disabled,
      showDocumentSentActions,
      estimateSent,
      contractSent,
      onToggleEstimateSent,
      onToggleContractSent,
      showInvoice,
      entityInvoice: entityInvoice
        ? {
            checked_by_admin: Boolean(entityInvoice.checked_by_admin),
            sent_to_client: Boolean(entityInvoice.sent_to_client),
            paid: Boolean(entityInvoice.paid),
          }
        : null,
      onCreateInvoice,
      onToggleInvoiceStatus,
      canToggleInvoiceStatus,
      invoiceLoading,
      invoiceDisabled,
      showOrderPipe,
      hasExistingPipeOrder,
      canOrderPipe,
      onCreatePipeOrder,
      onViewPipeOrder,
      orderPipeButtonText,
    }),
    [
      disabled,
      showDocumentSentActions,
      estimateSent,
      contractSent,
      onToggleEstimateSent,
      onToggleContractSent,
      showInvoice,
      entityInvoice,
      onCreateInvoice,
      onToggleInvoiceStatus,
      canToggleInvoiceStatus,
      invoiceLoading,
      invoiceDisabled,
      showOrderPipe,
      hasExistingPipeOrder,
      canOrderPipe,
      onCreatePipeOrder,
      onViewPipeOrder,
      orderPipeButtonText,
    ]
  );

  const options = useMemo(
    (): DropdownOption<JobDetailsMoreActionId>[] =>
      buildJobDetailsMoreActionOptions(actionParams),
    [actionParams]
  );

  if (options.length === 0) {
    return null;
  }

  const handleChange = (value: JobDetailsMoreActionId) => {
    runJobDetailsMoreAction(value, actionParams);
    setMenuValue(undefined);
  };

  return (
    <div
      className={cn(
        fullWidthBelowDesktop ? "w-full min-[426px]:w-fit" : "w-full sm:w-fit",
        className
      )}
    >
      <Dropdown
        className={cn(
          fullWidthBelowDesktop ? "w-full min-[426px]:w-auto" : "w-auto"
        )}
        disabled={disabled}
        fullWidth={false}
        menuMinWidth={width}
        options={options}
        placeholder="More actions"
        trigger={({ isOpen, disabled: triggerDisabled }) => (
          <Button
            className={cn(fullWidthBelowDesktop ? "w-full" : "w-full sm:w-fit")}
            disabled={triggerDisabled}
            leftIcon={
              <ChevronDown
                aria-hidden
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  isOpen && "rotate-180"
                )}
                strokeWidth={2}
              />
            }
            title="More actions"
            variant={ButtonVariantEnum.SURFACE}
          />
        )}
        value={menuValue}
        onChange={handleChange}
      />
    </div>
  );
}
