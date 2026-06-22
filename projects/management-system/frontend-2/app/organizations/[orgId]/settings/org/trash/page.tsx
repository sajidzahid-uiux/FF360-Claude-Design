"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const OrgTrashPageContent = createLazyRoutePage(
  () => import("@/features/org-trash/ui/OrgTrashPageContent")
);

export default function OrgTrashPage() {
  return <OrgTrashPageContent />;
}
