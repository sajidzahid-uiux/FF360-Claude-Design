"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  TabsSwitcher,
  cn,
} from "@fieldflow360/org-ui";
import { Funnel } from "lucide-react";

import {
  CALENDAR_MODE_TABS,
  type CalendarTimelineMode,
  type CalendarTimelineScale,
  SCALE_TABS,
} from "@/features/calendar-view-switch";
import { useCalendarFilterOptions } from "@/hooks/queries";
import { BreadcrumbToolbarLayout } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-layout";
import { useSetCmsBreadcrumbToolbar } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-store";
import { BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-tabs";

import { buildDynamicFilterOptions } from "../lib/buildDynamicOptions";
import {
  CALENDAR_FILTER_FIELDS,
  DEFAULT_CALENDAR_FILTERS,
} from "../model/config";
import type { CalendarFilterKey, CalendarFiltersState } from "../model/types";
import { FiltersPopover } from "./FiltersPopover";

export interface CalendarBreadcrumbToolbarProps {
  filters: CalendarFiltersState;
  mode: CalendarTimelineMode;
  scale: CalendarTimelineScale;
  onFiltersChange: (filters: CalendarFiltersState) => void;
  onModeChange: (mode: CalendarTimelineMode) => void;
  onScaleChange: (scale: CalendarTimelineScale) => void;
}

const filterTriggerActiveClassName =
  "bg-accent/12 text-text-primary shadow-inner ring-1 ring-inset ring-accent/40 " +
  "dark:bg-accent/12 dark:ring-accent/45 " +
  "night:bg-accent/10 night:ring-accent/45";

export function CalendarBreadcrumbToolbar({
  filters,
  mode,
  scale,
  onFiltersChange,
  onModeChange,
  onScaleChange,
}: CalendarBreadcrumbToolbarProps) {
  const { setBreadcrumbToolbar } = useSetCmsBreadcrumbToolbar();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterOptions = useCalendarFilterOptions();
  const dynamicOptions = useMemo(
    () =>
      buildDynamicFilterOptions({
        jobStatuses: filterOptions.jobStatuses,
        leadStatuses: filterOptions.leadStatuses,
        leadSources: filterOptions.leadSources,
        projectTypes: filterOptions.projectTypes,
      }),
    [
      filterOptions.jobStatuses,
      filterOptions.leadStatuses,
      filterOptions.leadSources,
      filterOptions.projectTypes,
    ]
  );

  const activeFilters = filters ?? DEFAULT_CALENDAR_FILTERS;
  const filterKeys = CALENDAR_FILTER_FIELDS.map(
    (config) => config.key
  ) as CalendarFilterKey[];
  const hasActiveFilters = filterKeys.some(
    (key) => activeFilters[key].length > 0
  );

  const handleFilterChange = useCallback(
    (key: CalendarFilterKey, values: string[]) => {
      onFiltersChange({ ...activeFilters, [key]: values });
    },
    [activeFilters, onFiltersChange]
  );

  const toolbarNode = useMemo(
    () => (
      <BreadcrumbToolbarLayout
        actions={
          <>
            <TabsSwitcher
              items={CALENDAR_MODE_TABS}
              value={mode}
              onChange={onModeChange}
              {...BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS}
            />
            <TabsSwitcher
              items={SCALE_TABS}
              value={scale}
              onChange={onScaleChange}
            />
          </>
        }
        leading={
          <FiltersPopover
            dynamicOptions={dynamicOptions}
            filters={activeFilters}
            open={filtersOpen}
            trigger={
              <Button
                iconOnly
                aria-expanded={filtersOpen}
                aria-label={
                  hasActiveFilters
                    ? "Filter schedules, filter applied"
                    : "Filter schedules"
                }
                className={cn(
                  (filtersOpen || hasActiveFilters) &&
                    filterTriggerActiveClassName
                )}
                leftIcon={
                  <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
                    <Funnel className="h-4 w-4" strokeWidth={2.25} />
                    {hasActiveFilters ? (
                      <span
                        aria-hidden
                        className="bg-accent ring-bg-main dark:ring-bg-main night:ring-bg-app absolute -top-0.5 -right-0.5 size-2 rounded-full ring-2"
                      />
                    ) : null}
                  </span>
                }
                size={ComponentSizeEnum.SM}
                variant={ButtonVariantEnum.GHOST}
              />
            }
            onFilterChange={handleFilterChange}
            onOpenChange={setFiltersOpen}
          />
        }
      />
    ),
    [
      activeFilters,
      dynamicOptions,
      filtersOpen,
      handleFilterChange,
      hasActiveFilters,
      mode,
      onModeChange,
      onScaleChange,
      scale,
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
