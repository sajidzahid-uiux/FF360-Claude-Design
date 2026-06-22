import type { OrderItem } from "@/api/types";

export interface OrderItemsGridProps {
  items: OrderItem[];
}

export function OrderItemsGrid({ items }: OrderItemsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((item) => {
        const remaining = item.total_quantity - item.assigned_total;
        return (
          <div
            key={item.item_key}
            className="border-border-subtle bg-bg-app flex min-w-0 flex-col gap-1 rounded-lg border px-3 py-2.5"
          >
            <span className="text-text-primary min-w-0 truncate text-[16px] font-medium">
              {item.name}
            </span>
            <div className="flex flex-wrap items-center gap-2 text-[14px]">
              <span className="bg-bg-surface text-text-primary rounded-full px-2 py-0.5">
                Total: {item.total_quantity} {item.unit}
              </span>
              <span className="text-text-muted text-[12px]">
                Assigned: {item.assigned_total}
              </span>
              <span
                className={`text-[12px] ${
                  remaining > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-text-muted"
                }`}
              >
                Remaining: {remaining} {item.unit}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
