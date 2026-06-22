import { EquipmentTypeEnum } from "@/api/types";
import type { EquipmentListRow } from "@/api/types";
import type { EquipmentPageData } from "@/features/equipment/model/types";
import { orgPath, orgUrl } from "@/shared/config/routes";
import { parseEntityId } from "@/shared/lib/parseEntityId";

import { normalizeEquipmentType } from "./equipmentType";

export type EquipmentApiCollection = "machines" | "vehicles" | "trailers";

export function getEquipmentRecordId(equipment: {
  id: string | number;
  equipment_ptr_id?: string | number;
}): number {
  return parseEntityId(
    equipment.equipment_ptr_id ?? equipment.id,
    "equipmentId"
  );
}

export function getEquipmentDisplayName(
  equipment: Pick<EquipmentListRow, "id" | "machine_name">
): string {
  return equipment.machine_name || `Equipment #${equipment.id}`;
}

export function toEquipmentTypeQueryParam(
  value: string | null | undefined
): EquipmentTypeEnum {
  return normalizeEquipmentType(value) ?? EquipmentTypeEnum.MACHINE;
}

export function mapEquipmentTypeToApiCollection(
  value: string | null | undefined
): EquipmentApiCollection {
  const type = toEquipmentTypeQueryParam(value);

  if (type === EquipmentTypeEnum.VEHICLE) return "vehicles";
  if (type === EquipmentTypeEnum.TRAILER) return "trailers";
  return "machines";
}

export function buildEquipmentDetailHref(
  orgId: string | number,
  equipment: Pick<
    EquipmentPageData,
    "id" | "equipment_ptr_id" | "equipment_type"
  >
): string {
  const equipmentId = getEquipmentRecordId(equipment);
  const equipmentType = toEquipmentTypeQueryParam(equipment.equipment_type);

  return orgUrl(
    orgId,
    `/equipment/${equipmentId}`,
    `equipment_type=${encodeURIComponent(equipmentType)}`
  );
}

export function buildEquipmentLogsHref(
  orgId: string | number,
  equipment: Pick<
    EquipmentPageData,
    "id" | "equipment_ptr_id" | "equipment_type" | "machine_name"
  >
): string {
  const equipmentId = getEquipmentRecordId(equipment);
  const equipmentType = toEquipmentTypeQueryParam(equipment.equipment_type);
  const name = getEquipmentDisplayName(equipment);

  return orgPath(
    orgId,
    `/equipment/${equipmentId}/logs?equipment_type=${encodeURIComponent(
      equipmentType
    )}&name=${encodeURIComponent(name)}`
  );
}

export function buildEquipmentDetailBreadcrumbPath(
  orgId: string | number,
  equipmentId: string | number
): string {
  return orgPath(orgId, `/equipment/${equipmentId}`);
}
