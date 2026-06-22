"use client";

import { LEAD_ROUTE_CONFIGS } from "@/features/job-lead";
import { LazyJobLeadDetailRoutePage } from "@/features/job-lead/lazy";

export default function RepairLeadDetailPage() {
  return <LazyJobLeadDetailRoutePage config={LEAD_ROUTE_CONFIGS.repair} />;
}
