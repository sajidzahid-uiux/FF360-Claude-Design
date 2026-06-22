"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const CompletedDetailPageContent = createLazyRoutePage(
  () => import("@/features/completed/ui/CompletedDetailPageContent")
);

export default function CompletedDetailPage() {
  return <CompletedDetailPageContent />;
}
