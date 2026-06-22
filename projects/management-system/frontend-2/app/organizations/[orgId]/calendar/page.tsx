"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const CalendarPageContent = createLazyRoutePage(
  () => import("@/features/calendar/ui/CalendarPageContent")
);

export default function CalendarPage() {
  return <CalendarPageContent />;
}
