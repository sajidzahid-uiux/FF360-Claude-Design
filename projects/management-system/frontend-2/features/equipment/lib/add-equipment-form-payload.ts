import { EquipmentTypeEnum } from "@/api/types";
import type {
  MachineSubmitData,
  TrailerSubmitData,
  VehicleSubmitData,
} from "@/features/equipment/model/types";

import {
  type AddEquipmentFormValues,
  getFilterDefinitionsForType,
} from "../model/addEquipmentForm";

function buildMaintenanceAttributes(values: AddEquipmentFormValues) {
  const definitions = getFilterDefinitionsForType(EquipmentTypeEnum.MACHINE);

  return definitions
    .map((filter) => {
      const item = values.filterState[filter.name];
      if (!item) return null;

      const lastChanged = item.last_changed;
      const threshold = item.threshold;
      const filterNumber = item.filter_number;

      return {
        title: filter.name,
        last_changed: lastChanged === "" ? undefined : lastChanged,
        threshold: threshold === "" ? undefined : threshold,
        filter_number: filterNumber === "" ? undefined : filterNumber,
        automatic: true,
      };
    })
    .filter(
      (attribute) =>
        attribute !== null &&
        (attribute.last_changed !== undefined ||
          attribute.threshold !== undefined)
    ) as MachineSubmitData["maintenance_attributes"];
}

function buildVehicleMaintenanceAttributes(values: AddEquipmentFormValues) {
  const definitions = getFilterDefinitionsForType(EquipmentTypeEnum.VEHICLE);

  return definitions
    .map((filter) => {
      const item = values.filterState[filter.name];
      if (!item) return null;

      const lastChanged = item.last_changed;
      const threshold = item.threshold;
      const filterNumber = item.filter_number;

      return {
        title: filter.name,
        last_changed: lastChanged === "" ? undefined : lastChanged,
        threshold: threshold === "" ? undefined : threshold,
        filter_number: filterNumber === "" ? undefined : filterNumber,
        automatic: true,
      };
    })
    .filter(
      (attribute) =>
        attribute !== null &&
        (attribute.last_changed !== undefined ||
          attribute.threshold !== undefined)
    ) as VehicleSubmitData["maintenance_attributes"];
}

function parseOptionalInt(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseOptionalFloat(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function addEquipmentFormToMachinePayload(
  values: AddEquipmentFormValues
): MachineSubmitData {
  return {
    make: values.make.trim(),
    year: parseOptionalInt(values.year),
    model: values.model.trim() || undefined,
    color: values.color.trim() || undefined,
    assigned_team_member: values.assigned_team_member.trim(),
    current_hours: parseOptionalFloat(values.current_hours),
    hour_rate: parseOptionalFloat(values.hour_rate),
    tracker_status: values.tracker_status,
    serial_number: values.serial_number.trim() || undefined,
    equipment_image: values.equipment_image,
    serial_number_image: values.serial_number_image,
    maintenance_attributes: buildMaintenanceAttributes(values),
  };
}

export function addEquipmentFormToVehiclePayload(
  values: AddEquipmentFormValues
): VehicleSubmitData {
  return {
    make: values.make.trim(),
    year: parseOptionalInt(values.year),
    model: values.model.trim() || undefined,
    color: values.color.trim() || undefined,
    assigned_team_member: values.assigned_team_member.trim(),
    current_miles: parseOptionalFloat(values.current_miles),
    tracker_status: values.tracker_status,
    license_plate: values.license_plate.trim() || undefined,
    serial_number: values.serial_number.trim() || undefined,
    equipment_image: values.equipment_image,
    registration_image: values.registration_image,
    insurance_image: values.insurance_image,
    serial_number_image: values.serial_number_image,
    maintenance_attributes: buildVehicleMaintenanceAttributes(values),
  };
}

export function addEquipmentFormToTrailerPayload(
  values: AddEquipmentFormValues
): TrailerSubmitData {
  return {
    make: values.make.trim(),
    year: parseOptionalInt(values.year),
    model: values.model.trim() || undefined,
    color: values.color.trim() || undefined,
    assigned_team_member: values.assigned_team_member.trim(),
    tracker_status: values.tracker_status,
    license_plate: values.license_plate.trim() || undefined,
    serial_number: values.serial_number.trim() || undefined,
    equipment_image: values.equipment_image,
    insurance_image: values.insurance_image,
    registration_image: values.registration_image,
    serial_number_image: values.serial_number_image,
  };
}

export type AddEquipmentSubmitPayload =
  | { type: EquipmentTypeEnum.MACHINE; data: MachineSubmitData }
  | { type: EquipmentTypeEnum.VEHICLE; data: VehicleSubmitData }
  | { type: EquipmentTypeEnum.TRAILER; data: TrailerSubmitData };

export function addEquipmentFormToSubmitPayload(
  equipmentType: EquipmentTypeEnum,
  values: AddEquipmentFormValues
): AddEquipmentSubmitPayload {
  if (equipmentType === EquipmentTypeEnum.MACHINE) {
    return {
      type: EquipmentTypeEnum.MACHINE,
      data: addEquipmentFormToMachinePayload(values),
    };
  }

  if (equipmentType === EquipmentTypeEnum.VEHICLE) {
    return {
      type: EquipmentTypeEnum.VEHICLE,
      data: addEquipmentFormToVehiclePayload(values),
    };
  }

  return {
    type: EquipmentTypeEnum.TRAILER,
    data: addEquipmentFormToTrailerPayload(values),
  };
}
