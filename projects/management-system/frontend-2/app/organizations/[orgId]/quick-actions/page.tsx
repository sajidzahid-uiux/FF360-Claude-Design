"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const QuickActionsPageContent = createLazyRoutePage(
  () => import("@/features/quick-actions/ui/QuickActionsPageContent")
);

export default function Page() {
  return <QuickActionsPageContent />;
}
