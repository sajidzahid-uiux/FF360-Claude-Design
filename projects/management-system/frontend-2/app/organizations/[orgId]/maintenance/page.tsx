"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const MaintenancePageContent = createLazyRoutePage(
  () => import("@/features/maintenance/ui/MaintenancePageContent")
);

export default function MaintenancePage() {
  return <MaintenancePageContent />;
}
