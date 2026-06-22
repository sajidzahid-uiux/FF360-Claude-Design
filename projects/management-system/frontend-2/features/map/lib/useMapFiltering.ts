import { useEffect, useRef, useState } from "react";

import type { MapDataParams } from "@/api/types";
import { US_STATES, coerceJobLeadTypeSegment } from "@/constants";
import { FilterState, FilterType } from "@/shared/ui/common";

interface UseMapFilteringProps {
  onClearNonFilterSearch?: () => void;
}

interface UseMapFilteringReturn {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  debouncedFilterParams: MapDataParams;
}

export const useMapFiltering = ({
  onClearNonFilterSearch,
}: UseMapFilteringProps): UseMapFilteringReturn => {
  const [filters, setFilters] = useState<FilterState>({});
  const [filterParams, setFilterParams] = useState<MapDataParams>({});
  const [debouncedFilterParams, setDebouncedFilterParams] =
    useState<MapDataParams>({});
  const onClearRef = useRef(onClearNonFilterSearch);
  onClearRef.current = onClearNonFilterSearch;

  useEffect(() => {
    const newParams: MapDataParams = {};

    const jobTypes = (filters[FilterType.JOB_TYPES] || []) as string[];
    const tilingJobStatuses = (filters[FilterType.TILING_JOB_STATUSES] ||
      []) as string[];
    const excavationJobStatuses = (filters[
      FilterType.EXCAVATION_JOB_STATUSES
    ] || []) as string[];
    const repairJobStatuses = (filters[FilterType.REPAIR_JOB_STATUSES] ||
      []) as string[];
    const leadTypes = (filters[FilterType.LEAD_TYPES] || []) as string[];
    const leadStatuses = (filters[FilterType.LEAD_STATUSES] || []) as string[];
    const leadSources = (filters[FilterType.LEAD_SOURCES] || []) as string[];
    const states = (filters[FilterType.STATES] || []) as string[];
    const projectTypes = (filters[FilterType.PROJECT_TYPES] || []) as string[];

    const transformedJobTypes = jobTypes.map((type) =>
      coerceJobLeadTypeSegment(type)
    );

    const transformedLeadTypes = leadTypes.map((type) =>
      coerceJobLeadTypeSegment(type)
    );

    if (transformedJobTypes.length > 0) {
      newParams.job_types = transformedJobTypes.join(",");
    }
    if (tilingJobStatuses.length > 0) {
      newParams.tiling_job_statuses = tilingJobStatuses.join(",");
    }
    if (excavationJobStatuses.length > 0) {
      newParams.excavation_job_statuses = excavationJobStatuses.join(",");
    }
    if (repairJobStatuses.length > 0) {
      newParams.repair_job_statuses = repairJobStatuses.join(",");
    }
    if (transformedLeadTypes.length > 0) {
      newParams.lead_types = transformedLeadTypes.join(",");
    }
    if (leadStatuses.length > 0) {
      newParams.lead_statuses = leadStatuses.join(",");
    }
    if (leadSources.length > 0) {
      newParams.lead_sources = leadSources.join(",");
    }
    if (states.length > 0) {
      const fullStateNames = states.map((abbrev) => {
        const state = US_STATES.find((s) => s.value === abbrev);
        return state ? state.label : abbrev;
      });
      newParams.states = fullStateNames.join(",");
    }
    if (projectTypes.length > 0) {
      newParams.project_types = projectTypes.join(",");
    }

    if (Object.keys(newParams).length === 0) {
      onClearRef.current?.();
    }

    setFilterParams((prev) =>
      JSON.stringify(prev) === JSON.stringify(newParams) ? prev : newParams
    );
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilterParams(filterParams);
    }, 300);

    return () => clearTimeout(timer);
  }, [filterParams]);

  return {
    filters,
    setFilters,
    debouncedFilterParams,
  };
};
