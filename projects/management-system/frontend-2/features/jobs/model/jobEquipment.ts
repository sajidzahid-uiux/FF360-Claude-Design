import type {
  EquipmentAssignment,
  JobEquipmentHoursUpdatePayload,
  MaintenanceAttribute,
  RecordEquipment,
} from "@/api/types";

/** Job ↔ equipment link from job detail APIs (`equipments` on `Job`). */
export type JobEquipmentAssignmentRecord = EquipmentAssignment;

export type JobEquipmentOption = Omit<
  RecordEquipment,
  "name" | "service_status" | "filters"
> & {
  machine_name: RecordEquipment["name"];
  maintenance_attributes?: MaintenanceAttribute[];
};

/** `equipmentUntilUpdate/` response. */
export interface EquipmentMaintenanceCheckResponse {
  need_maintenance: string[];
  close_to_maintenance: string[];
}

export interface JobEquipmentHoursState {
  start: number;
  end: number;
}

export type UpdateJobEquipmentHoursPayload = JobEquipmentHoursUpdatePayload;

export type JobEquipmentAssignmentMode = "manage" | "track";
