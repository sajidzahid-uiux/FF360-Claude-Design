"use client";

import { LEAD_ROUTE_CONFIGS } from "@/features/job-lead";
import { LazyJobLeadLogsRoutePage } from "@/features/job-lead/lazy";

export default function TilingLeadLogsPage() {
  return <LazyJobLeadLogsRoutePage config={LEAD_ROUTE_CONFIGS.tiling} />;
}
