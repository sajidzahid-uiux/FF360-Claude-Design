"use client";

import { ComponentSizeEnum, Input, cn } from "@fieldflow360/org-ui";
import { Wrench } from "lucide-react";

import type { FilterStateItem } from "@/features/equipment/model/addEquipmentForm";
import type { EquipmentFilterDefinition } from "@/features/equipment/model/equipmentFilterDefinitions";
import { useUnitSystem } from "@/hooks";

export interface EquipmentFilterFieldsProps {
  definitions: EquipmentFilterDefinition[];
  filterState: Record<string, FilterStateItem>;
  fieldErrors: Record<string, string>;
  isVehicle?: boolean;
  currentUsage?: string;
  onFilterChange: (filterName: string, value: FilterStateItem) => void;
}

export function EquipmentFilterFields({
  definitions,
  filterState,
  fieldErrors,
  isVehicle = false,
  currentUsage,
  onFilterChange,
}: EquipmentFilterFieldsProps) {
  const unitSystem = useUnitSystem();
  const isMetric = unitSystem === "metric";
  const usageLabel = isVehicle ? (isMetric ? "Kilometers" : "Miles") : "Hours";
  const currentUsageNumber = currentUsage
    ? Number.parseFloat(currentUsage)
    : Number.NaN;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {definitions.map((filter) => {
        const value = filterState[filter.name];
        if (!value) return null;

        const errorKey = `filterState.${filter.name}`;
        const fieldError = fieldErrors[errorKey];
        const hasLastChanged =
          value.last_changed !== "" && value.last_changed !== undefined;
        const hasThreshold =
          value.threshold !== "" && value.threshold !== undefined;
        const isDue =
          !Number.isNaN(currentUsageNumber) &&
          hasLastChanged &&
          hasThreshold &&
          currentUsageNumber >=
            Number(value.last_changed) + Number(value.threshold);
        const isInvalidPair = hasLastChanged !== hasThreshold;

        return (
          <div
            key={filter.name}
            className={cn(
              "border-border-subtle bg-bg-app flex flex-col gap-2.5 rounded-lg border p-3",
              (fieldError || isInvalidPair) && "border-feedback-error",
              isDue &&
                !fieldError &&
                !isInvalidPair &&
                "border-feedback-error/80"
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <Wrench
                aria-hidden
                className="text-text-muted h-3.5 w-3.5 shrink-0"
              />
              <span className="text-text-primary truncate text-xs font-semibold">
                {filter.title}
              </span>
              {isDue ? (
                <span className="bg-feedback-error text-text-inverse ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                  Due
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                error={fieldError}
                label={`Last (${usageLabel})`}
                placeholder="Last"
                size={ComponentSizeEnum.SM}
                type="number"
                value={
                  value.last_changed === "" ? "" : String(value.last_changed)
                }
                onChange={(event) => {
                  const raw = event.target.value;
                  onFilterChange(filter.name, {
                    ...value,
                    last_changed: raw === "" ? "" : Number(raw),
                  });
                }}
              />
              <Input
                label="Threshold"
                placeholder="Limit"
                size={ComponentSizeEnum.SM}
                type="number"
                value={value.threshold === "" ? "" : String(value.threshold)}
                onChange={(event) => {
                  const raw = event.target.value;
                  onFilterChange(filter.name, {
                    ...value,
                    threshold: raw === "" ? "" : Number(raw),
                  });
                }}
              />
              <Input
                label="Filter #"
                placeholder="Optional"
                size={ComponentSizeEnum.SM}
                value={value.filter_number}
                onChange={(event) => {
                  onFilterChange(filter.name, {
                    ...value,
                    filter_number: event.target.value,
                  });
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
