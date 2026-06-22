"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const CrewManagementPageContent = createLazyRoutePage(
  () => import("@/features/crew-management/ui/CrewManagementPageContent")
);

export default function CrewManagementPage() {
  return <CrewManagementPageContent />;
}
