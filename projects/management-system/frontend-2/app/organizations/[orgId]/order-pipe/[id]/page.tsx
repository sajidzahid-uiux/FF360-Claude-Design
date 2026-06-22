"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const OrderPipeDetailRoutePage = createLazyRoutePage(
  () => import("@/features/order-pipe/ui/OrderPipeDetailRoutePage")
);

export default function OrderPipeDetailPage() {
  return <OrderPipeDetailRoutePage />;
}
