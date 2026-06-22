"use client";

import { LEAD_ROUTE_CONFIGS } from "@/features/job-lead";
import { LazyJobLeadLogsRoutePage } from "@/features/job-lead/lazy";

export default function RepairLeadLogsPage() {
  return <LazyJobLeadLogsRoutePage config={LEAD_ROUTE_CONFIGS.repair} />;
}
