"use client";

import { type ReactNode, useEffect, useMemo } from "react";

import { TabsSwitcher, type TabsSwitcherItem } from "@fieldflow360/org-ui";

import { BreadcrumbToolbarLayout } from "./breadcrumb-toolbar-layout";
import { useSetCmsBreadcrumbToolbar } from "./breadcrumb-toolbar-store";
import {
  BREADCRUMB_TOOLBAR_CATEGORY_TABS_SWITCHER_PROPS,
  BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS,
} from "./breadcrumb-toolbar-tabs";

export interface CmsTabsBreadcrumbToolbarProps<TPrimary extends string> {
  primaryTabs: readonly TabsSwitcherItem<TPrimary>[];
  primaryValue: TPrimary;
  onPrimaryChange: (value: TPrimary) => void;
  secondaryTabs?: readonly TabsSwitcherItem<string>[];
  secondaryValue?: string;
  onSecondaryChange?: (value: string) => void;
  actions?: ReactNode;
}

export function CmsTabsBreadcrumbToolbar<TPrimary extends string>({
  primaryTabs,
  primaryValue,
  onPrimaryChange,
  secondaryTabs,
  secondaryValue,
  onSecondaryChange,
  actions,
}: CmsTabsBreadcrumbToolbarProps<TPrimary>) {
  const { setBreadcrumbToolbar } = useSetCmsBreadcrumbToolbar();

  const showSecondary =
    secondaryTabs &&
    secondaryTabs.length > 0 &&
    secondaryValue !== undefined &&
    onSecondaryChange;

  const toolbarNode = useMemo(
    () => (
      <BreadcrumbToolbarLayout
        actions={
          showSecondary || actions ? (
            <>
              {showSecondary ? (
                <TabsSwitcher
                  items={[...secondaryTabs]}
                  value={secondaryValue}
                  onChange={onSecondaryChange}
                  {...BREADCRUMB_TOOLBAR_CATEGORY_TABS_SWITCHER_PROPS}
                />
              ) : null}
              {actions}
            </>
          ) : undefined
        }
        leading={
          <TabsSwitcher
            items={[...primaryTabs]}
            value={primaryValue}
            onChange={onPrimaryChange}
            {...BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS}
          />
        }
      />
    ),
    [
      actions,
      onPrimaryChange,
      onSecondaryChange,
      primaryTabs,
      primaryValue,
      secondaryTabs,
      secondaryValue,
      showSecondary,
    ]
  );

  useEffect(() => {
    setBreadcrumbToolbar(toolbarNode);
    return () => {
      setBreadcrumbToolbar(null);
    };
  }, [setBreadcrumbToolbar, toolbarNode]);

  return null;
}
