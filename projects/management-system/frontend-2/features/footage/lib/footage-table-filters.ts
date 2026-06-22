import type {
  TableFilterDefinition,
  TableFilterValue,
} from "@fieldflow360/org-ui";

import type { CrewFilterOption } from "@/features/footage";
import { FilterState, FilterType } from "@/shared/ui/common";

/** Earliest year available in installed-footage period filters. */
export const FOOTAGE_FILTER_MIN_YEAR = 2024;

const MONTH_CHIP_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "Jan" },
  { value: "2", label: "Feb" },
  { value: "3", label: "Mar" },
  { value: "4", label: "Apr" },
  { value: "5", label: "May" },
  { value: "6", label: "Jun" },
  { value: "7", label: "Jul" },
  { value: "8", label: "Aug" },
  { value: "9", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

export function buildFootageMonthFilterOptions(): {
  value: string;
  label: string;
}[] {
  return MONTH_CHIP_OPTIONS;
}

export function buildFootageYearFilterOptions(): {
  value: string;
  label: string;
}[] {
  const currentYear = new Date().getFullYear();
  const span = currentYear - FOOTAGE_FILTER_MIN_YEAR + 1;

  return Array.from({ length: span }, (_, index) => {
    const year = String(currentYear - index);
    return { value: year, label: year };
  });
}

export function buildFootageTableFilterDefinitions(
  crewOptions: CrewFilterOption[]
): TableFilterDefinition[] {
  const definitions: TableFilterDefinition[] = [
    {
      id: FilterType.FOOTAGE_YEAR,
      label: `Year (${FOOTAGE_FILTER_MIN_YEAR}+)`,
      multiple: false,
      options: buildFootageYearFilterOptions(),
    },
    {
      id: FilterType.FOOTAGE_DATE,
      label: "Month",
      multiple: false,
      options: buildFootageMonthFilterOptions(),
    },
  ];

  if (crewOptions.length > 0) {
    definitions.push({
      id: FilterType.FOOTAGE_CREW,
      label: "Crew",
      multiple: true,
      options: crewOptions.map((opt) => ({
        value: opt.id,
        label: opt.label,
      })),
    });
  }

  return definitions;
}

export function footageFilterStateToTableValues(
  filters: FilterState
): TableFilterValue[] {
  const values: TableFilterValue[] = [];

  const year = filters[FilterType.FOOTAGE_YEAR];
  if (Array.isArray(year) && year.length > 0) {
    values.push({
      filterId: FilterType.FOOTAGE_YEAR,
      values: year.map(String),
    });
  }

  const month = filters[FilterType.FOOTAGE_DATE];
  if (Array.isArray(month) && month.length > 0) {
    values.push({
      filterId: FilterType.FOOTAGE_DATE,
      values: month.map(String),
    });
  }

  const crew = filters[FilterType.FOOTAGE_CREW];
  if (Array.isArray(crew) && crew.length > 0) {
    values.push({
      filterId: FilterType.FOOTAGE_CREW,
      values: crew.map(String),
    });
  }

  return values;
}

export function mergeFootageTableFilterValues(
  current: FilterState,
  filterValues: TableFilterValue[]
): FilterState {
  const readValues = (filterId: string): string[] =>
    filterValues.find((entry) => entry.filterId === filterId)?.values ?? [];

  const yearValues = readValues(FilterType.FOOTAGE_YEAR);
  const monthValues = readValues(FilterType.FOOTAGE_DATE);
  const crewValues = readValues(FilterType.FOOTAGE_CREW);

  const next: FilterState = { ...current };

  if (yearValues.length > 0) {
    next[FilterType.FOOTAGE_YEAR] = yearValues;
  } else {
    delete next[FilterType.FOOTAGE_YEAR];
  }

  if (monthValues.length > 0) {
    next[FilterType.FOOTAGE_DATE] = monthValues;
  } else {
    delete next[FilterType.FOOTAGE_DATE];
  }

  delete next[FilterType.FOOTAGE_PERIOD_TYPE];

  if (crewValues.length > 0) {
    next[FilterType.FOOTAGE_CREW] = crewValues;
  } else {
    delete next[FilterType.FOOTAGE_CREW];
  }

  return next;
}
