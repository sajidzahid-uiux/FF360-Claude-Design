import type { PaginatedResponseAlt, RecordEquipment } from "@/api/types";
import type { JobEquipmentOption } from "@/features/jobs";

function isPaginatedRecordEquipment(
  data: RecordEquipment[] | PaginatedResponseAlt<RecordEquipment>
): data is PaginatedResponseAlt<RecordEquipment> {
  return (
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    "results" in data &&
    Array.isArray(data.results)
  );
}

export function recordEquipmentToJobEquipmentOptions(
  recordEquipmentData:
    | RecordEquipment[]
    | PaginatedResponseAlt<RecordEquipment>
    | undefined
): JobEquipmentOption[] | undefined {
  if (!recordEquipmentData) return undefined;

  const equipmentArray = Array.isArray(recordEquipmentData)
    ? recordEquipmentData
    : isPaginatedRecordEquipment(recordEquipmentData)
      ? recordEquipmentData.results
      : [];

  return equipmentArray.map((eq) => ({
    id: eq.id,
    machine_name: eq.name ?? "",
    serial_number: eq.serial_number,
    equipment_type: eq.equipment_type,
    current_hours: eq.current_hours ?? null,
    maintenance_attributes: [],
  }));
}
