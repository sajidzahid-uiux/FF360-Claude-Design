"use client";

import { LEAD_ROUTE_CONFIGS } from "@/features/job-lead";
import { LazyJobLeadDetailRoutePage } from "@/features/job-lead/lazy";

export default function TilingLeadDetailPage() {
  return <LazyJobLeadDetailRoutePage config={LEAD_ROUTE_CONFIGS.tiling} />;
}
