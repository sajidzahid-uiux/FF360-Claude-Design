"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { TabsSwitcher } from "@fieldflow360/org-ui";
import { getDaysInMonth } from "date-fns";

import type { SchedulingItemPatchPayload } from "@/api/types";
import {
  type CalendarItem,
  getEntityRoute,
  itemContainsDay,
  itemOverlapsMonth,
  itemOverlapsWeek,
} from "@/entities/calendar-item";
import {
  AppliedFiltersBar,
  CalendarBreadcrumbToolbar,
  type CalendarFilterKey,
  DEFAULT_CALENDAR_FILTERS,
  buildDynamicFilterOptions,
} from "@/features/calendar-filter";
import {
  type CalendarSchedulePayload,
  MissingSchedulesModal,
} from "@/features/calendar-schedule-edit";
import {
  DayItemsPopover,
  ItemDetailsPopover,
  useCalendarSelection,
} from "@/features/calendar-selection";
import {
  CALENDAR_MODE_TABS,
  SCALE_TABS,
  useCalendarUrlState,
} from "@/features/calendar-view-switch";
import { useUpdateScheduleItemMutation } from "@/hooks/mutations";
import { useCalendarEntityPermissions } from "@/hooks/permissions";
import {
  useCalendarFilterOptions,
  useCalendarItems,
  useCalendarStatistics,
  useCalendarUnscheduledRecords,
} from "@/hooks/queries";
import { useRouteIds } from "@/hooks/useRouteIds";
import { BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-tabs";

import { CalendarHeader } from "./CalendarHeader";
import { MobileTimelineList } from "./MobileTimelineList";
import { MonthGrid } from "./MonthGrid";
import { MonthStepper } from "./MonthStepper";
import { MonthlyTimeline } from "./MonthlyTimeline";
import { StatsRow } from "./StatsRow";
import { WeekGrid } from "./WeekGrid";
import { WeeklyTimeline } from "./WeeklyTimeline";
import {
  MobileTimelineSkeleton,
  MonthGridSkeleton,
  StatsRowSkeleton,
  TimelineSkeleton,
  WeekGridSkeleton,
} from "./skeletons";

export function CalendarBoard() {
  const router = useRouter();
  const { orgId } = useRouteIds();
  const {
    mode,
    scale,
    activeDate,
    filters,
    rangeLabel,
    isCurrentRange,
    setMode,
    setScale,
    setFilters,
    prevRange,
    nextRange,
    jumpToCurrent,
  } = useCalendarUrlState();

  const { items: effectiveItems, isPending: isItemsPending } = useCalendarItems(
    {
      scale,
      activeDate,
      filters,
    }
  );
  const { counts: monthStats, isPending: isStatsPending } =
    useCalendarStatistics();
  const { filterViewableItems, canEditScheduleForItem } =
    useCalendarEntityPermissions();
  const updateSchedule = useUpdateScheduleItemMutation();

  const {
    selectedItemId,
    expandedDay,
    missingModalOpen,
    selectItem,
    selectItemById,
    closeItem,
    expandDay,
    closeExpandedDay,
    selectFromExpandedDay,
    openMissingModal,
    closeMissingModal,
  } = useCalendarSelection();

  // Eager-fetch unscheduled items for the modal; list is filtered for RBAC on
  // the client. Stats (badge + legend) come from the org statistics API
  // (expected to respect user permissions server-side).
  const { items: missingItems } = useCalendarUnscheduledRecords();

  const permissionScopedItems = useMemo(
    () => filterViewableItems(effectiveItems),
    [effectiveItems, filterViewableItems]
  );

  const viewableMissingItems = useMemo(
    () => filterViewableItems(missingItems),
    [filterViewableItems, missingItems]
  );

  // Server already returns date-range-filtered items, but the same predicate
  // also handles edge timezone cases and items just outside the window.
  const visibleItems = useMemo(
    () =>
      permissionScopedItems.filter((i) =>
        scale === "week"
          ? itemOverlapsWeek(i, activeDate)
          : itemOverlapsMonth(i, activeDate)
      ),
    [permissionScopedItems, activeDate, scale]
  );

  // Only show body skeletons on the first load. After that, react-query's
  // `placeholderData: (prev) => prev` keeps showing the previous range while
  // the next one is in flight, so we don't want to blank the UI.
  const showItemsSkeleton = isItemsPending && effectiveItems.length === 0;

  const saveSchedule = useCallback(
    (item: CalendarItem, payload: CalendarSchedulePayload) => {
      if (!canEditScheduleForItem(item)) return;
      // Only include `extra_days` when the form actually produced a value —
      // sending `0` on a dates-only edit would clobber the server-side value.
      const patch: SchedulingItemPatchPayload = {
        start_date: payload.startDate,
        end_date: payload.endDate,
      };
      if (payload.extraDays !== undefined) {
        patch.extra_days = payload.extraDays;
      }
      updateSchedule.mutate({
        itemId: item.id,
        entityType: item.kind,
        payload: patch,
      });
    },
    [canEditScheduleForItem, updateSchedule]
  );

  const viewEntity = useCallback(
    (item: CalendarItem) => {
      if (!orgId) return;
      router.push(getEntityRoute(item, orgId));
    },
    [orgId, router]
  );

  // Resolve selected item from permission-scoped data so edits stay consistent.
  const selectedItem = useMemo<CalendarItem | null>(() => {
    if (selectedItemId === null) return null;
    return permissionScopedItems.find((i) => i.id === selectedItemId) ?? null;
  }, [permissionScopedItems, selectedItemId]);

  const expandedDayItems = useMemo(() => {
    if (!expandedDay) return [];
    return permissionScopedItems.filter((i) => itemContainsDay(i, expandedDay));
  }, [expandedDay, permissionScopedItems]);

  const filterOptions = useCalendarFilterOptions();
  const dynamicFilterOptions = useMemo(
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

  const handleClearFilter = useCallback(
    (key: CalendarFilterKey) => {
      setFilters({ ...activeFilters, [key]: [] });
    },
    [activeFilters, setFilters]
  );

  return (
    <div className="bg-bg-app flex min-h-[calc(100vh-4rem)] flex-col md:h-[calc(100vh-125px)] md:min-h-0">
      <CalendarBreadcrumbToolbar
        filters={activeFilters}
        mode={mode}
        scale={scale}
        onFiltersChange={setFilters}
        onModeChange={setMode}
        onScaleChange={setScale}
      />
      <CalendarHeader
        notificationCount={monthStats.missingSchedules}
        onMobileNotifyClick={openMissingModal}
      />
      <AppliedFiltersBar
        dynamicOptions={dynamicFilterOptions}
        filters={activeFilters}
        onClearFilter={handleClearFilter}
      />
      <MonthStepper
        currentLabel={scale === "week" ? "This Week" : "This Month"}
        isCurrentMonth={isCurrentRange}
        label={rangeLabel}
        unitLabel={scale === "week" ? "week" : "month"}
        onJumpToCurrent={jumpToCurrent}
        onNext={nextRange}
        onPrev={prevRange}
      />
      <div className="bg-bg-app flex items-center justify-between gap-2 px-4 pb-2 md:hidden">
        <TabsSwitcher
          items={CALENDAR_MODE_TABS}
          value={mode}
          onChange={setMode}
          {...BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS}
        />
        <TabsSwitcher
          items={SCALE_TABS}
          value={scale}
          onChange={setScale}
          {...BREADCRUMB_TOOLBAR_TABS_SWITCHER_PROPS}
        />
      </div>
      {isStatsPending ? (
        <StatsRowSkeleton />
      ) : (
        <StatsRow counts={monthStats} onAddMissingSchedule={openMissingModal} />
      )}
      {/* Show skeletons only on first load (no prior data). After that,
          `placeholderData: (prev) => prev` keeps showing previous items so
          the UI doesn't blank during filter/range changes. */}
      {showItemsSkeleton ? (
        <>
          {mode === "timeline" ? (
            <div className="md:hidden">
              <MobileTimelineSkeleton />
            </div>
          ) : null}
          <div
            className={
              mode === "timeline"
                ? "hidden md:flex md:min-h-0 md:flex-1 md:flex-col"
                : "flex flex-col md:min-h-0 md:flex-1"
            }
          >
            {mode === "timeline" ? (
              <TimelineSkeleton
                daysCount={scale === "week" ? 7 : getDaysInMonth(activeDate)}
              />
            ) : scale === "week" ? (
              <WeekGridSkeleton />
            ) : (
              <MonthGridSkeleton />
            )}
          </div>
        </>
      ) : (
        <>
          {/* Mobile timeline list — replaces the side-by-side grid timeline on
              phones with a vertically-stacked card list per Figma 43:8358. */}
          {mode === "timeline" ? (
            <div className="md:hidden">
              <MobileTimelineList
                activeMonth={activeDate}
                items={visibleItems}
                scale={scale}
                weekStart={activeDate}
                onItemClick={selectItem}
              />
            </div>
          ) : null}
          <div
            className={
              mode === "timeline"
                ? "hidden md:flex md:min-h-0 md:flex-1 md:flex-col"
                : "flex flex-col md:min-h-0 md:flex-1"
            }
          >
            {mode === "timeline" ? (
              scale === "week" ? (
                <WeeklyTimeline
                  items={visibleItems}
                  weekStart={activeDate}
                  onItemClick={selectItem}
                />
              ) : (
                <MonthlyTimeline
                  activeMonth={activeDate}
                  items={visibleItems}
                  onItemClick={selectItem}
                />
              )
            ) : scale === "week" ? (
              <WeekGrid
                items={visibleItems}
                weekStart={activeDate}
                onItemClick={selectItemById}
                onMoreClick={expandDay}
              />
            ) : (
              <MonthGrid
                activeMonth={activeDate}
                items={visibleItems}
                onItemClick={selectItemById}
                onMoreClick={expandDay}
              />
            )}
          </div>
        </>
      )}
      {selectedItem ? (
        <ItemDetailsPopover
          allowScheduleEdit={canEditScheduleForItem(selectedItem)}
          item={selectedItem}
          onClose={closeItem}
          onSaveSchedule={saveSchedule}
          onView={viewEntity}
        />
      ) : null}
      {expandedDay ? (
        <DayItemsPopover
          date={expandedDay}
          items={expandedDayItems}
          onClose={closeExpandedDay}
          onItemClick={selectFromExpandedDay}
        />
      ) : null}
      {missingModalOpen ? (
        <MissingSchedulesModal
          canEditSchedule={canEditScheduleForItem}
          items={viewableMissingItems}
          onClose={closeMissingModal}
          onSaveSchedule={saveSchedule}
          onViewDetails={viewEntity}
        />
      ) : null}
    </div>
  );
}
