"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const UserNotificationsPageContent = createLazyRoutePage(
  () => import("@/features/user-settings/ui/UserNotificationsPageContent")
);

export default function UserNotificationsPage() {
  return <UserNotificationsPageContent />;
}
