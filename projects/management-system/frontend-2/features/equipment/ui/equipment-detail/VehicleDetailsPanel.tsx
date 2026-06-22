"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Input,
  SearchableDropdown,
} from "@fieldflow360/org-ui";

import type { VehicleDetailsPanelProps } from "@/features/equipment";
import { DownloadMaintenanceLogButton } from "@/features/equipment/ui/DownloadMaintenanceLogButton";
import {
  DetailFormSection,
  DetailReadOnlyField,
  DetailViewEditActions,
} from "@/shared/ui/common";

import { EquipmentDetailImageSlot } from "./EquipmentDetailImageSlot";

export type { VehicleDetailsPanelProps } from "@/features/equipment";

export function VehicleDetailsPanel({
  access,
  assignment,
  specifications,
  edit,
  images,
  maintenance,
  onImageView,
}: VehicleDetailsPanelProps) {
  const { canRead, canWrite, canEdit, isDisabled } = access;
  const { values, usageUnitLabel, isMetric, onFieldChange } = specifications;
  const milesLabel = isMetric ? "Current kilometers" : "Current miles";

  return (
    <div className="space-y-4">
      <DetailFormSection
        description="Primary operator for this vehicle."
        title="Assignment"
      >
        <SearchableDropdown
          fullWidth
          disabled={assignment.teamLoading || isDisabled || !canWrite}
          emptyStateText="No members found."
          options={assignment.assigneeOptions}
          placeholder={
            assignment.teamLoading ? "Loading members..." : "Select member"
          }
          searchPlaceholder="Search members..."
          value={
            assignment.assignedMemberValue === "none"
              ? undefined
              : assignment.assignedMemberValue
          }
          onChange={assignment.onAssigneeChange}
        />
      </DetailFormSection>

      <DetailFormSection
        actions={
          <DetailViewEditActions
            canEdit={canEdit && !isDisabled}
            editAriaLabel="Edit vehicle details"
            isEditing={edit.editMode}
            isSaving={edit.isSaving}
            onCancel={edit.onEditCancel}
            onEdit={edit.onEditStart}
            onSave={edit.onSave}
          />
        }
        description="Registration, usage, and identification. Saving also applies photo changes below."
        title="Vehicle specifications"
      >
        {edit.editMode ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="VIN"
              maxLength={40}
              placeholder="VIN"
              size={ComponentSizeEnum.SM}
              value={values.serial_number}
              onChange={(e) => onFieldChange("serial_number", e.target.value)}
            />
            <Input
              label="License plate"
              maxLength={40}
              placeholder="License plate"
              size={ComponentSizeEnum.SM}
              value={values.license_plate}
              onChange={(e) => onFieldChange("license_plate", e.target.value)}
            />
            <Input
              label="Year"
              max={new Date().getFullYear() + 1}
              min={1900}
              placeholder="Year"
              size={ComponentSizeEnum.SM}
              type="number"
              value={values.year}
              onChange={(e) => onFieldChange("year", e.target.value)}
            />
            <Input
              required
              label="Make"
              maxLength={100}
              placeholder="Make"
              size={ComponentSizeEnum.SM}
              value={values.make}
              onChange={(e) => onFieldChange("make", e.target.value)}
            />
            <Input
              label="Model"
              maxLength={100}
              placeholder="Model"
              size={ComponentSizeEnum.SM}
              value={values.model}
              onChange={(e) => onFieldChange("model", e.target.value)}
            />
            <Input
              label="Color"
              maxLength={50}
              placeholder="Color"
              size={ComponentSizeEnum.SM}
              value={values.color}
              onChange={(e) => onFieldChange("color", e.target.value)}
            />
            <Input
              label={milesLabel}
              placeholder={usageUnitLabel}
              size={ComponentSizeEnum.SM}
              type="number"
              value={values.current_miles}
              onChange={(e) => onFieldChange("current_miles", e.target.value)}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailReadOnlyField label="VIN" value={values.serial_number} />
            <DetailReadOnlyField
              label="License plate"
              value={values.license_plate}
            />
            <DetailReadOnlyField label="Year" value={values.year} />
            <DetailReadOnlyField label="Make" value={values.make} />
            <DetailReadOnlyField label="Model" value={values.model} />
            <DetailReadOnlyField label="Color" value={values.color} />
            <DetailReadOnlyField
              label={milesLabel}
              value={
                values.current_miles
                  ? `${values.current_miles} ${usageUnitLabel}`
                  : ""
              }
            />
          </div>
        )}
      </DetailFormSection>

      <DetailFormSection
        description={
          edit.editMode
            ? "Upload or replace photos, then save specifications."
            : "Registration, insurance, and identification photos."
        }
        title="Documents & images"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {images.map((image) => (
            <EquipmentDetailImageSlot
              key={image.label}
              accept={image.accept}
              disabled={isDisabled}
              editable={edit.editMode && canEdit}
              inputRef={image.inputRef}
              label={image.label}
              src={image.src}
              onFileChange={image.onFileChange}
              onView={
                image.src
                  ? () => onImageView(image.src!, image.label)
                  : undefined
              }
            />
          ))}
        </div>
      </DetailFormSection>

      <DetailFormSection
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {canRead ? (
              <Button
                aria-label="Add to Maintenance"
                size={ComponentSizeEnum.SM}
                title="Add to Maintenance"
                variant={ButtonVariantEnum.SURFACE}
                onClick={maintenance.onAddToMaintenance}
              />
            ) : null}
            <DownloadMaintenanceLogButton
              isDownloading={maintenance.isDownloading}
              isLogReady={maintenance.isLogReady}
              onDownload={maintenance.onDownloadLog}
            />
          </div>
        }
        description="Maintenance workflow shortcuts for this vehicle."
        title="Actions"
      >
        <p className="text-text-muted text-sm">
          Use the buttons above to add this vehicle to maintenance or export its
          maintenance log.
        </p>
      </DetailFormSection>
    </div>
  );
}
