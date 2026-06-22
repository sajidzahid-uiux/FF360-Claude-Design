import type { JobEquipmentHoursUpdatePayload } from "@/api/types";

export function buildJobEquipmentHoursUpdatePayload(
  start: number,
  end: number,
  equipmentId: number,
  farmId?: number | null
): JobEquipmentHoursUpdatePayload {
  const payload: JobEquipmentHoursUpdatePayload = {
    start,
    end,
    equipment: equipmentId,
  };

  if (farmId != null) {
    payload.farm_id = farmId;
  }

  return payload;
}

export function shouldShowOnSiteFarmHoursSelect(
  farms: { id: number }[] | undefined
): boolean {
  return (farms?.length ?? 0) >= 1;
}
