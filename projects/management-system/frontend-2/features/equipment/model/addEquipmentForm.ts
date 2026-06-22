import { EquipmentTypeEnum } from "@/api/types";

import {
  type EquipmentFilterDefinition,
  MACHINE_FILTER_DEFINITIONS,
  VEHICLE_FILTER_DEFINITIONS,
} from "./equipmentFilterDefinitions";

export interface FilterStateItem {
  last_changed: number | "";
  threshold: number | "";
  filter_number: string | "";
  automatic: boolean;
}

export interface AddEquipmentFormValues {
  make: string;
  year: string;
  model: string;
  color: string;
  assigned_team_member: string;
  tracker_status: "Y" | "N";
  serial_number: string;
  license_plate: string;
  current_hours: string;
  hour_rate: string;
  current_miles: string;
  equipment_image: File | null;
  serial_number_image: File | null;
  registration_image: File | null;
  insurance_image: File | null;
  filterState: Record<string, FilterStateItem>;
}

function createDefaultFilterState(
  definitions: EquipmentFilterDefinition[]
): Record<string, FilterStateItem> {
  return Object.fromEntries(
    definitions.map((filter) => [
      filter.name,
      {
        last_changed: "",
        threshold: "",
        filter_number: "",
        automatic: true,
      },
    ])
  );
}

export const DEFAULT_ADD_EQUIPMENT_FORM_VALUES: AddEquipmentFormValues = {
  make: "",
  year: "",
  model: "",
  color: "",
  assigned_team_member: "",
  tracker_status: "Y",
  serial_number: "",
  license_plate: "",
  current_hours: "",
  hour_rate: "",
  current_miles: "",
  equipment_image: null,
  serial_number_image: null,
  registration_image: null,
  insurance_image: null,
  filterState: {},
};

export function getFilterDefinitionsForType(
  equipmentType: EquipmentTypeEnum
): EquipmentFilterDefinition[] {
  if (equipmentType === EquipmentTypeEnum.MACHINE) {
    return MACHINE_FILTER_DEFINITIONS;
  }
  if (equipmentType === EquipmentTypeEnum.VEHICLE) {
    return VEHICLE_FILTER_DEFINITIONS;
  }
  return [];
}

export function buildDefaultAddEquipmentFormValues(
  equipmentType: EquipmentTypeEnum
): AddEquipmentFormValues {
  const filterDefinitions = getFilterDefinitionsForType(equipmentType);

  return {
    ...DEFAULT_ADD_EQUIPMENT_FORM_VALUES,
    filterState: createDefaultFilterState(filterDefinitions),
  };
}

export function buildEquipmentNamePreview(
  values: AddEquipmentFormValues
): string {
  const parts: string[] = [];
  if (values.make.trim()) parts.push(values.make.trim().toUpperCase());
  if (values.year.trim()) parts.push(values.year.trim());
  if (values.model.trim()) parts.push(values.model.trim().toUpperCase());
  if (values.color.trim()) parts.push(values.color.trim().toUpperCase());
  return parts.join("-");
}
