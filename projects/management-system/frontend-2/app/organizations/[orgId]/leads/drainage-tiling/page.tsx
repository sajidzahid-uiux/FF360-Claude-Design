"use client";

import { LEAD_ROUTE_CONFIGS } from "@/features/job-lead";
import { LazyJobLeadListRoutePage } from "@/features/job-lead/lazy";

export default function TilingLeadsPage() {
  return <LazyJobLeadListRoutePage config={LEAD_ROUTE_CONFIGS.tiling} />;
}
