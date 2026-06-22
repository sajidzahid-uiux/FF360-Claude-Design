"use client";

import { useMemo, useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

import { FILE_SIZE_LIMITS } from "@/constants/units";
import {
  type FilterStateItem,
  type MachineFormData,
  defaultMachineFormData,
  machineFormValidation,
} from "@/features/equipment/lib/equipment-form-validation";
import { ALL_AVAILABLE_FILTERS } from "@/features/equipment/model/maintenance-filters";
import { FileInput } from "@/features/equipment/ui";
import type { FormSchema } from "@/features/forms/ui";
import { useTeamData } from "@/hooks";
import { SanitizedInput } from "@/shared/ui/primitives";
import { filterActiveTeamMembers } from "@/utils/team/assignmentOrder";

import FilterCard from "../FilterCard";

export { defaultMachineFormData, machineFormValidation };
export type { FilterStateItem, MachineFormData };

interface MachineFormContentProps {
  value: MachineFormData;
  onChange: (value: MachineFormData) => void;
}

function MachineFormContent({ value, onChange }: MachineFormContentProps) {
  const data = value || defaultMachineFormData;
  const [showAdditional, setShowAdditional] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { data: team, isLoading: teamLoading } = useTeamData();

  const handleFieldChange = <K extends keyof MachineFormData>(
    field: K,
    fieldValue: MachineFormData[K]
  ) => {
    onChange({ ...data, [field]: fieldValue });
  };

  const handleFilterChange = (
    filterName: string,
    filterValue: FilterStateItem
  ) => {
    onChange({
      ...data,
      filterState: {
        ...data.filterState,
        [filterName]: filterValue,
      },
    });
  };

  const generateMachineName = useMemo(() => {
    const parts: string[] = [];
    if (data.make.trim()) parts.push(data.make.trim().toUpperCase());
    if (data.year.trim()) parts.push(data.year.trim());
    if (data.model.trim()) parts.push(data.model.trim().toUpperCase());
    if (data.color.trim()) parts.push(data.color.trim().toUpperCase());
    if (parts.length === 0) return "";
    return parts.join("-");
  }, [data.make, data.year, data.model, data.color]);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Row 1: Make, Year, Model, Color */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="flex flex-col">
          <label className="mb-2 block text-base font-semibold">
            Make <span className="text-red-500">*</span>
          </label>
          <SanitizedInput
            className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
            maxLength={100}
            placeholder="e.g., Caterpillar"
            value={data.make}
            onChange={(e) => handleFieldChange("make", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-base font-semibold">Year</label>
          <SanitizedInput
            className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
            max={new Date().getFullYear() + 1}
            min={1900}
            placeholder="e.g., 2020"
            type="number"
            value={data.year}
            onChange={(e) => handleFieldChange("year", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-base font-semibold">Model</label>
          <SanitizedInput
            className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
            maxLength={100}
            placeholder="e.g., D150"
            value={data.model}
            onChange={(e) => handleFieldChange("model", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-base font-semibold">Color</label>
          <SanitizedInput
            className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
            maxLength={50}
            placeholder="e.g., Yellow"
            value={data.color}
            onChange={(e) => handleFieldChange("color", e.target.value)}
          />
        </div>
      </div>

      {/* Auto-generated Machine Name Preview */}
      <div className="mt-2">
        <div className="flex flex-col">
          <label className="text-text-muted mb-2 block text-base font-semibold">
            Auto-generated Name (Preview)
          </label>
          <SanitizedInput
            readOnly
            className="border-border-subtle bg-bg-surface text-text-muted w-full cursor-not-allowed rounded-lg border p-3 text-base"
            placeholder="Machine name will be auto-generated"
            type="text"
            value={generateMachineName || "Enter Make to see preview..."}
          />
          <p className="text-text-muted mt-1 text-xs">
            This name will be automatically generated from the fields above
          </p>
        </div>
      </div>

      {/* Machine Metrics Section */}
      <div className="mt-2">
        <h3 className="mb-2 text-lg font-semibold">Machine Metrics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              Current Hours <span className="text-red-500">*</span>
            </label>
            <SanitizedInput
              className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
              min={0}
              placeholder="Enter current hours"
              type="number"
              value={data.current_hours}
              onChange={(e) =>
                handleFieldChange("current_hours", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              Hourly Rate ($) <span className="text-red-500">*</span>
            </label>
            <SanitizedInput
              className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
              min={0}
              placeholder="$ Hourly rate"
              type="number"
              value={data.hour_rate}
              onChange={(e) => handleFieldChange("hour_rate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* User Assigned Section */}
      <div className="mt-2">
        <h3 className="mb-2 text-lg font-semibold">
          User Assigned <span className="text-red-500">*</span>
        </h3>
        <div className="flex flex-col">
          <select
            className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
            disabled={teamLoading}
            value={data.assigned_team_member}
            onChange={(e) =>
              handleFieldChange("assigned_team_member", e.target.value)
            }
          >
            <option value="">
              {teamLoading ? "Loading users..." : "Select User"}
            </option>
            {filterActiveTeamMembers(team).map((member) => {
              const user = member.user;
              const name = user.username;
              return (
                <option key={member.id} value={member.id}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Tracker Status */}
      <div className="mt-0 grid grid-cols-4 gap-4">
        <div className="col-span-2 flex flex-col">
          <label className="mb-2 block text-base font-semibold">
            Tracker Status
          </label>
          <div className="mt-2 flex gap-6">
            <label className="flex items-center gap-2 text-base">
              <SanitizedInput
                checked={data.tracker_status === "Y"}
                name="trackerStatus"
                type="radio"
                value="Y"
                onChange={() => handleFieldChange("tracker_status", "Y")}
              />
              Yes
            </label>
            <label className="flex items-center gap-2 text-base">
              <SanitizedInput
                checked={data.tracker_status === "N"}
                name="trackerStatus"
                type="radio"
                value="N"
                onChange={() => handleFieldChange("tracker_status", "N")}
              />
              No
            </label>
          </div>
        </div>
      </div>

      {/* Collapsible Additional Information */}
      <div className="-mx-8">
        <div className="border-border-subtle border-t" />
        <button
          className="hover:bg-bg-hover flex w-full items-center justify-between rounded px-8 py-4 text-base font-semibold transition"
          type="button"
          onClick={() => setShowAdditional((v) => !v)}
        >
          Additional Information
          {showAdditional ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>
      {showAdditional && (
        <div className="grid grid-cols-1 gap-8 pb-2 sm:grid-cols-2">
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              Serial Number
            </label>
            <SanitizedInput
              className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
              maxLength={50}
              placeholder="Enter serial number"
              value={data.serial_number}
              onChange={(e) =>
                handleFieldChange("serial_number", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              Serial Number Image
            </label>
            <FileInput
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > FILE_SIZE_LIMITS.IMAGE_MAX_SIZE_BYTES) {
                    return;
                  }
                  handleFieldChange("serial_number_image", file);
                }
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              Machine Image
            </label>
            <FileInput
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFieldChange("equipment_image", file);
              }}
            />
          </div>
        </div>
      )}

      {/* Collapsible Filters */}
      <div className="-mx-8">
        <div className="border-border-subtle border-t" />
        <button
          className="hover:bg-bg-hover flex w-full items-center justify-between rounded px-8 py-4 text-base font-semibold transition"
          type="button"
          onClick={() => setShowFilters((v) => !v)}
        >
          Filters
          {showFilters ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>
      {showFilters && (
        <div className="space-y-4">
          {ALL_AVAILABLE_FILTERS.some((filter) => {
            const v =
              data.filterState[filter.name] ||
              defaultMachineFormData.filterState[filter.name];
            const hasLast =
              v.last_changed !== "" && v.last_changed !== undefined;
            const hasThresh = v.threshold !== "" && v.threshold !== undefined;
            return hasLast !== hasThresh;
          }) && (
            <p className="text-feedback-error text-sm">
              Last changed and threshold must both be filled or both be left
              empty for each filter.
            </p>
          )}
          <div className="grid h-[600px] grid-cols-1 gap-4 overflow-y-auto pb-2 sm:h-auto sm:grid-cols-3">
            {ALL_AVAILABLE_FILTERS.map((filter) => {
              const filterValue =
                data.filterState[filter.name] ||
                defaultMachineFormData.filterState[filter.name];
              const hasLastChanged =
                filterValue.last_changed !== "" &&
                filterValue.last_changed !== undefined;
              const hasThreshold =
                filterValue.threshold !== "" &&
                filterValue.threshold !== undefined;
              const showFilterError = hasLastChanged !== hasThreshold;
              return (
                <FilterCard
                  key={filter.name}
                  currentHours={Number(data.current_hours)}
                  hasError={showFilterError}
                  name={filter.name}
                  title={filter.title}
                  value={filterValue}
                  onChange={(val) => handleFilterChange(filter.name, val)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function buildMachineFormSchema(isEditMode: boolean): FormSchema {
  return {
    id: "machine-form",
    sections: [
      {
        id: "machine-form-section",
        useCard: false,
        className: "space-y-2",
        fields: [
          {
            name: "machineForm",
            label: "",
            type: "custom",
            required: true,
            hideLabel: true,
            validation: machineFormValidation,
            customComponent: ({ value, onChange }) => (
              <MachineFormContent
                value={value as MachineFormData}
                onChange={onChange}
              />
            ),
          },
        ],
      },
    ],
    submitButton: {
      label: isEditMode ? "Save Changes" : "Add Machine",
      loadingLabel: isEditMode ? "Saving..." : "Adding...",
      show: true,
      className:
        "min-w-[140px] rounded-lg bg-black px-8 py-3 text-white hover:bg-black/90",
    },
    cancelButton: {
      label: "Cancel",
      show: true,
      className:
        "min-w-[140px] rounded-lg border-2 border-border-subtle bg-bg-app px-8 py-3 text-text-primary hover:bg-bg-hover",
    },
  };
}
