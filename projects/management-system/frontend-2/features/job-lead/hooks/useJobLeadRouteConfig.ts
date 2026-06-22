"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

import {
  type JobLeadRouteConfig,
  getJobLeadRouteConfig,
  isJobLeadEntityType,
  isJobLeadTypeRouteSegment,
} from "../model/jobLeadRouteConfig";

export function useJobLeadRouteConfig(
  configProp?: JobLeadRouteConfig
): JobLeadRouteConfig | null {
  const params = useParams();
  const entityType = params.entityType;
  const jobLeadType = params.jobLeadType;

  return useMemo(() => {
    if (configProp) {
      return configProp;
    }

    if (
      typeof entityType !== "string" ||
      typeof jobLeadType !== "string" ||
      !isJobLeadEntityType(entityType) ||
      !isJobLeadTypeRouteSegment(jobLeadType)
    ) {
      return null;
    }

    return getJobLeadRouteConfig(entityType, jobLeadType) ?? null;
  }, [configProp, entityType, jobLeadType]);
}
