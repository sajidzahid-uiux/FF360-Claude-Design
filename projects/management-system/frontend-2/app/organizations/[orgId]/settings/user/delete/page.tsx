"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const UserDeletePageContent = createLazyRoutePage(
  () => import("@/features/user-settings/ui/delete/UserDeletePageContent")
);

export default function UserDeletePage() {
  return <UserDeletePageContent />;
}
