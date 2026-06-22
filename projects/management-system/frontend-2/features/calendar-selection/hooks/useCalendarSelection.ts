"use client";

import { useCallback, useState } from "react";

import type { CalendarItem } from "@/entities/calendar-item";

export interface CalendarSelectionState {
  /** ID of the item whose details popover is open, or null when closed. */
  selectedItemId: number | null;
  /** Day whose overflow popover is open, or null when closed. */
  expandedDay: Date | null;
  /** Whether the missing-schedules modal is open. */
  missingModalOpen: boolean;
  /** Open the details popover for an item. */
  selectItem: (item: CalendarItem) => void;
  /** Open the details popover by id (used by grid surfaces that pass id only). */
  selectItemById: (id: number) => void;
  /** Close the details popover. */
  closeItem: () => void;
  /** Open the day-overflow popover for a date. */
  expandDay: (date: Date) => void;
  /** Close the day-overflow popover. */
  closeExpandedDay: () => void;
  /** Close the day-overflow popover and immediately open item details. */
  selectFromExpandedDay: (item: CalendarItem) => void;
  /** Open the missing-schedules modal. */
  openMissingModal: () => void;
  /** Close the missing-schedules modal. */
  closeMissingModal: () => void;
  /** Close the missing-schedules modal and immediately open item details. */
  selectFromMissingModal: (item: CalendarItem) => void;
}

/**
 * Manages the calendar's ephemeral selection state — the three transient
 * surfaces (item-details popover, day-overflow popover, missing-schedules
 * modal) and the inter-surface transitions between them.
 *
 * We track the selected item by *id* (not a snapshot) so the popover always
 * resolves against the latest item from `effectiveItems`. This means an edit
 * saved while the popover is open flows through without requiring a
 * close/reopen.
 */
export function useCalendarSelection(): CalendarSelectionState {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);
  const [missingModalOpen, setMissingModalOpen] = useState(false);

  const selectItem = useCallback(
    (item: CalendarItem) => setSelectedItemId(item.id),
    []
  );
  const selectItemById = useCallback((id: number) => setSelectedItemId(id), []);
  const closeItem = useCallback(() => setSelectedItemId(null), []);

  const expandDay = useCallback((date: Date) => setExpandedDay(date), []);
  const closeExpandedDay = useCallback(() => setExpandedDay(null), []);
  const selectFromExpandedDay = useCallback((item: CalendarItem) => {
    setExpandedDay(null);
    setSelectedItemId(item.id);
  }, []);

  const openMissingModal = useCallback(() => setMissingModalOpen(true), []);
  const closeMissingModal = useCallback(() => setMissingModalOpen(false), []);
  const selectFromMissingModal = useCallback((item: CalendarItem) => {
    setMissingModalOpen(false);
    setSelectedItemId(item.id);
  }, []);

  return {
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
    selectFromMissingModal,
  };
}
