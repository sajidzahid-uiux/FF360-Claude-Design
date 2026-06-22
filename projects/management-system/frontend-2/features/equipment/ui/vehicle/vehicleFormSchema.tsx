"use client";

import { useMemo, useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";
import { z } from "zod";

import { FILE_SIZE_LIMITS } from "@/constants";
import { FileInput } from "@/features/equipment/ui";
import type { FormSchema } from "@/features/forms/ui";
import { useTeamData, useUnitSystem } from "@/hooks";
import { SanitizedInput } from "@/shared/ui/primitives";
import { filterActiveTeamMembers } from "@/utils/team/assignmentOrder";

import FilterCard from "../FilterCard";

const filterList = [
  { name: "fuel_filter", title: "Fuel Filter" },
  { name: "air_filter", title: "Air Filter" },
  { name: "oil_filter", title: "Oil & Filter" },
  { name: "hydraulic_filter", title: "Hydraulic Filter" },
];

const nullableImageField = z.union([z.instanceof(File), z.string()]).nullable();

const filterStateSchema = z.object({
  last_changed: z.union([z.number(), z.literal("")]),
  threshold: z.union([z.number(), z.literal("")]),
  filter_number: z.union([z.string(), z.literal("")]),
  automatic: z.boolean(),
});

const vehicleFormValidation = z
  .object({
    make: z.string().min(1, "Make is required").max(100),
    year: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (val: string | undefined) => {
          if (!val || !val.trim()) return true;
          const num = parseInt(val, 10);
          if (isNaN(num)) return false;
          if (num < 1900) return false;
          if (num > new Date().getFullYear() + 1) return false;
          return true;
        },
        { message: "Year must be between 1900 and current year + 1" }
      ),
    model: z.string().max(100).optional().or(z.literal("")),
    color: z.string().max(50).optional().or(z.literal("")),
    assigned_team_member: z.string().min(1, "User Assigned is required"),
    current_miles: z.string().min(1, "Current miles is required"),
    tracker_status: z.enum(["Y", "N"]),
    license_plate: z.string().max(40).optional().or(z.literal("")),
    serial_number: z.string().max(40).optional().or(z.literal("")),
    equipment_image: nullableImageField,
    registration_image: nullableImageField,
    insurance_image: nullableImageField,
    serial_number_image: z
      .instanceof(File)
      .nullable()
      .refine(
        (file) => !file || file.size <= FILE_SIZE_LIMITS.IMAGE_MAX_SIZE_BYTES,
        "Image must be less than 5 MB"
      )
      .refine(
        (file) =>
          !file || ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
        "Only JPG, JPEG, and PNG formats are supported"
      ),
    filterState: z.record(z.string(), filterStateSchema),
  })
  .refine(
    (data) => {
      if (!data.filterState) return true;
      return Object.values(data.filterState).every((f) => {
        const hasLastChanged =
          f.last_changed !== "" && f.last_changed !== undefined;
        const hasThreshold = f.threshold !== "" && f.threshold !== undefined;
        return hasLastChanged === hasThreshold;
      });
    },
    {
      message:
        "For each filter, Last changed and Threshold must both be filled or both be left empty.",
      path: ["filterState"],
    }
  );

export interface FilterStateItem {
  last_changed: number | "";
  threshold: number | "";
  filter_number: string | "";
  automatic: boolean;
}

export interface VehicleFormData {
  make: string;
  year: string;
  model: string;
  color: string;
  assigned_team_member: string;
  current_miles: string;
  tracker_status: string;
  license_plate: string;
  serial_number: string;
  equipment_image: File | null;
  registration_image: File | null;
  insurance_image: File | null;
  serial_number_image: File | null;
  filterState: Record<string, FilterStateItem>;
}

const defaultFilterState: Record<string, FilterStateItem> = Object.fromEntries(
  filterList.map((f) => [
    f.name,
    {
      last_changed: "",
      threshold: "",
      filter_number: "",
      automatic: true,
    },
  ])
);

