"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const FootagePageContent = createLazyRoutePage(
  () => import("@/features/footage/ui/FootagePageContent")
);

export default function Page() {
  return <FootagePageContent />;
}
