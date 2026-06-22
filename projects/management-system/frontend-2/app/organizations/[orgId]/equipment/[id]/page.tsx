"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const EquipmentDetailPageContent = createLazyRoutePage(
  () => import("@/features/equipment/ui/EquipmentDetailPageContent")
);

export default function EquipmentDetailPage() {
  return <EquipmentDetailPageContent />;
}
