"use client";

import { JobType, ResourceType } from "@/constants";
import { PermissionCodeGate } from "@/shared/ui/permissions";

import { TabRendererProps } from "../types";

export function FinancialTabWrapper(props: TabRendererProps) {
  const {
    config,
    entityType,
    entityDataState,
    isDisabled,
    isFinancialEstimateDisabled,
    permissionCode,
  } = props;

  if (!config.components.financialTab) {
    return null;
  }

  const FinancialTab = config.components.financialTab;
  const tabProps =
    entityType === ResourceType.JOB
      ? {
          jobId: entityDataState.id,
          jobEquipments: entityDataState.equipments || [],
          salesPriceFromLead: entityDataState.sales_price,
          disabled: isFinancialEstimateDisabled,
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
          <FinancialTab {...tabProps} />
        </div>
      </PermissionCodeGate>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <FinancialTab {...tabProps} />
    </div>
  );
}
