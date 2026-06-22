"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const TilingOnSiteTrackingPageContent = createLazyRoutePage(
  () =>
    import("@/features/job-lead/ui/on-site-tracking/pages/TilingOnSiteTrackingPageContent")
);

export default function OnSiteTrackingPage() {
  return <TilingOnSiteTrackingPageContent />;
}
