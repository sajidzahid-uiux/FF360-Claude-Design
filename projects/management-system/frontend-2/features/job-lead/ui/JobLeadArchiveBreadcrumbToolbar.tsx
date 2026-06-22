"use client";

import { useEffect, useMemo } from "react";

import { TabsSwitcher } from "@fieldflow360/org-ui";

import type { JobLeadArchiveTab } from "@/constants";
import { BreadcrumbToolbarLayout } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-layout";
import { useSetCmsBreadcrumbToolbar } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-store";
import { BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-tabs";

export interface JobLeadArchiveBreadcrumbToolbarProps {
  activeCount: number;
  archivedCount: number;
  currentTab: JobLeadArchiveTab;
  onTabChange: (tab: JobLeadArchiveTab) => void;
}

export function JobLeadArchiveBreadcrumbToolbar({
  activeCount,
  archivedCount,
  currentTab,
  onTabChange,
}: JobLeadArchiveBreadcrumbToolbarProps) {
  const { setBreadcrumbToolbar } = useSetCmsBreadcrumbToolbar();

  const tabs = useMemo(
    () =>
      [
        { value: "active" as const, label: `Active (${activeCount})` },
        { value: "archived" as const, label: `Archived (${archivedCount})` },
      ] as const,
    [activeCount, archivedCount]
  );

  const toolbarNode = useMemo(
    () => (
      <BreadcrumbToolbarLayout
        leading={
          <TabsSwitcher
            items={[...tabs]}
            value={currentTab}
            onChange={onTabChange}
            {...BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS}
          />
        }
      />
    ),
    [currentTab, onTabChange, tabs]
  );

  useEffect(() => {
    setBreadcrumbToolbar(toolbarNode);
    return () => {
      setBreadcrumbToolbar(null);
    };
  }, [setBreadcrumbToolbar, toolbarNode]);

  return null;
}
