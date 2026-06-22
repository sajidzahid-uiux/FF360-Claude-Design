"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const CompletedPageContent = createLazyRoutePage(
  () => import("@/features/completed/ui/CompletedPageContent")
);

export default function Page() {
  return <CompletedPageContent />;
}
