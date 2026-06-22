"use client";

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

import { Dropdown, FileUpload, Input, Radio } from "@fieldflow360/org-ui";

import { EQUIPMENT_TYPE_ENUM_LABELS, EquipmentTypeEnum } from "@/api/types";
import type { TeamMember } from "@/api/types/team";
import {
  type AddEquipmentFormValues,
  buildEquipmentNamePreview,
  getFilterDefinitionsForType,
} from "@/features/equipment/model/addEquipmentForm";
import { EquipmentFilterFields } from "@/features/equipment/ui/add-equipment/EquipmentFilterFields";
import { useTeamData } from "@/hooks";
import { AddEquipmentCollapsibleSection } from "@/shared/ui";
import { filterActiveTeamMembers } from "@/utils/team/assignmentOrder";

export interface AddEquipmentFormFieldsProps {
  equipmentType: EquipmentTypeEnum;
  value: AddEquipmentFormValues;
  onChange: Dispatch<SetStateAction<AddEquipmentFormValues>>;
  fieldErrors: Record<string, string>;
  onFieldChange?: (field: keyof AddEquipmentFormValues) => void;
}

function TrackerStatusField({
  value,
  onChange,
}: {
  value: "Y" | "N";
  onChange: (next: "Y" | "N") => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Tracker status</span>
      <div className="flex flex-wrap items-center gap-4 pt-0.5">
        <Radio
          checked={value === "Y"}
          label="Yes"
          name="tracker_status"
          value="Y"
          onChange={() => onChange("Y")}
        />
        <Radio
          checked={value === "N"}
          label="No"
          name="tracker_status"
          value="N"
          onChange={() => onChange("N")}
        />
      </div>
    </div>
  );
}

