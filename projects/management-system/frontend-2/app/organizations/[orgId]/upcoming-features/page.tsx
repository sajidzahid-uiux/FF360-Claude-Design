"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const UpcomingFeaturesPageContent = createLazyRoutePage(
  () => import("@/features/upcoming-features/ui/UpcomingFeaturesPageContent")
);

export default function Page() {
  return <UpcomingFeaturesPageContent />;
}
