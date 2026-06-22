export type CalendarFilterKey =
  | "kind"
  | "category"
  | "jobStatus"
  | "leadStatus"
  | "leadSource"
  | "projectType";

export type CalendarDynamicFilterKey =
  | "jobStatus"
  | "leadStatus"
  | "leadSource"
  | "projectType";

export interface CalendarFilterOption {
  value: string;
  label: string;
  group?: string;
}

/** Empty array = "all / no filter applied" for that key. */
export type CalendarFiltersState = Record<CalendarFilterKey, string[]>;

export type CalendarDynamicFilterOptions = Partial<
  Record<CalendarDynamicFilterKey, CalendarFilterOption[]>
>;

export interface CalendarFilterFieldConfig {
  key: CalendarFilterKey;
  /** Shown in the trigger when no values are selected. The first word renders dark, parens render muted. */
  placeholder: string;
  /** Short label used in the applied-filters chip group (e.g. "Status"). */
  chipLabel: string;
  options: CalendarFilterOption[];
}
