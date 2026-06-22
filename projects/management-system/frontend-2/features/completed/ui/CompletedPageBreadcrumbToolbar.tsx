"use client";

import { useMemo } from "react";

import type { TabsSwitcherItem } from "@fieldflow360/org-ui";

import type { CompletedPageTab } from "@/features/completed/model/completed-page-store";
import { CmsTabsBreadcrumbToolbar } from "@/shared/ui/layout/cms-breadcrumb-toolbar/CmsTabsBreadcrumbToolbar";

export interface CompletedPageBreadcrumbToolbarProps {
  activeCount: number;
  archivedCount: number;
  currentTab: CompletedPageTab;
  onTabChange: (tab: CompletedPageTab) => void;
}

export function CompletedPageBreadcrumbToolbar({
  activeCount,
  archivedCount,
  currentTab,
  onTabChange,
}: CompletedPageBreadcrumbToolbarProps) {
  const primaryTabs = useMemo((): TabsSwitcherItem<CompletedPageTab>[] => {
    return [
      { value: "active", label: `Active (${activeCount})` },
      { value: "archived", label: `Archived (${archivedCount})` },
    ];
  }, [activeCount, archivedCount]);

  return (
    <CmsTabsBreadcrumbToolbar
      primaryTabs={primaryTabs}
      primaryValue={currentTab}
      onPrimaryChange={onTabChange}
    />
  );
}
