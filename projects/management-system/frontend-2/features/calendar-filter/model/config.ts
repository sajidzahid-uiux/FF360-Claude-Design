import { ResourceType } from "@/constants";
import {
  CALENDAR_CATEGORY_LABELS,
  CALENDAR_ITEM_CATEGORIES,
} from "@/entities/calendar-item/model/calendarCategories";

import type {
  CalendarDynamicFilterKey,
  CalendarFilterFieldConfig,
  CalendarFilterKey,
  CalendarFiltersState,
} from "./types";

/** Canonical key order — drives URL serialization and applied-filter rendering. */
export const FILTER_KEYS: readonly CalendarFilterKey[] = [
  "kind",
  "category",
  "jobStatus",
  "leadStatus",
  "leadSource",
  "projectType",
] as const;

export const DYNAMIC_FILTER_KEYS: readonly CalendarDynamicFilterKey[] = [
  "jobStatus",
  "leadStatus",
  "leadSource",
  "projectType",
] as const;

/** Empty filter state — used as the initial value and the "clear all" target. */
export const DEFAULT_CALENDAR_FILTERS: CalendarFiltersState = {
  kind: [],
  category: [],
  jobStatus: [],
  leadStatus: [],
  leadSource: [],
  projectType: [],
};

/**
 * Filter field schema rendered by the filters popover and applied-filters bar.
 * Order here drives display order in both surfaces.
 */
export const CALENDAR_FILTER_FIELDS: CalendarFilterFieldConfig[] = [
  {
    key: "kind",
    placeholder: "All (Jobs/Leads)",
    chipLabel: "Kind",
    options: [
      { value: ResourceType.JOB, label: "Jobs" },
      { value: ResourceType.LEAD, label: "Leads" },
    ],
  },
  {
    key: "category",
    placeholder: "All (Repair/Excavation/Tile)",
    chipLabel: "Category",
    options: CALENDAR_ITEM_CATEGORIES.map((value) => ({
      value,
      label: CALENDAR_CATEGORY_LABELS[value],
    })),
  },
  {
    key: "jobStatus",
    placeholder: "Job Status",
    chipLabel: "Job Status",
    options: [],
  },
  {
    key: "leadStatus",
    placeholder: "Lead Status",
    chipLabel: "Lead Status",
    options: [],
  },
  {
    key: "leadSource",
    placeholder: "Lead Source",
    chipLabel: "Lead Source",
    options: [],
  },
  {
    key: "projectType",
    placeholder: "Project Type",
    chipLabel: "Project",
    options: [],
  },
];
