"use client";

import { ResourceType } from "@/constants";
import {
  JobActivityLogPage,
  LeadActivityLogPage,
} from "@/features/activity-log";

import { useJobLeadRouteConfig } from "../hooks/useJobLeadRouteConfig";
import {
  type JobLeadRouteConfig,
  type JobRouteConfig,
  type LeadRouteConfig,
} from "../model/jobLeadRouteConfig";

export interface JobLeadLogsRoutePageProps {
  config?: JobLeadRouteConfig;
}

export function JobLeadLogsRoutePage({
  config: configProp,
}: JobLeadLogsRoutePageProps) {
  const config = useJobLeadRouteConfig(configProp);

  if (!config) {
    return null;
  }

  if (config.entity === ResourceType.JOB) {
    const jobConfig = config as JobRouteConfig;
    return (
      <JobActivityLogPage
        jobType={jobConfig.jobType}
        pathSegment={config.currentPathSegment}
        permissionCode={jobConfig.permissionCode}
      />
    );
  }

  const leadConfig = config as LeadRouteConfig;

  return (
    <LeadActivityLogPage
      leadType={leadConfig.leadType}
      pathSegment={config.currentPathSegment}
    />
  );
}
