export enum MaintenanceEquipmentType {
  MACHINE = "machine",
  VEHICLE = "vehicle",
  TRAILER = "trailer",
}

export const MAINTENANCE_EQUIPMENT_INDICATOR_ORDER = [
  MaintenanceEquipmentType.MACHINE,
  MaintenanceEquipmentType.TRAILER,
  MaintenanceEquipmentType.VEHICLE,
] as const;

export const MAINTENANCE_EQUIPMENT_TYPE_LABELS: Record<
  MaintenanceEquipmentType,
  string
> = {
  [MaintenanceEquipmentType.MACHINE]: "Machine",
  [MaintenanceEquipmentType.TRAILER]: "Trailer",
  [MaintenanceEquipmentType.VEHICLE]: "Vehicle",
};

export const MAINTENANCE_EQUIPMENT_INDICATOR_COLORS: Record<
  MaintenanceEquipmentType,
  string
> = {
  [MaintenanceEquipmentType.MACHINE]: "bg-green-500",
  [MaintenanceEquipmentType.TRAILER]: "bg-blue-500",
  [MaintenanceEquipmentType.VEHICLE]: "bg-red-500",
};

export interface ActiveEquipmentCounts {
  [MaintenanceEquipmentType.MACHINE]: number;
  [MaintenanceEquipmentType.VEHICLE]: number;
  [MaintenanceEquipmentType.TRAILER]: number;
  total: number;
}

export function hasActiveMaintenanceCounts(
  counts: ActiveEquipmentCounts
): boolean {
  return MAINTENANCE_EQUIPMENT_INDICATOR_ORDER.some((type) => counts[type] > 0);
}

/** Checklist row on a maintenance session (`MaintenanceItemSerializer`). */
export interface MaintenanceWorkItem {
  id: number;
  title?: string;
  completed: boolean;
  created_at: string;
  maintenance?: number;
  attribute?: number;
}

/** Equipment maintenance session (`MaintenanceSerializer`). */
export interface Maintenance {
  id: number;
  equipment: number;
  date: string;
  description: string;
  assigned_to: number[];
  completed: boolean;
  service_contacted?: boolean;
  items?: MaintenanceWorkItem[];
  created_at?: string;
}

export type MaintenanceCreatePayload = Pick<
  Maintenance,
  "equipment" | "date" | "description" | "assigned_to" | "service_contacted"
>;

export type MaintenanceUpdatePayload = Partial<MaintenanceCreatePayload>;

export type MaintenanceWorkItemCreatePayload = {
  title: string;
  maintenance: number;
  completed?: boolean;
};

export type MaintenanceWorkItemUpdatePayload = Partial<
  Pick<MaintenanceWorkItem, "title" | "completed">
>;
