"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const OrgBillingPageContent = createLazyRoutePage(
  () => import("./OrgBillingPageContent")
);

export default function OrgBillingPage() {
  return <OrgBillingPageContent />;
}
