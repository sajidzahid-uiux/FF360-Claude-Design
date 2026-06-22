"use client";

import { ResourceType } from "@/constants";
import type { JobLeadRouteConfig } from "@/features/job-lead/model";

import { useJobLeadRouteConfig } from "../hooks/useJobLeadRouteConfig";
import { JobListPage } from "./JobListPage";
import { LeadListPage } from "./LeadListPage";

export interface JobLeadListRoutePageProps {
  config?: JobLeadRouteConfig;
}

export function JobLeadListRoutePage({
  config: configProp,
}: JobLeadListRoutePageProps) {
  const config = useJobLeadRouteConfig(configProp);

  if (!config) {
    return null;
  }

  return config.entity === ResourceType.JOB ? (
    <JobListPage config={config} />
  ) : (
    <LeadListPage config={config} />
  );
}
