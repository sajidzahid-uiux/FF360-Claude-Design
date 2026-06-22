"use client";

import { LEAD_ROUTE_CONFIGS } from "@/features/job-lead";
import { LazyJobLeadDetailRoutePage } from "@/features/job-lead/lazy";

export default function ExcavationLeadDetailPage() {
  return <LazyJobLeadDetailRoutePage config={LEAD_ROUTE_CONFIGS.excavation} />;
}
