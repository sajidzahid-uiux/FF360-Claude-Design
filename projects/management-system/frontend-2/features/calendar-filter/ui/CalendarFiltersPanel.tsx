"use client";

import { CALENDAR_FILTER_FIELDS } from "../model/config";
import type {
  CalendarDynamicFilterKey,
  CalendarDynamicFilterOptions,
  CalendarFilterKey,
  CalendarFiltersState,
} from "../model/types";
import { FilterField } from "./FilterField";

export interface CalendarFiltersPanelProps {
  filters: CalendarFiltersState;
  onFilterChange: (key: CalendarFilterKey, values: string[]) => void;
  dynamicOptions?: CalendarDynamicFilterOptions;
}

export function CalendarFiltersPanel({
  filters,
  onFilterChange,
  dynamicOptions,
}: CalendarFiltersPanelProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-text-primary text-[13px] font-semibold">
        Filter Schedules
      </h3>
      {CALENDAR_FILTER_FIELDS.map((config) => {
        const dynamic =
          dynamicOptions?.[config.key as CalendarDynamicFilterKey];
        const merged = dynamic ? { ...config, options: dynamic } : config;
        return (
          <FilterField
            key={config.key}
            config={merged}
            values={filters[config.key]}
            onValuesChange={(next) => onFilterChange(config.key, next)}
          />
        );
      })}
    </div>
  );
}
