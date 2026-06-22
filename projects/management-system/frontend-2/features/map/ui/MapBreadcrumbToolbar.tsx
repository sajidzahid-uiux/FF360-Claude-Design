"use client";

import { useMemo } from "react";

import type { TabsSwitcherItem } from "@fieldflow360/org-ui";

import { MapViewTab } from "@/constants";
import { AssignedToFilterSelect } from "@/features/jobs";
import type { FilterState } from "@/shared/ui/common";
import { CmsTabsBreadcrumbToolbar } from "@/shared/ui/layout/cms-breadcrumb-toolbar/CmsTabsBreadcrumbToolbar";

import { MapFilters } from "./MapFilters";

export interface MapBreadcrumbToolbarProps {
  activeTab: MapViewTab;
  filters: FilterState;
  hasContactAccess: boolean;
  onFilterChange: (filters: FilterState) => void;
  onTabChange: (tab: MapViewTab) => void;
}

export function MapBreadcrumbToolbar({
  activeTab,
  filters,
  hasContactAccess,
  onFilterChange,
  onTabChange,
}: MapBreadcrumbToolbarProps) {
  const tabs = useMemo((): TabsSwitcherItem<MapViewTab>[] => {
    return [
      { value: MapViewTab.JOBS_LEADS, label: "Jobs & Leads" },
      ...(hasContactAccess
        ? [{ value: MapViewTab.CONTACTS, label: "Contacts" }]
        : []),
    ];
  }, [hasContactAccess]);

  const showJobFilters = activeTab === MapViewTab.JOBS_LEADS;

  return (
    <CmsTabsBreadcrumbToolbar
      actions={
        showJobFilters ? (
          <>
            <AssignedToFilterSelect compact />
            <MapFilters filters={filters} onFilterChange={onFilterChange} />
          </>
        ) : undefined
      }
      primaryTabs={tabs}
      primaryValue={activeTab}
      onPrimaryChange={onTabChange}
    />
  );
}
