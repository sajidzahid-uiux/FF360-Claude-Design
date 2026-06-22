"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const Dashboard = createLazyRoutePage(
  () => import("@/features/dashboard/ui/Dashboard")
);

export default function DashboardPage() {
  return (
    <div className="px-8 pt-0 pb-6">
      <Dashboard />
    </div>
  );
}
