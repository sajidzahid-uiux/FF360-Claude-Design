"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { X } from "lucide-react";

import type { OrderDetailsItem } from "@/features/order-pipe/order-pipe-wizard/context";

export interface OrderItemsTableProps {
  orderItems: OrderDetailsItem[];
  onRemoveItem: (index: number) => void;
  readOnly?: boolean;
}

export function OrderItemsTable({
  orderItems,
  onRemoveItem,
  readOnly = false,
}: OrderItemsTableProps) {
  if (orderItems.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-text-muted text-[24px] font-normal">
          No order items added yet.
        </p>
        <p className="text-text-muted mt-1 text-[24px] font-normal">
          Use the form above to add items.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-auto rounded-lg">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-border-subtle text-text-muted border-t border-b border-l px-4 py-3 text-left text-[20px] font-medium">
              Category
            </th>
            <th className="border-border-subtle text-text-muted border border-r-0 border-l-0 px-4 py-3 text-left text-[20px] font-medium">
              Type
            </th>
            <th className="border-border-subtle text-text-muted border border-r-0 border-l-0 px-4 py-3 text-left text-[20px] font-medium">
              Option
            </th>
            <th className="border-border-subtle text-text-muted border border-r-0 border-l-0 px-4 py-3 text-left text-[20px] font-medium">
              Quantity
            </th>
            <th className="border-border-subtle w-12 border border-l-0 px-4 py-3">
              {" "}
            </th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item, index) => (
            <tr
              key={`${item.pipe_type}-${item.sub_type ?? ""}-${item.size}-${index}`}
              className="bg-bg-app"
            >
              <td className="border-border-subtle text-text-primary border-t border-b border-l px-4 py-3 text-[18px] font-normal">
                {item.pipe_type}
              </td>
              <td className="border-border-subtle text-text-primary border border-r-0 border-l-0 px-4 py-3 text-[18px] font-normal">
                {item.sub_type ?? "—"}
              </td>
              <td className="border-border-subtle text-text-primary border border-r-0 border-l-0 px-4 py-3 text-[18px] font-normal">
                {item.optionLabel ?? `${item.size}″`}
              </td>
              <td className="border-border-subtle text-text-primary border border-r-0 border-l-0 px-4 py-3 text-[18px] font-normal">
                {item.quantity}
              </td>
              <td className="border-border-subtle border border-l-0 px-4 py-3">
                {!readOnly && (
                  <Button
                    iconOnly
                    aria-label="Remove item"
                    leftIcon={<X className="h-4 w-4" />}
                    size={ComponentSizeEnum.SM}
                    variant={ButtonVariantEnum.GHOST}
                    onClick={() => onRemoveItem(index)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
