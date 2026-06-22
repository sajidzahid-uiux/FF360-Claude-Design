"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const UserSettingsPageContent = createLazyRoutePage(
  () => import("@/features/user-settings/ui/UserSettingsPageContent")
);

export default function UserSettingsPage() {
  return <UserSettingsPageContent />;
}
