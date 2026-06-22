"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import {
  ChevronDown,
  CircleDot,
  Ellipsis,
  History,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  ORDER_PIPE_STATUSES,
  ORDER_PIPE_STATUS_LABELS,
  OrderPipeStatus,
} from "@/constants";
import { useRouteIds } from "@/hooks";
import {
  useDeleteVendorForm,
  useGenerateVendorFormInvoice,
  useUpdateVendorForm,
} from "@/hooks/mutations";
import { useOrderPipePermissions } from "@/hooks/permissions";
import { useVendorForm } from "@/hooks/queries";
import { useDialogManager } from "@/hooks/useDialogManager";
import { orgPath } from "@/shared/config/routes";
import { parseEntityId } from "@/shared/lib/parseEntityId";
import { DialogManager, Dropdown } from "@/shared/ui/common";
import type { DropdownItem } from "@/shared/ui/common/Dropdown";

import { useOrderDetailsContext } from "../../context";

const STATUS_PLACEHOLDER = "Select status";

const STATUS_ITEMS: DropdownItem[] = ORDER_PIPE_STATUSES.map((status) => ({
  id: status,
  label: ORDER_PIPE_STATUS_LABELS[status],
}));

interface OrderPipeActionsProps {
  currentStep: number;
  orderId?: number | string;
  onClose?: () => void;
}

export function OrderPipeActions({
  currentStep,
  orderId,
  onClose,
}: OrderPipeActionsProps) {
  const router = useRouter();
  const { orgId } = useRouteIds();
  const resolvedOrderId =
    orderId == null ? null : parseEntityId(orderId, "orderId");
  const dialogManager = useDialogManager();
  const { order } = useOrderDetailsContext();
  const deleteVendorForm = useDeleteVendorForm();
  const generateInvoice = useGenerateVendorFormInvoice();
  const updateVendorForm = useUpdateVendorForm();
  const isReviewStep = currentStep === 4;
  const { data: vendorForm } = useVendorForm(
    orderId ?? null,
    !!orderId && isReviewStep
  );
  const orderStatus: OrderPipeStatus | null =
    vendorForm?.order_status &&
    STATUS_ITEMS.some((i) => i.id === vendorForm.order_status)
      ? (vendorForm.order_status as OrderPipeStatus)
      : null;
  const statusLabel =
    orderStatus !== null
      ? ORDER_PIPE_STATUS_LABELS[orderStatus]
      : STATUS_PLACEHOLDER;
  const { canDelete, canWrite, canRead } = useOrderPipePermissions();

  const handleDelete = useCallback(() => {
    if (!resolvedOrderId) {
      toast.error("Order ID is required");
      return;
    }

    const displayName = order.job_name || `Order #${resolvedOrderId}`;
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

          await deleteVendorForm.mutateAsync(resolvedOrderId!);

          dialogManager.closeDialog();

          if (onClose) {
            onClose();
          } else {
            if (orgId) router.push(orgPath(orgId, `/order-pipe`));
          }
        } catch {
          // Error toast is handled by useDeleteVendorForm hook
          dialogManager.setConfirmationProcessing(false);
        }
      },
    });
  }, [
    resolvedOrderId,
    order,
    dialogManager,
    deleteVendorForm,
    onClose,
    router,
    orgId,
  ]);

  const ORDER_PIPE_ACTIONS_ITEMS = useMemo<DropdownItem[]>(() => {
    const items: DropdownItem[] = [];
    if (canRead && orgId && orderId != null) {
      items.push({
        id: "logs",
        label: "Logs",
        icon: <History className="h-4 w-4" />,
        onSelect: () =>
          router.push(orgPath(orgId, `/order-pipe/${orderId}/logs`)),
      });
    }
    if (canDelete) {
      items.push({
        id: "delete",
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        destructive: true,
        onSelect: handleDelete,
      });
    }
    return items;
  }, [canRead, orgId, orderId, router, canDelete, handleDelete]);

  const handleStatusChange = useCallback(
    (value: string) => {
      if (!resolvedOrderId) return;
      updateVendorForm.mutate({
        vendorFormId: resolvedOrderId,
        payload: { order_status: value },
      });
    },
    [resolvedOrderId, updateVendorForm]
  );

  const handleGenerateInvoice = useCallback(() => {
    if (!resolvedOrderId) return;
    const jobName = order.job_name?.trim();
    const filename = jobName
      ? `order-invoice for ${jobName.replace(/[/\\:*?"<>|]/g, "-")}.pdf`
      : "order-invoice.pdf";
    generateInvoice.mutate({ vendorFormId: resolvedOrderId, filename });
  }, [resolvedOrderId, order.job_name, generateInvoice]);

  return (
    <>
      <DialogManager manager={dialogManager} />
      <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
        {isReviewStep && (
          <>
            <Dropdown
              align="start"
              disabled={!canWrite}
              items={STATUS_ITEMS}
              mode="select"
              placeholder={STATUS_PLACEHOLDER}
              selectedValue={orderStatus ?? undefined}
              trigger={
                <Button
                  disabled={!canWrite || updateVendorForm.isPending}
                  leftIcon={<CircleDot className="h-4 w-4" />}
                  rightIcon={<ChevronDown className="h-4 w-4 opacity-50" />}
                  size={ComponentSizeEnum.SM}
                  title={statusLabel}
                  variant={ButtonVariantEnum.SURFACE}
                />
              }
              width="auto"
              onValueChange={handleStatusChange}
            />
            <Button
              aria-label={
                generateInvoice.isPending
                  ? "Generating…"
                  : "Download Order Invoice"
              }
              disabled={!orderId || generateInvoice.isPending}
              loading={generateInvoice.isPending}
              size={ComponentSizeEnum.SM}
              title={
                generateInvoice.isPending
                  ? "Generating…"
                  : "Download Order Invoice"
              }
              onClick={handleGenerateInvoice}
            />
          </>
        )}
        {orderId && ORDER_PIPE_ACTIONS_ITEMS.length > 0 && (
          <Dropdown
            align="end"
            items={ORDER_PIPE_ACTIONS_ITEMS}
            trigger={
              <Button
                iconOnly
                aria-label="Open menu"
                leftIcon={<Ellipsis className="h-5 w-5" />}
                size={ComponentSizeEnum.SM}
                variant={ButtonVariantEnum.GHOST}
              />
            }
            triggerAriaLabel="Open menu"
          />
        )}
      </div>
    </>
  );
}
