import {
  EQUIPMENT_TYPE_ENUM_LABELS,
  EquipmentTypeEnum,
  type EquipmentV2,
} from "@/api/types";

export function getEquipmentType(item: EquipmentV2): EquipmentTypeEnum {
  if ("current_hours" in item) return EquipmentTypeEnum.MACHINE;
  if ("current_miles" in item) return EquipmentTypeEnum.VEHICLE;
  return EquipmentTypeEnum.TRAILER;
}

export function normalizeEquipmentType(
  value: string | null | undefined
): EquipmentTypeEnum | null {
  if (!value) return null;

  const normalized = value.toLowerCase();
  if (normalized === "machine" || normalized === "machines") {
    return EquipmentTypeEnum.MACHINE;
  }
  if (normalized === "vehicle" || normalized === "vehicles") {
    return EquipmentTypeEnum.VEHICLE;
  }
  if (normalized === "trailer" || normalized === "trailers") {
    return EquipmentTypeEnum.TRAILER;
  }

  return null;
}

export function getEquipmentTypeLabel(
  value: string | null | undefined
): string {
  const type = normalizeEquipmentType(value);
  return type ? EQUIPMENT_TYPE_ENUM_LABELS[type] : "Equipment";
}

export function isMachineType(value: string | null | undefined): boolean {
  return normalizeEquipmentType(value) === EquipmentTypeEnum.MACHINE;
}

export function isVehicleType(value: string | null | undefined): boolean {
  return normalizeEquipmentType(value) === EquipmentTypeEnum.VEHICLE;
}
