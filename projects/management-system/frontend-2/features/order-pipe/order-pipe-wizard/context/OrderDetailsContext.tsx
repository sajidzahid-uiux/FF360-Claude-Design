"use client";

import type { ReactNode } from "react";

import type { VendorFormV2 } from "@/api/types";
import {
  type OrderDetailsItem,
  getOrderItemsPayload,
  useOrderPipeWizardActions,
  useOrderPipeWizardSession,
  useOrderPipeWizardStore,
} from "@/features/order-pipe/model/order-pipe-wizard-store";

export type { OrderDetailsItem };

export function OrderDetailsProvider({
  children,
}: {
  children: ReactNode;
  order: VendorFormV2;
}) {
  return <>{children}</>;
}

export function useOrderDetailsContext() {
  const vendorFormId = useOrderPipeWizardStore(
    (state) => state.activeSessionId
  );
  const session = useOrderPipeWizardSession(vendorFormId);
  const { addOrderItem, removeOrderItem, updateOrderItem, setOrderItems } =
    useOrderPipeWizardActions();

  if (vendorFormId == null || !session) {
    throw new Error(
      "useOrderDetailsContext must be used within OrderDetailsProvider"
    );
  }

  return {
    order: session.order,
    orderItems: session.orderItems,
    addItem: (item: OrderDetailsItem) => {
      addOrderItem(vendorFormId, item);
    },
    removeItem: (index: number) => {
      removeOrderItem(vendorFormId, index);
    },
    updateItem: (index: number, item: OrderDetailsItem) => {
      updateOrderItem(vendorFormId, index, item);
    },
    setOrderItems: (items: OrderDetailsItem[]) => {
      setOrderItems(vendorFormId, items);
    },
    getItemsPayload: () => getOrderItemsPayload(session.orderItems),
  };
}
