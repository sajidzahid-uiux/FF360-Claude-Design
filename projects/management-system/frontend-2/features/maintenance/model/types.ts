import type {
  Maintenance,
  MaintenanceWorkItem,
  RecordEquipment,
} from "@/api/types";

export type { MaintenanceWorkItem };

export interface EnrichedMaintenanceItem extends Maintenance {
  equipment_name: string;
  equipment_data: RecordEquipment | undefined;
  items?: MaintenanceWorkItem[];
  maintenance_contacted?: boolean;
  serial_number?: string;
}
