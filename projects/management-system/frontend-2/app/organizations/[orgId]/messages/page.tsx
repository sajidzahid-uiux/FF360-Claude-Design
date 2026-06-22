"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const MessagesPageContent = createLazyRoutePage(
  () => import("@/features/messaging/ui/MessagesPageContent")
);

export default function Page() {
  return <MessagesPageContent />;
}
