"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const EquipmentPageContent = createLazyRoutePage(
  () => import("@/features/equipment/ui/EquipmentPageContent")
);

export default function Page() {
  return <EquipmentPageContent />;
}
