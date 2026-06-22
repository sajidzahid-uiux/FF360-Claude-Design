import type { ContactInfo } from "@/api/types";
import { ClientsAndFarmsCardField } from "@/features/contacts";
import {
  getPrimaryFarmManagementName,
  normalizeContactInfoForClientsAndFarms,
} from "@/features/contacts/lib";
import { buildRowActions } from "@/utils/actions";

import { GenericCardField, GenericCardProps } from "../types";

export interface OrderPipeCardData {
  id: number | string;
  job?: number;
  po_number?: string | null;
  estimate_number?: string | null;
  vendor_status?: string | null;
  order_status?: string;
  job_name?: string;
  contact_info?: Partial<ContactInfo> | null;
  farm_name?: string | null;
}

export interface OrderPipeCardCallbacks {
  onAction?: (action: string) => void;
  onDelete?: () => void;
  onLogs?: () => void;
}

export interface OrderPipeCardOptions {
  vendorStatusMap?: Record<string, string>;
  canDelete?: boolean;
  canView?: boolean;
}

/**
 * Order Pipe card preset - generates GenericCard props from order data
 */
export function getOrderPipeCardProps(
  data: OrderPipeCardData,
  callbacks: OrderPipeCardCallbacks,
  options: OrderPipeCardOptions
): GenericCardProps {
  const { onAction, onDelete, onLogs } = callbacks;
  const { canDelete = false, canView = true } = options;

  const title =
    data.job_name ||
    data.contact_info?.full_name ||
    (data.job ? `Job #${data.job}` : "N/A");

  const numberValue = data.estimate_number ?? data.po_number ?? null;

  const normalizedContact = normalizeContactInfoForClientsAndFarms(
    data.contact_info
  );
  const fields: GenericCardField[] = [];

  if (
    normalizedContact?.full_name?.trim() ||
    getPrimaryFarmManagementName(data.contact_info)
  ) {
    fields.push(ClientsAndFarmsCardField(normalizedContact, data.farm_name));
  }

  fields.push({
    label: "Number",
    value: numberValue || "—",
  });

  if (data.order_status) {
    fields.push({
      label: "Order Status",
      value: data.order_status,
    });
  }

  const actionItems = buildRowActions({
    canView,
    canEdit: false,
    canDelete: canDelete && !!onDelete,
    canArchive: false,
    canTrack: false,
    isArchived: false,
    onView: () => onAction?.("view"),
    onLogs: onLogs ? onLogs : undefined,
    onDelete,
  });

  return {
    title,
    fields,
    onDoubleClick: () => onAction?.("view"),
    actionItems,
    showCheckbox: false,
  };
}
