"use client";

import { useEffect, useMemo } from "react";

import { TabsSwitcher } from "@fieldflow360/org-ui";

import { BreadcrumbToolbarLayout } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-layout";
import { useSetCmsBreadcrumbToolbar } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-store";
import { BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-tabs";

export const CONTACT_PAGE_TABS = [
  { value: "Contacts", label: "Contacts" },
  { value: "Categories", label: "Categories" },
] as const;

export type ContactPageTab = (typeof CONTACT_PAGE_TABS)[number]["value"];

export interface ContactsBreadcrumbToolbarProps {
  currentTab: ContactPageTab;
  onTabChange: (tab: ContactPageTab) => void;
}

export function ContactsBreadcrumbToolbar({
  currentTab,
  onTabChange,
}: ContactsBreadcrumbToolbarProps) {
  const { setBreadcrumbToolbar } = useSetCmsBreadcrumbToolbar();

  const toolbarNode = useMemo(
    () => (
      <BreadcrumbToolbarLayout
        leading={
          <TabsSwitcher
            items={[...CONTACT_PAGE_TABS]}
            value={currentTab}
            onChange={onTabChange}
            {...BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS}
          />
        }
      />
    ),
    [currentTab, onTabChange]
  );

  useEffect(() => {
    setBreadcrumbToolbar(toolbarNode);
    return () => {
      setBreadcrumbToolbar(null);
    };
  }, [setBreadcrumbToolbar, toolbarNode]);

  return null;
}