export function AddEquipmentFormFields({
  equipmentType,
  value,
  onChange,
  fieldErrors,
  onFieldChange,
}: AddEquipmentFormFieldsProps) {
  const { data: team, isLoading: teamLoading } = useTeamData() as {
    data?: TeamMember[];
    isLoading?: boolean;
  };
  const [showFilters, setShowFilters] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  const formData = value;
  const filterDefinitions = getFilterDefinitionsForType(equipmentType);
  const namePreview = buildEquipmentNamePreview(formData);

  const teamOptions = useMemo(
    () =>
      filterActiveTeamMembers(team).map((member) => ({
        value: String(member.id),
        label: member.user?.username ?? `Member #${member.id}`,
      })),
    [team]
  );

  const updateField = useCallback(
    <K extends keyof AddEquipmentFormValues>(
      field: K,
      fieldValue: AddEquipmentFormValues[K]
    ) => {
      onChange((current) => ({ ...current, [field]: fieldValue }));
      onFieldChange?.(field);
    },
    [onChange, onFieldChange]
  );

  const handleFilterChange = useCallback(
    (
      filterName: string,
      filterValue: AddEquipmentFormValues["filterState"][string]
    ) => {
      onChange((current) => ({
        ...current,
        filterState: {
          ...current.filterState,
          [filterName]: filterValue,
        },
      }));
    },
    [onChange]
  );

  const typeLabel = EQUIPMENT_TYPE_ENUM_LABELS[equipmentType];
  const showMachineFields = equipmentType === EquipmentTypeEnum.MACHINE;
  const showVehicleFields = equipmentType === EquipmentTypeEnum.VEHICLE;
  const showTrailerFields = equipmentType === EquipmentTypeEnum.TRAILER;
  const showUsageFilters =
    equipmentType === EquipmentTypeEnum.MACHINE ||
    equipmentType === EquipmentTypeEnum.VEHICLE;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-xs">
        Required fields are marked with an asterisk.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          required
          error={fieldErrors.make}
          label="Make"
          maxLength={100}
          placeholder="e.g., John Deere"
          value={formData.make}
          onChange={(event) => updateField("make", event.target.value)}
        />
        <Input
          error={fieldErrors.year}
          label="Year"
          max={new Date().getFullYear() + 1}
          min={1900}
          placeholder="e.g., 2022"
          type="number"
          value={formData.year}
          onChange={(event) => updateField("year", event.target.value)}
        />
        <Input
          error={fieldErrors.model}
          label="Model"
          maxLength={100}
          placeholder="e.g., 8R 410"
          value={formData.model}
          onChange={(event) => updateField("model", event.target.value)}
        />
        <Input
          error={fieldErrors.color}
          label="Color"
          maxLength={50}
          placeholder="e.g., Green"
          value={formData.color}
          onChange={(event) => updateField("color", event.target.value)}
        />
      </div>

      <Input
        readOnly
        helperText="From make, year, model, and color"
        label="Auto-generated name (preview)"
        placeholder="Enter make to see preview"
        value={namePreview}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-end">
        <Dropdown
          fullWidth
          disabled={teamLoading}
          error={fieldErrors.assigned_team_member}
          label="User assigned"
          options={teamOptions}
          placeholder={teamLoading ? "Loading users…" : "Select user"}
          value={
            formData.assigned_team_member
              ? formData.assigned_team_member
              : undefined
          }
          onChange={(selected) => updateField("assigned_team_member", selected)}
        />
        <TrackerStatusField
          value={formData.tracker_status}
          onChange={(next) => updateField("tracker_status", next)}
        />
      </div>

      {showMachineFields ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            required
            error={fieldErrors.current_hours}
            label="Current hours"
            placeholder="e.g., 1200"
            type="number"
            value={formData.current_hours}
            onChange={(event) =>
              updateField("current_hours", event.target.value)
            }
          />
          <Input
            required
            error={fieldErrors.hour_rate}
            label="Hourly rate"
            placeholder="e.g., 85"
            type="number"
            value={formData.hour_rate}
            onChange={(event) => updateField("hour_rate", event.target.value)}
          />
        </div>
      ) : null}

      {showVehicleFields ? (
        <Input
          required
          error={fieldErrors.current_miles}
          label="Current miles"
          placeholder="e.g., 45000"
          type="number"
          value={formData.current_miles}
          onChange={(event) => updateField("current_miles", event.target.value)}
        />
      ) : null}

      <AddEquipmentCollapsibleSection
        description="Serial number, images, and registration documents"
        open={showAdditional}
        title="Additional details"
        onToggle={() => setShowAdditional((current) => !current)}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {showVehicleFields || showTrailerFields ? (
            <Input
              error={fieldErrors.license_plate}
              label="License plate"
              maxLength={40}
              value={formData.license_plate}
              onChange={(event) =>
                updateField("license_plate", event.target.value)
              }
            />
          ) : null}
          <div
            className={
              showVehicleFields || showTrailerFields
                ? undefined
                : "sm:col-span-2"
            }
          >
            <Input
              error={fieldErrors.serial_number}
              label="Serial number"
              maxLength={50}
              value={formData.serial_number}
              onChange={(event) =>
                updateField("serial_number", event.target.value)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FileUpload
            accept="image/jpeg,image/png,image/jpg"
            error={fieldErrors.equipment_image}
            file={formData.equipment_image}
            label="Equipment image"
            onFileChange={(file) => updateField("equipment_image", file)}
          />
          <FileUpload
            accept="image/jpeg,image/png,image/jpg"
            error={fieldErrors.serial_number_image}
            file={formData.serial_number_image}
            label="Serial number image"
            onFileChange={(file) => updateField("serial_number_image", file)}
          />
          {showVehicleFields || showTrailerFields ? (
            <>
              <FileUpload
                accept="image/jpeg,image/png,image/jpg"
                error={fieldErrors.registration_image}
                file={formData.registration_image}
                label="Registration image"
                onFileChange={(file) => updateField("registration_image", file)}
              />
              <FileUpload
                accept="image/jpeg,image/png,image/jpg"
                error={fieldErrors.insurance_image}
                file={formData.insurance_image}
                label="Insurance image"
                onFileChange={(file) => updateField("insurance_image", file)}
              />
            </>
          ) : null}
        </div>
      </AddEquipmentCollapsibleSection>

      {showUsageFilters && filterDefinitions.length > 0 ? (
        <AddEquipmentCollapsibleSection
          description={`Optional ${typeLabel.toLowerCase()} maintenance filter tracking`}
          open={showFilters}
          title="Maintenance filters"
          onToggle={() => setShowFilters((current) => !current)}
        >
          <EquipmentFilterFields
            currentUsage={
              showMachineFields
                ? formData.current_hours
                : formData.current_miles
            }
            definitions={filterDefinitions}
            fieldErrors={fieldErrors}
            filterState={formData.filterState}
            isVehicle={showVehicleFields}
            onFilterChange={handleFilterChange}
          />
        </AddEquipmentCollapsibleSection>
      ) : null}
    </div>
  );
}
