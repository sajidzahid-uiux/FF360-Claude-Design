import type { AssignedMachine, JobEquipmentEntry } from "../types";

type MatchableEquipment = {
  id: number;
  hour_rate?: number | string | null;
  machine_name?: string;
};

export function matchAssignedMachines(
  jobEquipments: JobEquipmentEntry[],
  allEquipment: MatchableEquipment[]
): AssignedMachine[] {
  if (!jobEquipments.length || !allEquipment.length) {
    return [];
  }

  return jobEquipments
    .map((jobEq) => {
      const equipmentId =
        typeof jobEq.equipment === "object"
          ? jobEq.equipment?.id
          : jobEq.equipment;

      if (!equipmentId) {
        return null;
      }

      const fullEquipment = allEquipment.find((eq) => eq.id === equipmentId);

      if (!fullEquipment) {
        return null;
      }

      return {
        ...jobEq,
        equipment: fullEquipment,
      };
    })
    .filter((item): item is AssignedMachine => item !== null);
}
