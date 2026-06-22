"use client";

import { CmsTabsBreadcrumbToolbar } from "@/shared/ui/layout/cms-breadcrumb-toolbar/CmsTabsBreadcrumbToolbar";

import {
  STATUS_MANAGEMENT_TABS,
  type StatusManagementTab,
  tabUsesCategorySwitcher,
} from "../model/tabs";

export interface StatusManagementBreadcrumbToolbarProps {
  activeTab: StatusManagementTab;
  onTabChange: (tab: StatusManagementTab) => void;
  categoryItems?: { value: string; label: string }[];
  categoryTab?: string;
  onCategoryTabChange?: (value: string) => void;
}

export function StatusManagementBreadcrumbToolbar({
  activeTab,
  onTabChange,
  categoryItems,
  categoryTab,
  onCategoryTabChange,
}: StatusManagementBreadcrumbToolbarProps) {
  const showCategory =
    tabUsesCategorySwitcher(activeTab) &&
    categoryItems &&
    categoryTab !== undefined &&
    onCategoryTabChange;

  return (
    <CmsTabsBreadcrumbToolbar
      primaryTabs={STATUS_MANAGEMENT_TABS}
      primaryValue={activeTab}
      secondaryTabs={showCategory ? categoryItems : undefined}
      secondaryValue={showCategory ? categoryTab : undefined}
      onPrimaryChange={onTabChange}
      onSecondaryChange={showCategory ? onCategoryTabChange : undefined}
    />
  );
}
