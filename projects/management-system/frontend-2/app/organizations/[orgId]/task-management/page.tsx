"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const TaskManagementPageContent = createLazyRoutePage(
  () => import("@/features/task-management/ui/TaskManagementPageContent")
);

export default function Page() {
  return <TaskManagementPageContent />;
}
