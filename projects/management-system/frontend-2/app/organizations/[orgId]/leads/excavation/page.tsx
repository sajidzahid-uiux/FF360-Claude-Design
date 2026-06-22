"use client";

import { LEAD_ROUTE_CONFIGS } from "@/features/job-lead";
import { LazyJobLeadListRoutePage } from "@/features/job-lead/lazy";

export default function ExcavationLeadsPage() {
  return <LazyJobLeadListRoutePage config={LEAD_ROUTE_CONFIGS.excavation} />;
}
