"use client";

import { JOB_ROUTE_CONFIGS } from "@/features/job-lead";
import { LazyJobLeadListRoutePage } from "@/features/job-lead/lazy";

export default function RepairJobsPage() {
  return <LazyJobLeadListRoutePage config={JOB_ROUTE_CONFIGS.repair} />;
}
