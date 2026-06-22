"use client";

import { JobType, ResourceType } from "@/constants";
import { PermissionCodeGate } from "@/shared/ui/permissions";

import { TabRendererProps } from "../types";

export function EstimateTabWrapper(props: TabRendererProps) {
  const {
    config,
    entityType,
    entityDataState,
    isDisabled,
    isFinancialEstimateDisabled,
    estimateData,
    permissionCode,
  } = props;

  if (!config.components.estimateTab) {
    return null;
  }

  const EstimateTab = config.components.estimateTab;
  const tabProps =
    entityType === ResourceType.JOB
      ? {
          job: entityDataState,
          jobType: config.jobType,
          disabled: isFinancialEstimateDisabled,
          ...(config.jobType === JobType.TILING && estimateData
            ? { estimate: estimateData }
            : estimateData
              ? { estimate: estimateData }
              : {}),
        }
      : {
          lead: entityDataState,
          leadType: config.jobType,
          disabled: isDisabled,
        };

  // Check if permission gate is required
  const requiresPermissionGate =
    entityType === ResourceType.JOB &&
    (config.jobType === JobType.EXCAVATION ||
      config.jobType === JobType.TILING) &&
    permissionCode;

  if (requiresPermissionGate) {
    return (
      <PermissionCodeGate fallback={null} permissionCode={permissionCode}>
        <div className="mt-8 flex flex-col gap-4">
          <EstimateTab {...tabProps} />
        </div>
      </PermissionCodeGate>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <EstimateTab {...tabProps} />
    </div>
  );
}
