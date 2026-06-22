"use client";

import { useEffect, useMemo } from "react";

import { TabsSwitcher } from "@fieldflow360/org-ui";

import type { JobsPageTab } from "@/features/jobs";
import { BreadcrumbToolbarLayout } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-layout";
import { useSetCmsBreadcrumbToolbar } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-store";
import { BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-tabs";

export interface JobsListBreadcrumbToolbarProps {
  activeCount: number;
  archivedCount: number;
  onHoldCount: number;
  currentTab: JobsPageTab;
  onTabChange: (tab: JobsPageTab) => void;
}

export function JobsListBreadcrumbToolbar({
  activeCount,
  archivedCount,
  onHoldCount,
  currentTab,
  onTabChange,
}: JobsListBreadcrumbToolbarProps) {
  const { setBreadcrumbToolbar } = useSetCmsBreadcrumbToolbar();

  const tabs = useMemo(
    () =>
      [
        { value: "active" as const, label: `Active (${activeCount})` },
        { value: "on_hold" as const, label: `On Hold (${onHoldCount})` },
        { value: "archived" as const, label: `Archived (${archivedCount})` },
      ] as const,
    [activeCount, archivedCount, onHoldCount]
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
