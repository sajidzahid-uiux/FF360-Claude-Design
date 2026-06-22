"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const ExcavationOnSiteTrackingPageContent = createLazyRoutePage(
  () =>
    import("@/features/job-lead/ui/on-site-tracking/pages/ExcavationOnSiteTrackingPageContent")
);

export default function OnSiteTrackingPage() {
  return <ExcavationOnSiteTrackingPageContent />;
}
