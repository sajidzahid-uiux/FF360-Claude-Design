import { TableActions, TableGridCard } from "@fieldflow360/org-ui";

import { ClientsAndFarmsCell } from "@/features/contacts";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";
import { mapDropdownItemsToTableActions } from "@/shared/lib/table/org-ui";
import type { OrderPipeCardData } from "@/shared/ui/common/GenericCard/presets/orderPipeCard";
import { buildRowActions } from "@/utils/actions";

export function OrderPipeCard({
  order,
  onAction,
  onDelete,
  onLogs,
  canDelete,
  canView,
  onDoubleClick,
}: {
  order: OrderPipeCardData;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onAction?: (action: string) => void;
  onDelete?: () => void;
  onLogs?: () => void;
  vendorStatusMap?: Record<string, string>;
  canDelete?: boolean;
  canView?: boolean;
  onDoubleClick?: () => void;
}) {
  const title =
    order.job_name ||
    order.contact_info?.full_name ||
    (order.job ? `Job #${order.job}` : "N/A");
  const numberValue = order.estimate_number ?? order.po_number ?? null;

  const actionItems = buildRowActions({
    canView: canView ?? true,
    canEdit: false,
    canDelete: (canDelete ?? false) && !!onDelete,
    canArchive: false,
    canTrack: false,
    isArchived: false,
    onView: () => onAction?.("view"),
    onLogs: onLogs ? onLogs : undefined,
    onDelete,
  });
  const tableActions = mapDropdownItemsToTableActions<OrderPipeCardData>({
    items: actionItems,
  });

  const handleDoubleClick = onDoubleClick ?? (() => onAction?.("view"));

  return (
    <div className="h-full cursor-pointer" onDoubleClick={handleDoubleClick}>
      <TableGridCard
        actions={
          tableActions.length > 0 ? (
            <TableActions
              actions={tableActions}
              item={order}
              {...INLINE_TABLE_ROW_ACTIONS_PROPS}
            />
          ) : undefined
        }
        headerContent={
          order.contact_info?.full_name || order.farm_name ? (
            <ClientsAndFarmsCell
              compact
              contactInfo={order.contact_info}
              farmName={order.farm_name}
            />
          ) : undefined
        }
        title={title}
      >
        <dl className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Number</dt>
            <dd className="text-text-primary text-xs font-medium tabular-nums">
              {numberValue || "—"}
            </dd>
          </div>
          {order.order_status ? (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-text-muted text-xs">Order Status</dt>
              <dd className="text-text-primary text-xs font-medium">
                {order.order_status}
              </dd>
            </div>
          ) : null}
        </dl>
      </TableGridCard>
    </div>
  );
}
