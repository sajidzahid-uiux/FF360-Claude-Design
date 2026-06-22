"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const OrderPipePageContent = createLazyRoutePage(
  () => import("@/features/order-pipe/ui/OrderPipePageContent")
);

export default function Page() {
  return <OrderPipePageContent />;
}
