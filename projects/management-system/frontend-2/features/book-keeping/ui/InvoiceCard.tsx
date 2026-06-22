"use client";

import { TableActions, TableGridCard } from "@fieldflow360/org-ui";

import { ClientsAndFarmsCell } from "@/features/contacts";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";
import { mapDropdownItemsToTableActions } from "@/shared/lib/table/org-ui";
import type { InvoiceCardData } from "@/shared/ui/common/GenericCard/presets/invoiceCard";
import { buildRowActions } from "@/utils/actions";

interface InvoiceCardProps {
  invoice: InvoiceCardData;
  selected: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
  onView: () => void;
  onDelete?: () => void;
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

function StatusValue({ value }: { value: boolean }) {
  return value ? (
    <span className="font-semibold text-green-600 dark:text-green-400">
      Yes
    </span>
  ) : (
    <span className="font-semibold text-red-500 dark:text-red-400">No</span>
  );
}

export function InvoiceCard({
  invoice,
  selected,
  onSelect,
  onDeselect,
  onView,
  onDelete,
  compact = false,
}: InvoiceCardProps) {
  const amount = computeAmount(invoice);
  const actionItems = buildRowActions({
    canView: true,
    canEdit: false,
    canDelete: !!onDelete,
    canArchive: false,
    canTrack: false,
    isArchived: false,
    onView,
    onDelete,
  });
  const tableActions = mapDropdownItemsToTableActions<InvoiceCardData>({
    items: actionItems,
  });

  const fields = compact
    ? [
        { label: "Amount", value: `$${amount.toFixed(2)}` },
        { label: "Paid", value: invoice.paid ? "Yes" : "No" },
      ]
    : [
        { label: "Invoice Number", value: invoice.invoice_number ?? "—" },
        { label: "Amount", value: `$${amount.toFixed(2)}` },
        { label: "Checked by Admin", value: invoice.checked_by_admin },
        { label: "Sent to Client", value: invoice.sent_to_client },
        { label: "Paid", value: invoice.paid },
      ];

  return (
    <div className="h-full cursor-pointer" onDoubleClick={onView}>
      <TableGridCard
        selectable
        actions={
          tableActions.length > 0 ? (
            <TableActions
              actions={tableActions}
              item={invoice}
              {...INLINE_TABLE_ROW_ACTIONS_PROPS}
            />
          ) : undefined
        }
        headerContent={
          !compact && (invoice.contact_info?.full_name || invoice.farm_name) ? (
            <ClientsAndFarmsCell
              compact
              contactInfo={invoice.contact_info}
              farmName={invoice.farm_name}
            />
          ) : undefined
        }
        selected={selected}
        title={invoice.title ?? "Untitled"}
        onSelectedChange={(next) => {
          if (next) {
            onSelect?.();
            return;
          }
          onDeselect?.();
        }}
      >
        <dl className="flex flex-col gap-2">
          {fields.map((field) => (
            <div
              key={field.label}
              className="flex items-center justify-between gap-2"
            >
              <dt className="text-text-muted text-xs">{field.label}</dt>
              <dd className="text-text-primary text-xs font-medium">
                {typeof field.value === "boolean" ? (
                  <StatusValue value={field.value} />
                ) : field.label === "Invoice Number" ? (
                  <span className="font-mono">{field.value}</span>
                ) : (
                  field.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </TableGridCard>
    </div>
  );
}
