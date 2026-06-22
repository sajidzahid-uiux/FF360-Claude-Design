"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const RepairOnSiteTrackingPageContent = createLazyRoutePage(
  () =>
    import("@/features/job-lead/ui/on-site-tracking/pages/RepairOnSiteTrackingPageContent")
);

export default function OnSiteTrackingPage() {
  return <RepairOnSiteTrackingPageContent />;
}
