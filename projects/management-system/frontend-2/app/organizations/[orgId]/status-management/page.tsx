"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const StatusManagementPageContent = createLazyRoutePage(
  () => import("@/features/status-management/ui/StatusManagementPageContent")
);

export default function StatusManagementPage() {
  return <StatusManagementPageContent />;
}
