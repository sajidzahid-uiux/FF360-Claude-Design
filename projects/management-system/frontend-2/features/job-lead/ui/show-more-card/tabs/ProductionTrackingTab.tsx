"use client";

import { TabRendererProps } from "../types";

export function ProductionTrackingTab(props: TabRendererProps) {
  const {
    config,
    entityDataState,
    isDisabled,
    isTrashed,
    farmerEntity,
    schedulingSectionDisabled,
  } = props;

  if (!config.components.productionTracking) {
    return null;
  }

  const ProductionTracking = config.components.productionTracking;

  return (
    <ProductionTracking
      disabled={isDisabled}
      equipments={entityDataState.equipments || []}
      farmerJob={farmerEntity}
      isTrashed={isTrashed}
      jobId={entityDataState.id}
      jobType={config.jobType}
      schedulingDisabled={schedulingSectionDisabled ?? isDisabled}
    />
  );
}
