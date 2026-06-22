"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const QuickActionDetailRoutePage = createLazyRoutePage(
  () => import("@/features/quick-actions/ui/QuickActionDetailRoutePage")
);

export default function QuickActionDetailPage() {
  return <QuickActionDetailRoutePage />;
}
