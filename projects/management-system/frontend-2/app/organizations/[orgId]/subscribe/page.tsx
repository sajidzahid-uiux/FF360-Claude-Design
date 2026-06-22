"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const SubscribePageContent = createLazyRoutePage(
  () => import("@/features/subscribe/ui/SubscribePageContent")
);

export default function Page() {
  return <SubscribePageContent />;
}
