"use client";

import type { VendorFormV2 } from "@/api/types";

import { OrderPipeWizard } from "../order-pipe-wizard";

interface OrderPipeDetailViewProps {
  order: VendorFormV2;
  onClose: () => void;
}

export function OrderPipeDetailView({
  order,
  onClose,
}: OrderPipeDetailViewProps) {
  return <OrderPipeWizard order={order} onClose={onClose} />;
}
