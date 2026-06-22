"use client";

import { JOB_ROUTE_CONFIGS } from "@/features/job-lead";
import { LazyJobLeadLogsRoutePage } from "@/features/job-lead/lazy";

export default function TilingJobLogsPage() {
  return <LazyJobLeadLogsRoutePage config={JOB_ROUTE_CONFIGS.tiling} />;
}
