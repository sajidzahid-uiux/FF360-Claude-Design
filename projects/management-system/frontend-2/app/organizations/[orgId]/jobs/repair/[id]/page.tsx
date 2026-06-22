"use client";

import { JOB_ROUTE_CONFIGS } from "@/features/job-lead";
import { LazyJobLeadDetailRoutePage } from "@/features/job-lead/lazy";

export default function RepairJobDetailPage() {
  return <LazyJobLeadDetailRoutePage config={JOB_ROUTE_CONFIGS.repair} />;
}
