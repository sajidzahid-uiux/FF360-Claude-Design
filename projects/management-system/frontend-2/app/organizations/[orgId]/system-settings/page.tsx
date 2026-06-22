"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const SystemSettingsPageContent = createLazyRoutePage(
  () => import("@/features/system-settings/ui/SystemSettingsPageContent")
);

export default function Page() {
  return <SystemSettingsPageContent />;
}
