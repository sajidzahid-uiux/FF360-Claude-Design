"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ComponentSizeEnum,
  TabsSwitcher,
  type TabsSwitcherItem,
} from "@fieldflow360/org-ui";

import type { AcreageTabsPayload } from "@/api/types/dashboard";

import {
  type AcreageTabId,
  defaultAcreageTabId,
} from "../../model/acreageTabs";
import { legendForAcreageTab } from "../../utils/legendForAcreageTab";
import { LegendRadialChart } from "./LegendRadialChart";

export interface DashboardAcreageTabsChartProps {
  acreageTabs: AcreageTabsPayload;
  className?: string;
}

export function DashboardAcreageTabsChart({
  acreageTabs,
  className,
}: DashboardAcreageTabsChartProps) {
  const { farm_acres, leads_jobs_acres } = acreageTabs;
  const [activeTab, setActiveTab] = useState<AcreageTabId>(() =>
    defaultAcreageTabId(acreageTabs.default_tab)
  );

  useEffect(() => {
    setActiveTab(defaultAcreageTabId(acreageTabs.default_tab));
  }, [acreageTabs]);

  const tabs = useMemo((): TabsSwitcherItem<AcreageTabId>[] => {
    return [
      { value: "farm_acres", label: farm_acres.label },
      { value: "leads_jobs_acres", label: leads_jobs_acres.label },
    ];
  }, [farm_acres.label, leads_jobs_acres.label]);

  const current = activeTab === "farm_acres" ? farm_acres : leads_jobs_acres;
  const legend = legendForAcreageTab(current, activeTab);

  return (
    <LegendRadialChart
      className={className}
      headerAfterTitle={
        <TabsSwitcher
          items={tabs}
          size={ComponentSizeEnum.SM}
          value={activeTab}
          onChange={setActiveTab}
        />
      }
      legend={legend}
      title="Acreage"
    />
  );
}
