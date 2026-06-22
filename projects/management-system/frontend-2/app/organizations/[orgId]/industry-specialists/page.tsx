"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const IndustrySpecialistsPageContent = createLazyRoutePage(
  () =>
    import("@/features/industry-specialists/ui/IndustrySpecialistsPageContent")
);

export default function Page() {
  return <IndustrySpecialistsPageContent />;
}
