"use client";

import { JOB_ROUTE_CONFIGS } from "@/features/job-lead";
import { LazyJobLeadDetailRoutePage } from "@/features/job-lead/lazy";

export default function TilingJobDetailPage() {
  return <LazyJobLeadDetailRoutePage config={JOB_ROUTE_CONFIGS.tiling} />;
}
