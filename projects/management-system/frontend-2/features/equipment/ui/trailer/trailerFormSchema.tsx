"use client";

import { useMemo, useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";
import { z } from "zod";

import { FileInput } from "@/features/equipment/ui";
import type { FormSchema } from "@/features/forms/ui";
import { useTeamData } from "@/hooks";
import { SanitizedInput } from "@/shared/ui/primitives";
import { filterActiveTeamMembers } from "@/utils/team/assignmentOrder";

const nullableImageField = z.union([z.instanceof(File), z.string()]).nullable();

const trailerFormValidation = z.object({
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
  tracker_status: z.enum(["Y", "N"]),
  license_plate: z.string().max(40).optional().or(z.literal("")),
  serial_number: z.string().max(50).optional().or(z.literal("")),
  equipment_image: nullableImageField,
  insurance_image: nullableImageField,
  registration_image: nullableImageField,
  serial_number_image: nullableImageField,
});

export interface TrailerFormData {
  make: string;
  year: string;
  model: string;
  color: string;
  assigned_team_member: string;
  tracker_status: string;
  license_plate: string;
  serial_number: string;
  equipment_image: File | null;
  insurance_image: File | null;
  registration_image: File | null;
  serial_number_image: File | null;
}

export const defaultTrailerFormData: TrailerFormData = {
  make: "",
  year: "",
  model: "",
  color: "",
  assigned_team_member: "",
  tracker_status: "Y",
  license_plate: "",
  serial_number: "",
  equipment_image: null,
  insurance_image: null,
  registration_image: null,
  serial_number_image: null,
};

interface TrailerFormContentProps {
  value: TrailerFormData;
  onChange: (value: TrailerFormData) => void;
}

function TrailerFormContent({ value, onChange }: TrailerFormContentProps) {
  const formData = value || defaultTrailerFormData;
  const [showAdditional, setShowAdditional] = useState(false);
  const { data: team, isLoading: teamLoading } = useTeamData();

  const handleChange = <K extends keyof TrailerFormData>(
    field: K,
    fieldValue: TrailerFormData[K]
  ) => {
    onChange({ ...formData, [field]: fieldValue });
  };

  const generateTrailerName = useMemo(() => {
    const parts: string[] = [];
    if (formData.make.trim()) parts.push(formData.make.trim().toUpperCase());
    if (formData.year.trim()) parts.push(formData.year.trim());
    if (formData.model.trim()) parts.push(formData.model.trim().toUpperCase());
    if (formData.color.trim()) parts.push(formData.color.trim().toUpperCase());
    if (parts.length === 0) return "";
    return parts.join("-");
  }, [formData.make, formData.year, formData.model, formData.color]);

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
            placeholder="e.g., Big Tex"
            value={formData.make}
            onChange={(e) => handleChange("make", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-base font-semibold">Year</label>
          <SanitizedInput
            className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
            max={new Date().getFullYear() + 1}
            min={1900}
            placeholder="e.g., 2021"
            type="number"
            value={formData.year}
            onChange={(e) => handleChange("year", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-base font-semibold">Model</label>
          <SanitizedInput
            className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
            maxLength={100}
            placeholder="e.g., 14LX-16"
            value={formData.model}
            onChange={(e) => handleChange("model", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 block text-base font-semibold">Color</label>
          <SanitizedInput
            className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
            maxLength={50}
            placeholder="e.g., Black"
            value={formData.color}
            onChange={(e) => handleChange("color", e.target.value)}
          />
        </div>
      </div>

      {/* Auto-generated Trailer Name Preview */}
      <div className="mt-2">
        <div className="flex flex-col">
          <label className="text-text-muted mb-2 block text-base font-semibold">
            Auto-generated Name (Preview)
          </label>
          <SanitizedInput
            readOnly
            className="border-border-subtle bg-bg-surface text-text-muted w-full cursor-not-allowed rounded-lg border p-3 text-base"
            placeholder="Trailer name will be auto-generated"
            type="text"
            value={generateTrailerName || "Enter Make to see preview..."}
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
            value={formData.assigned_team_member}
            onChange={(e) =>
              handleChange("assigned_team_member", e.target.value)
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
      <div className="mt-2 grid grid-cols-4 gap-4">
        <div className="col-span-2 flex flex-col">
          <label className="mb-2 block text-base font-semibold">
            Tracker Status
          </label>
          <div className="mt-2 flex gap-6">
            <label className="flex items-center gap-2 text-base">
              <SanitizedInput
                checked={formData.tracker_status === "Y"}
                name="trackerStatus"
                type="radio"
                value="Y"
                onChange={() => handleChange("tracker_status", "Y")}
              />
              Yes
            </label>
            <label className="flex items-center gap-2 text-base">
              <SanitizedInput
                checked={formData.tracker_status === "N"}
                name="trackerStatus"
                type="radio"
                value="N"
                onChange={() => handleChange("tracker_status", "N")}
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
              value={formData.license_plate}
              onChange={(e) => handleChange("license_plate", e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              Serial Number
            </label>
            <SanitizedInput
              className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
              maxLength={50}
              placeholder="Enter serial number"
              value={formData.serial_number}
              onChange={(e) => handleChange("serial_number", e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              Equipment Image
            </label>
            <FileInput
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleChange("equipment_image", file);
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
                if (file) handleChange("insurance_image", file);
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
                if (file) handleChange("registration_image", file);
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              Serial Number Image
            </label>
            <FileInput
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleChange("serial_number_image", file);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function buildTrailerFormSchema(isEditMode: boolean): FormSchema {
  return {
    id: "trailer-form",
    sections: [
      {
        id: "trailer-form-section",
        useCard: false,
        className: "space-y-2",
        fields: [
          {
            name: "trailerForm",
            label: "",
            type: "custom",
            required: true,
            hideLabel: true,
            validation: trailerFormValidation,
            customComponent: ({ value, onChange }) => (
              <TrailerFormContent
                value={value as TrailerFormData}
                onChange={onChange}
              />
            ),
          },
        ],
      },
    ],
    submitButton: {
      label: isEditMode ? "Save Changes" : "Add Trailer",
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
