"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const OrgBillingPageContent = createLazyRoutePage(
  () => import("@/features/billing/ui/OrgBillingPageContent")
);

export default function OrgBillingPage() {
  return <OrgBillingPageContent />;
}
