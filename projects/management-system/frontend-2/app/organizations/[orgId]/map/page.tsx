"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const MapPageContent = createLazyRoutePage(
  () => import("@/features/map/ui/MapPageContent")
);

export default function Page() {
  return <MapPageContent />;
}
