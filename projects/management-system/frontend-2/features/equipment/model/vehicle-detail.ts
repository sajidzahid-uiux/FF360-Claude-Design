import type { ChangeEvent, RefObject } from "react";

import type { SearchableDropdownOption } from "@fieldflow360/org-ui";

import type { MaintenanceAttribute } from "@/api/types";

export type VehicleDetailImageValue = File | string | null;

/** Local vehicle record for the detail view (API fields + in-memory file uploads). */
export interface VehicleDetailRecord {
  id: string;
  machine_name?: string;
  name?: string;
  serial_number?: string | null;
  license_plate?: string | null;
  current_miles?: number | string | null;
  assigned_team_member?: string | null;
  year?: string | number | null;
  make?: string | null;
  model?: string | null;
  color?: string | null;
  equipment_image?: VehicleDetailImageValue;
  registration_image?: VehicleDetailImageValue;
  insurance_image?: VehicleDetailImageValue;
  serial_number_image?: VehicleDetailImageValue;
  service_status?: string;
  last_updated?: string;
  maintenance_attributes?: MaintenanceAttribute[];
}

export interface VehicleEditableFields {
  serial_number?: string;
  license_plate?: string;
  current_miles?: string | number | null;
  assigned_team_member?: string | null;
  year?: string | number | null;
  make?: string | null;
  model?: string | null;
  color?: string | null;
}

export const VEHICLE_SPECIFICATION_FIELD_KEYS = [
  "serial_number",
  "license_plate",
  "year",
  "make",
  "model",
  "color",
  "current_miles",
] as const;

export type VehicleSpecificationFieldKey =
  (typeof VEHICLE_SPECIFICATION_FIELD_KEYS)[number];

/** String values passed into the specifications section of the details panel. */
export type VehicleSpecificationValues = Record<
  VehicleSpecificationFieldKey,
  string
>;

export interface EquipmentDetailAccess {
  canRead: boolean;
  canWrite: boolean;
  canEdit: boolean;
  isDisabled: boolean;
}

export interface VehicleDetailEditHandlers {
  editMode: boolean;
  isSaving: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
  onSave: () => void | Promise<void>;
}

export interface VehicleDetailAssignmentState {
  teamLoading: boolean;
  assigneeOptions: SearchableDropdownOption<string>[];
  assignedMemberValue: string;
  onAssigneeChange: (userId: string) => void | Promise<void>;
}

export interface VehicleDetailSpecificationsState {
  values: VehicleSpecificationValues;
  usageUnitLabel: string;
  isMetric: boolean;
  onFieldChange: (field: VehicleSpecificationFieldKey, value: string) => void;
}

export interface EquipmentDetailImageSlotConfig {
  label: string;
  src: string | null;
  accept: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface VehicleDetailMaintenanceActions {
  isLogReady: boolean;
  isDownloading?: boolean;
  onDownloadLog: () => void | Promise<void>;
  onAddToMaintenance: () => void;
}

export interface VehicleDetailsPanelProps {
  access: EquipmentDetailAccess;
  assignment: VehicleDetailAssignmentState;
  specifications: VehicleDetailSpecificationsState;
  edit: VehicleDetailEditHandlers;
  images: EquipmentDetailImageSlotConfig[];
  maintenance: VehicleDetailMaintenanceActions;
  onImageView: (url: string, title: string) => void;
}

export function resolveVehicleSpecificationValues(
  vehicle: Pick<
    VehicleDetailRecord,
    VehicleSpecificationFieldKey | "serial_number"
  >,
  edited: Partial<VehicleEditableFields>,
  editMode: boolean
): VehicleSpecificationValues {
  const read = (key: VehicleSpecificationFieldKey): string => {
    const fromVehicle =
      key === "serial_number"
        ? vehicle.serial_number
        : key === "license_plate"
          ? vehicle.license_plate
          : key === "current_miles"
            ? vehicle.current_miles
            : vehicle[key];
    const fromEdited = edited[key];
    const raw = editMode
      ? (fromEdited ?? fromVehicle ?? "")
      : (fromVehicle ?? "");
    return String(raw);
  };

  return {
    serial_number: read("serial_number"),
    license_plate: read("license_plate"),
    year: read("year"),
    make: read("make"),
    model: read("model"),
    color: read("color"),
    current_miles: read("current_miles"),
  };
}

export function createVehicleEditDraft(
  vehicle: VehicleDetailRecord
): VehicleEditableFields {
  return {
    serial_number: vehicle.serial_number || "",
    license_plate: vehicle.license_plate || "",
    year: vehicle.year?.toString() || "",
    make: vehicle.make || "",
    model: vehicle.model || "",
    color: vehicle.color || "",
    current_miles: vehicle.current_miles?.toString() || "",
  };
}