export const defaultVehicleFormData: VehicleFormData = {
  make: "",
  year: "",
  model: "",
  color: "",
  assigned_team_member: "",
  current_miles: "",
  tracker_status: "Y",
  license_plate: "",
  serial_number: "",
  equipment_image: null,
  registration_image: null,
  insurance_image: null,
  serial_number_image: null,
  filterState: defaultFilterState,
};

interface VehicleFormContentProps {
  value: VehicleFormData;
  onChange: (value: VehicleFormData) => void;
}

function VehicleFormContent({ value, onChange }: VehicleFormContentProps) {
  const data = value || defaultVehicleFormData;
  const [showAdditional, setShowAdditional] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { data: team, isLoading: teamLoading } = useTeamData();
  const unitSystem = useUnitSystem();
  const isMetric = unitSystem === "metric";

  const handleFieldChange = <K extends keyof VehicleFormData>(
    field: K,
    fieldValue: VehicleFormData[K]
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

  const generateVehicleName = useMemo(() => {
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
            placeholder="e.g., Ford"
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
            placeholder="e.g., 2019"
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
            placeholder="e.g., F-150"
            value={data.model}
            onChange={(e) => handleFieldChange("model", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-base font-semibold">Color</label>
          <SanitizedInput
            className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
            maxLength={50}
            placeholder="e.g., Blue"
            value={data.color}
            onChange={(e) => handleFieldChange("color", e.target.value)}
          />
        </div>
      </div>

      {/* Auto-generated Vehicle Name Preview */}
      <div className="mt-2">
        <div className="flex flex-col">
          <label className="text-text-muted mb-2 block text-base font-semibold">
            Auto-generated Name (Preview)
          </label>
          <SanitizedInput
            readOnly
            className="border-border-subtle bg-bg-surface text-text-muted w-full cursor-not-allowed rounded-lg border p-3 text-base"
            placeholder="Vehicle name will be auto-generated"
            type="text"
            value={generateVehicleName || "Enter Make to see preview..."}
          />
          <p className="text-text-muted mt-1 text-xs">
            This name will be automatically generated from the fields above
          </p>
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

      {/* Vehicle Metrics Section */}
      <div className="mt-2">
        <h3 className="mb-2 text-lg font-semibold">Vehicle Metrics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              {isMetric ? "Current Kilometers (km)" : "Current Miles (mi)"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <SanitizedInput
              className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
              min={0}
              placeholder={
                isMetric ? "Enter current kilometers" : "Enter current miles"
              }
              type="number"
              value={data.current_miles}
              onChange={(e) =>
                handleFieldChange("current_miles", e.target.value)
              }
            />
          </div>
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
              License Plate
            </label>
            <SanitizedInput
              className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
              maxLength={40}
              placeholder="Enter license plate"
              value={data.license_plate}
              onChange={(e) =>
                handleFieldChange("license_plate", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              VIN / Serial Number
            </label>
            <SanitizedInput
              className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
              maxLength={40}
              placeholder="Enter VIN or serial number"
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
              Vehicle Image
            </label>
            <FileInput
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFieldChange("equipment_image", file);
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              Registration Image
            </label>
            <FileInput
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFieldChange("registration_image", file);
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              Insurance Image
            </label>
            <FileInput
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFieldChange("insurance_image", file);
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
          {filterList.some((filter) => {
            const v =
              data.filterState[filter.name] || defaultFilterState[filter.name];
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
            {filterList.map((filter) => {
              const filterValue =
                data.filterState[filter.name] ||
                defaultFilterState[filter.name];
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
                  vehicle
                  currentHours={Number(data.current_miles)}
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

export function buildVehicleFormSchema(isEditMode: boolean): FormSchema {
  return {
    id: "vehicle-form",
    sections: [
      {
        id: "vehicle-form-section",
        useCard: false,
        className: "space-y-2",
        fields: [
          {
            name: "vehicleForm",
            label: "",
            type: "custom",
            required: true,
            hideLabel: true,
            validation: vehicleFormValidation,
            customComponent: ({ value, onChange }) => (
              <VehicleFormContent
                value={value as VehicleFormData}
                onChange={onChange}
              />
            ),
          },
        ],
      },
    ],
    submitButton: {
      label: isEditMode ? "Save Changes" : "Add Vehicle",
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
