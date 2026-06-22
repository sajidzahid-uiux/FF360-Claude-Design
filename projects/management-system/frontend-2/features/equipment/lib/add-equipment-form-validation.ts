import { EquipmentTypeEnum } from "@/api/types";
import { FILE_SIZE_LIMITS } from "@/constants";

import {
  type AddEquipmentFormValues,
  getFilterDefinitionsForType,
} from "../model/addEquipmentForm";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

function isValidYear(value: string): boolean {
  if (!value.trim()) return true;
  const year = Number.parseInt(value, 10);
  if (Number.isNaN(year)) return false;
  return year >= 1900 && year <= new Date().getFullYear() + 1;
}

function validateImageFile(
  file: File | null,
  fieldKey: string,
  errors: Record<string, string>
) {
  if (!file) return;
  if (file.size > FILE_SIZE_LIMITS.IMAGE_MAX_SIZE_BYTES) {
    errors[fieldKey] = "Image must be less than 5 MB";
  } else if (!IMAGE_TYPES.includes(file.type)) {
    errors[fieldKey] = "Only JPG, JPEG, and PNG formats are supported";
  }
}

function validateFilterState(
  values: AddEquipmentFormValues,
  equipmentType: EquipmentTypeEnum,
  errors: Record<string, string>
) {
  const definitions = getFilterDefinitionsForType(equipmentType);

  for (const filter of definitions) {
    const item = values.filterState[filter.name];
    if (!item) continue;

    const hasLastChanged =
      item.last_changed !== "" && item.last_changed !== undefined;
    const hasThreshold = item.threshold !== "" && item.threshold !== undefined;

    if (hasLastChanged !== hasThreshold) {
      errors[`filterState.${filter.name}`] =
        "Last changed and threshold must both be filled or both be empty.";
    }
  }
}

export function validateAddEquipmentForm(
  values: AddEquipmentFormValues,
  equipmentType: EquipmentTypeEnum
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.make.trim()) {
    errors.make = "Make is required";
  } else if (values.make.length > 100) {
    errors.make = "Make must be 100 characters or less";
  }

  if (!isValidYear(values.year)) {
    errors.year = "Year must be between 1900 and current year + 1";
  }

  if (values.model.length > 100) {
    errors.model = "Model must be 100 characters or less";
  }

  if (values.color.length > 50) {
    errors.color = "Color must be 50 characters or less";
  }

  if (!values.assigned_team_member.trim()) {
    errors.assigned_team_member = "User assigned is required";
  }

  if (equipmentType === EquipmentTypeEnum.MACHINE) {
    if (!values.current_hours.trim()) {
      errors.current_hours = "Current hours is required";
    }
    if (!values.hour_rate.trim()) {
      errors.hour_rate = "Hourly rate is required";
    }
    validateFilterState(values, equipmentType, errors);
  }

  if (equipmentType === EquipmentTypeEnum.VEHICLE) {
    if (!values.current_miles.trim()) {
      errors.current_miles = "Current miles is required";
    }
    if (values.license_plate.length > 40) {
      errors.license_plate = "License plate must be 40 characters or less";
    }
    validateFilterState(values, equipmentType, errors);
  }

  if (equipmentType === EquipmentTypeEnum.TRAILER) {
    if (values.license_plate.length > 40) {
      errors.license_plate = "License plate must be 40 characters or less";
    }
  }

  if (values.serial_number.length > 50) {
    errors.serial_number = "Serial number must be 50 characters or less";
  }

  validateImageFile(values.equipment_image, "equipment_image", errors);
  validateImageFile(values.serial_number_image, "serial_number_image", errors);
  validateImageFile(values.registration_image, "registration_image", errors);
  validateImageFile(values.insurance_image, "insurance_image", errors);

  return errors;
}

export function isAddEquipmentFormSubmittable(
  values: AddEquipmentFormValues,
  equipmentType: EquipmentTypeEnum
): boolean {
  return (
    Object.keys(validateAddEquipmentForm(values, equipmentType)).length === 0
  );
}
