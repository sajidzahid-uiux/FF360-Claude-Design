"use client";

import { useMemo } from "react";

import type { LeadStatus, OrganizationJobStatus } from "@/api/types";
import { JobOrLeadType, JobType, LeadType } from "@/constants/enums";
import { US_STATES } from "@/constants/usStates";
import {
  useLeadStatuses,
  useLeadTypes,
  useOrganizationStatuses,
  useProjectTypesQuery,
} from "@/hooks/queries";
import {
  ColoredLabel,
  Filter,
  FilterState,
  FilterType,
  type MultiFilterConfig,
} from "@/shared/ui/common";

function renderColoredCheckboxRow(item: Record<string, unknown>) {
  return (
    <ColoredLabel
      color={String(item.color ?? "")}
      label={String(item.title ?? "")}
    />
  );
}

interface MapFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const MapFilters = ({ filters, onFilterChange }: MapFiltersProps) => {
  const { data: leadStatuses } = useLeadStatuses();
  const { data: leadSources } = useLeadTypes();
  const { data: jobStatuses } = useOrganizationStatuses({});
  const { data: projectTypes } = useProjectTypesQuery();

  const filterConfigs = useMemo(
    () => [
      {
        key: FilterType.JOB_TYPES,
        label: "Job Types",
        items: [
          { value: JobType.TILING, label: "Tiling Job" },
          { value: JobType.EXCAVATION, label: "Excavation Job" },
          { value: JobType.REPAIR, label: "Repair Job" },
        ],
        labelField: "label" as const,
        idField: "value" as const,
      },
      {
        key: FilterType.PROJECT_TYPES,
        label: "Project Types",
        items:
          projectTypes?.map((pt) => ({
            id: pt.id.toString(),
            title: pt.name,
            color: pt.color,
          })) || [],
        labelField: "title" as const,
        idField: "id" as const,
        renderItem: renderColoredCheckboxRow,
      },
      {
        key: FilterType.TILING_JOB_STATUSES,
        label: "Tiling Job Statuses",
        items:
          (jobStatuses as OrganizationJobStatus[] | undefined)
            ?.filter(
              (status) =>
                status.job_type === JobOrLeadType.TILING ||
                status.job_type === JobType.TILING
            )
            .map((status) => ({
              id: status.id.toString(),
              title: status.title,
              color: status.color,
            })) || [],
        labelField: "title" as const,
        idField: "id" as const,
        renderItem: renderColoredCheckboxRow,
      },
      {
        key: FilterType.EXCAVATION_JOB_STATUSES,
        label: "Excavation Job Statuses",
        items:
          (jobStatuses as OrganizationJobStatus[] | undefined)
            ?.filter(
              (status) =>
                status.job_type === JobOrLeadType.EXCAVATION ||
                status.job_type === JobType.EXCAVATION
            )
            .map((status) => ({
              id: status.id.toString(),
              title: status.title,
              color: status.color,
            })) || [],
        labelField: "title" as const,
        idField: "id" as const,
        renderItem: renderColoredCheckboxRow,
      },
      {
        key: FilterType.REPAIR_JOB_STATUSES,
        label: "Repair Job Statuses",
        items:
          (jobStatuses as OrganizationJobStatus[] | undefined)
            ?.filter(
              (status) =>
                status.job_type === JobOrLeadType.REPAIR ||
                status.job_type === JobType.REPAIR
            )
            .map((status) => ({
              id: status.id.toString(),
              title: status.title,
              color: status.color,
            })) || [],
        labelField: "title" as const,
        idField: "id" as const,
        renderItem: renderColoredCheckboxRow,
      },
      {
        key: FilterType.LEAD_TYPES,
        label: "Lead Types",
        items: [
          { value: LeadType.TILING, label: "Tiling Lead" },
          { value: LeadType.EXCAVATION, label: "Excavation Lead" },
          { value: LeadType.REPAIR, label: "Repair Lead" },
        ],
        labelField: "label" as const,
        idField: "value" as const,
      },
      {
        key: FilterType.LEAD_STATUSES,
        label: "Lead Statuses",
        items:
          (leadStatuses as LeadStatus[] | undefined)?.map((status) => ({
            id: status.id.toString(),
            title: status.title,
            color: status.color,
          })) || [],
        labelField: "title" as const,
        idField: "id" as const,
        renderItem: renderColoredCheckboxRow,
      },
      {
        key: FilterType.LEAD_SOURCES,
        label: "Lead Sources",
        items:
          (leadSources as LeadStatus[] | undefined)?.map((source) => ({
            id: source.id.toString(),
            title: source.title,
            color: source.color,
          })) || [],
        labelField: "title" as const,
        idField: "id" as const,
        renderItem: renderColoredCheckboxRow,
      },
      {
        key: FilterType.STATES,
        label: "States",
        items: US_STATES,
        labelField: "label" as const,
        idField: "value" as const,
      },
    ],
    [jobStatuses, leadStatuses, leadSources, projectTypes]
  );

  return (
    <Filter
      wrapInModal
      buttonLabel="Filters"
      configs={filterConfigs as MultiFilterConfig<Record<string, unknown>>[]}
      direction="vertical"
      filterState={filters}
      modalTitle="Map Filters"
      modalWidth="320px"
      showClearAll={true}
      onFilterChange={onFilterChange}
    />
  );
};
