"use client";

import { useMemo } from "react";

import { TabsSwitcher, type TabsSwitcherItem } from "@fieldflow360/org-ui";

import { MapViewTab } from "@/constants";

interface MapTabsProps {
  activeTab: MapViewTab;
  onTabChange: (value: MapViewTab) => void;
  hasContactAccess: boolean;
}

export const MapTabs = ({
  activeTab,
  onTabChange,
  hasContactAccess,
}: MapTabsProps) => {
  const tabs = useMemo(
    (): TabsSwitcherItem<MapViewTab>[] => [
      { value: MapViewTab.JOBS_LEADS, label: "Jobs & Leads" },
      ...(hasContactAccess
        ? [{ value: MapViewTab.CONTACTS, label: "Contacts" }]
        : []),
    ],
    [hasContactAccess]
  );

  return (
    <TabsSwitcher
      className="shrink-0"
      items={tabs}
      value={activeTab}
      onChange={onTabChange}
    />
  );
};
