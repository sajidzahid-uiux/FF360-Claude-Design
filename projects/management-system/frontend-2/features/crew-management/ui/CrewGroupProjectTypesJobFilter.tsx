"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  SearchableDropdown,
  type SearchableDropdownOption,
  Toggle,
} from "@fieldflow360/org-ui";

import type { ProjectType, ProjectTypeCategory } from "@/api/types";
import { JobOrLeadType } from "@/constants";
import { groupProjectTypesByCategory } from "@/shared/lib";

const JOB_TYPE_ORDER: ProjectTypeCategory[] = [
  JobOrLeadType.REPAIR,
  JobOrLeadType.EXCAVATION,
  JobOrLeadType.TILING,
];

const JOB_TYPE_TOGGLE_LABELS: Record<ProjectTypeCategory, string> = {
  [JobOrLeadType.REPAIR]: "Repair",
  [JobOrLeadType.EXCAVATION]: "Excavation",
  [JobOrLeadType.TILING]: "Tiling",
};

interface CrewGroupProjectTypesJobFilterProps {
  projectTypes: ProjectType[];
  selectedProjectTypeIds: number[];
  onBulkDeselectIds: (projectTypeIds: number[]) => void;
  onSetProjectTypeIds: (ids: number[]) => void;
  toggleSyncKey: number;
  sectionLabel?: string;
  dropdownPlaceholder?: string;
}

function CategoryProjectTypeDropdown({
  enabled,
  projectTypesInCategory,
  selectedProjectTypeIds,
  onSetProjectTypeIds,
  placeholder,
}: {
  enabled: boolean;
  projectTypesInCategory: ProjectType[];
  selectedProjectTypeIds: number[];
  onSetProjectTypeIds: (ids: number[]) => void;
  placeholder: string;
}) {
  const options = useMemo(
    (): SearchableDropdownOption<string>[] =>
      projectTypesInCategory.map((pt) => ({
        value: String(pt.id),
        label: pt.name,
      })),
    [projectTypesInCategory]
  );

  const selectedValues = useMemo(
    () =>
      projectTypesInCategory
        .filter((pt) => selectedProjectTypeIds.includes(pt.id))
        .map((pt) => String(pt.id)),
    [projectTypesInCategory, selectedProjectTypeIds]
  );

  const handleValuesChange = useCallback(
    (nextValues: string[]) => {
      const nextIds = new Set(selectedProjectTypeIds);
      const categoryIds = new Set(projectTypesInCategory.map((pt) => pt.id));
      for (const id of categoryIds) {
        nextIds.delete(id);
      }
      for (const value of nextValues) {
        nextIds.add(Number(value));
      }
      onSetProjectTypeIds(Array.from(nextIds));
    },
    [onSetProjectTypeIds, projectTypesInCategory, selectedProjectTypeIds]
  );

  const triggerLabel =
    selectedValues.length > 0
      ? `${selectedValues.length} selected`
      : placeholder;

  return (
    <SearchableDropdown
      multiple
      disabled={!enabled}
      emptyStateText="No project types in this category."
      options={options}
      placeholder={placeholder}
      searchPlaceholder="Search project types..."
      trigger={
        <button
          className="border-border-subtle text-text-primary hover:bg-bg-surface flex h-10 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!enabled}
          type="button"
        >
          <span
            className={
              selectedValues.length > 0
                ? "text-text-primary"
                : "text-text-muted"
            }
          >
            {triggerLabel}
          </span>
        </button>
      }
      values={selectedValues}
      onValuesChange={handleValuesChange}
    />
  );
}

export function CrewGroupProjectTypesJobFilter({
  projectTypes,
  selectedProjectTypeIds,
  onBulkDeselectIds,
  onSetProjectTypeIds,
  toggleSyncKey,
  sectionLabel = "Job types",
  dropdownPlaceholder = "Select project types",
}: CrewGroupProjectTypesJobFilterProps) {
  const [jobTypeToggles, setJobTypeToggles] = useState<
    Record<ProjectTypeCategory, boolean>
  >({
    [JobOrLeadType.REPAIR]: false,
    [JobOrLeadType.EXCAVATION]: false,
    [JobOrLeadType.TILING]: false,
  });

  const jobTypeTogglesRef = useRef(jobTypeToggles);
  useEffect(() => {
    jobTypeTogglesRef.current = jobTypeToggles;
  }, [jobTypeToggles]);

  const projectTypesByCategory = useMemo(
    () => groupProjectTypesByCategory(projectTypes),
    [projectTypes]
  );

  const lastSyncedToggleKeyRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (lastSyncedToggleKeyRef.current === toggleSyncKey) return;
    lastSyncedToggleKeyRef.current = toggleSyncKey;
    const next = {
      [JobOrLeadType.REPAIR]: projectTypesByCategory[JobOrLeadType.REPAIR].some(
        (pt) => selectedProjectTypeIds.includes(pt.id)
      ),
      [JobOrLeadType.EXCAVATION]: projectTypesByCategory[
        JobOrLeadType.EXCAVATION
      ].some((pt) => selectedProjectTypeIds.includes(pt.id)),
      [JobOrLeadType.TILING]: projectTypesByCategory[JobOrLeadType.TILING].some(
        (pt) => selectedProjectTypeIds.includes(pt.id)
      ),
    };
    jobTypeTogglesRef.current = next;
    setJobTypeToggles(next);
  }, [projectTypesByCategory, selectedProjectTypeIds, toggleSyncKey]);

  const toggleJobType = useCallback(
    (cat: ProjectTypeCategory) => {
      const wasOn = jobTypeTogglesRef.current[cat];
      if (wasOn) {
        const ids = projectTypesByCategory[cat].map((pt) => pt.id);
        if (ids.length) onBulkDeselectIds(ids);
      }
      jobTypeTogglesRef.current = {
        ...jobTypeTogglesRef.current,
        [cat]: !wasOn,
      };
      setJobTypeToggles((prev) => ({ ...prev, [cat]: !prev[cat] }));
    },
    [onBulkDeselectIds, projectTypesByCategory]
  );

  if (!projectTypes.length) return null;

  return (
    <div className="space-y-2.5">
      <p className="text-text-primary text-sm font-medium">{sectionLabel}</p>
      <div className="flex flex-col gap-3">
        {JOB_TYPE_ORDER.map((cat) => {
          const types = projectTypesByCategory[cat];
          const enabled = jobTypeToggles[cat];
          const placeholder =
            types.length === 0
              ? `No ${JOB_TYPE_TOGGLE_LABELS[cat].toLowerCase()} types`
              : `${dropdownPlaceholder} (${JOB_TYPE_TOGGLE_LABELS[cat]})`;
          const switchId = `crew-group-job-type-${cat}`;

          return (
            <div
              key={cat}
              className="border-border-subtle/60 flex flex-col gap-2 rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                <Toggle
                  checked={enabled}
                  id={switchId}
                  label={JOB_TYPE_TOGGLE_LABELS[cat]}
                  onChange={() => toggleJobType(cat)}
                />
              </div>
              <CategoryProjectTypeDropdown
                enabled={enabled && types.length > 0}
                placeholder={placeholder}
                projectTypesInCategory={types}
                selectedProjectTypeIds={selectedProjectTypeIds}
                onSetProjectTypeIds={onSetProjectTypeIds}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
