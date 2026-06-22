"use client";

import { ComponentType } from "react";

import {
  useShowMoreCardActiveTab,
  useShowMoreCardScopeKey,
} from "@/features/job-lead/model/show-more-card-store";

import { TabName, TabRendererInputProps, TabRendererProps } from "../types";
import { EstimateTabWrapper } from "./EstimateTabWrapper";
import { FilesTab } from "./FilesTab";
import { FinancialTabWrapper } from "./FinancialTabWrapper";
import { MachineTab } from "./MachineTab";
import { ProductionTrackingTab } from "./ProductionTrackingTab";

// Job/Lead Details tab is rendered directly in ShowMoreCard to reduce prop drilling
const TAB_COMPONENT_MAP: Partial<
  Record<TabName, ComponentType<TabRendererProps>>
> = {
  "Production Tracking": ProductionTrackingTab,
  Files: FilesTab,
  Financial: FinancialTabWrapper,
  "Financial & Scheduling": FinancialTabWrapper,
  Scheduling: FinancialTabWrapper,
  Estimate: EstimateTabWrapper,
  Machine: MachineTab,
};

export function TabRenderer({
  activeTab: activeTabProp,
  entity,
  data = {},
  ui = {},
  permissions = {},
  computed = {},
  handlers = {},
}: TabRendererInputProps) {
  const scopeKey = useShowMoreCardScopeKey();
  const { activeTab: storedTab } = useShowMoreCardActiveTab(scopeKey);
  const activeTab = (storedTab ?? activeTabProp) as TabName;

  const TabComponent = TAB_COMPONENT_MAP[activeTab];

  if (!TabComponent) {
    return null;
  }

  const flatProps: TabRendererProps = {
    activeTab,
    ...entity,
    ...data,
    ...ui,
    ...permissions,
    ...computed,
    ...handlers,
  };

  return <TabComponent {...flatProps} />;
}
