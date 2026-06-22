import type { InvoiceCardRow } from "@/api/types";
import { ClientsAndFarmsCardField } from "@/features/contacts";
import {
  getPrimaryFarmManagementName,
  normalizeContactInfoForClientsAndFarms,
} from "@/features/contacts/lib";
import { buildRowActions } from "@/utils/actions";

import { GenericCardField, GenericCardProps } from "../types";

export type InvoiceCardData = InvoiceCardRow;

export interface InvoiceCardCallbacks {
  onView: () => void;
  onDelete?: () => void;
}

export interface InvoiceCardOptions {
  selected: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
  compact?: boolean;
}

function computeAmount(inv: InvoiceCardData): number {
  if (!inv.invoice_items?.length) return 0;
  return inv.invoice_items.reduce(
    (acc, item) =>
      acc + Number(item.unit_price ?? 0) * Number(item.quantity ?? 0),
    0
  );
}

export function getInvoiceCardProps(
  data: InvoiceCardData,
  callbacks: InvoiceCardCallbacks,
  options: InvoiceCardOptions
): GenericCardProps {
  const { onView, onDelete } = callbacks;
  const { selected, onSelect, onDeselect } = options;

  const amount = computeAmount(data);
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

  fields.push(
    {
      label: "Invoice Number",
      value: data.invoice_number ?? "—",
    },
    {
      label: "Amount",
      value: `$${amount.toFixed(2)}`,
    },
    {
      label: "Checked by Admin",
      value: data.checked_by_admin ? "Yes" : "No",
    },
    { label: "Sent to Client", value: data.sent_to_client ? "Yes" : "No" },
    { label: "Paid", value: data.paid ? "Yes" : "No" }
  );

  const actionItems = buildRowActions({
    canView: true,
    canEdit: false,
    canDelete: !!onDelete,
    canArchive: false,
    canTrack: false,
    isArchived: false,
    onView: onView,
    onDelete: onDelete,
  });

  return {
    title: data.title ?? "Untitled",
    fields,
    selected,
    onSelect,
    onDeselect,
    showCheckbox: true,
    onDoubleClick: onView,
    actionItems,
  };
}
