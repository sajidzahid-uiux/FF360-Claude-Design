"use client";

import { TabRendererProps } from "../types";

export function MachineTab(props: TabRendererProps) {
  const { config, entityDataState, isDisabled } = props;

  if (!config.components.machineTab) {
    return null;
  }

  const MachineTabComponent = config.components.machineTab;

  return (
    <MachineTabComponent disabled={isDisabled} jobId={entityDataState.id} />
  );
}
