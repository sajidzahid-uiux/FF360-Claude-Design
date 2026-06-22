"use client";

import { useMemo } from "react";

import type { TabsSwitcherItem } from "@fieldflow360/org-ui";

import { CmsTabsBreadcrumbToolbar } from "@/shared/ui/layout/cms-breadcrumb-toolbar/CmsTabsBreadcrumbToolbar";

export type SystemSettingsTab = "equipment" | "pin-categories";

const SETTINGS_TABS: TabsSwitcherItem<SystemSettingsTab>[] = [
  { value: "equipment", label: "Equipment maintenance" },
  { value: "pin-categories", label: "Pin categories" },
];

export interface SystemSettingsBreadcrumbToolbarProps {
  activeTab: SystemSettingsTab;
  onTabChange: (tab: SystemSettingsTab) => void;
}

export function SystemSettingsBreadcrumbToolbar({
  activeTab,
  onTabChange,
}: SystemSettingsBreadcrumbToolbarProps) {
  const primaryTabs = useMemo(() => [...SETTINGS_TABS], []);

  return (
    <CmsTabsBreadcrumbToolbar
      primaryTabs={primaryTabs}
      primaryValue={activeTab}
      onPrimaryChange={onTabChange}
    />
  );
}
