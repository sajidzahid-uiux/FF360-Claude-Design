"use client";

import { JOB_ROUTE_CONFIGS } from "@/features/job-lead";
import { LazyJobLeadListRoutePage } from "@/features/job-lead/lazy";

export default function ExcavationJobsPage() {
  return <LazyJobLeadListRoutePage config={JOB_ROUTE_CONFIGS.excavation} />;
}
