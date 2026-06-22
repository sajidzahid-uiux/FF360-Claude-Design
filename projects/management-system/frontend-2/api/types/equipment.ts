import { ServiceStatus, TrackerStatus } from "@/constants/enums";

import type { BaseListParams, PaginatedResponseAlt } from "./common";

// Re-export enums for convenience
export { ServiceStatus, TrackerStatus };

export enum EquipmentTypeEnum {
  MACHINE = "machine",
  VEHICLE = "vehicle",
  TRAILER = "trailer",
}

export const EQUIPMENT_TYPE_ENUM_LABELS: Record<EquipmentTypeEnum, string> = {
  [EquipmentTypeEnum.MACHINE]: "Machine",
  [EquipmentTypeEnum.VEHICLE]: "Vehicle",
  [EquipmentTypeEnum.TRAILER]: "Trailer",
};

export const EQUIPMENT_TYPE_OPTIONS = [
  EquipmentTypeEnum.MACHINE,
  EquipmentTypeEnum.VEHICLE,
  EquipmentTypeEnum.TRAILER,
].map((value) => ({
  value,
  label: EQUIPMENT_TYPE_ENUM_LABELS[value],
}));

// ============================================
// MAINTENANCE
// ============================================

export interface MaintenanceAttribute {
  id?: number;
  title: string;
  filter_number?: string;
  threshold: number;
  last_changed: number;
  need_maintenance?: boolean;
  automatic?: boolean;
}

export interface MaintenanceAttributeCreatePayload {
  title: string;
  filter_number?: string;
  threshold: number;
  last_changed: number;
  automatic?: boolean;
}

// ============================================
// BASE EQUIPMENT
// ============================================

export interface BaseEquipmentV2 {
  id: number;
  machine_name: string;
  make: string;
  year: number | null;
  model: string | null;
  color: string | null;
  serial_number: string | null;
  service_status: ServiceStatus;
  equipment_image: string | null;
  equipment_ptr_id: number;
  assigned_team_member: number | null;
  created_at: string;
  last_updated: string;
}

// ============================================
// EQUIPMENT TYPES
// ============================================

export interface MachineV2 extends BaseEquipmentV2 {
  current_hours: number;
  tracker_status: TrackerStatus;
  hour_rate: number | null;
  serial_number_image: string | null;
  maintenance_attributes: MaintenanceAttribute[];
}

export interface VehicleV2 extends BaseEquipmentV2 {
  current_miles: number;
  license_plate: string | null;
  registration_image: string | null;
  insurance_image: string | null;
  serial_number_image: string | null;
}

export interface TrailerV2 extends BaseEquipmentV2 {
  tracker_status: TrackerStatus;
  license_plate: string | null;
  registration_image: string | null;
  insurance_image: string | null;
  serial_number_image: string | null;
}

// Union type for any equipment
export type EquipmentV2 = MachineV2 | VehicleV2 | TrailerV2;

/** Normalized row from `GET /equipment/all/` used in list/grid UI. */
export type EquipmentListRow = EquipmentV2 & {
  equipment_type: string;
};

// ============================================
// CREATE PAYLOADS
// ============================================

export interface MachineCreatePayload {
  make: string;
  year?: number;
  model?: string;
  color?: string;
  serial_number?: string;
  current_hours?: number;
  tracker_status?: TrackerStatus;
  hour_rate?: number;
  assigned_team_member?: number;
  service_status?: ServiceStatus;
  maintenance_attributes?: Omit<
    MaintenanceAttribute,
    "id" | "need_maintenance"
  >[];
}

export interface VehicleCreatePayload {
  make: string;
  year?: number;
  model?: string;
  color?: string;
  serial_number?: string;
  current_miles?: number;
  license_plate?: string;
  assigned_team_member?: number;
  service_status?: ServiceStatus;
}

export interface TrailerCreatePayload {
  make: string;
  year?: number;
  model?: string;
  color?: string;
  serial_number?: string;
  tracker_status?: TrackerStatus;
  license_plate?: string;
  assigned_team_member?: number;
  service_status?: ServiceStatus;
}

// Union type for any equipment create payload
export type EquipmentCreatePayload =
  | MachineCreatePayload
  | VehicleCreatePayload
  | TrailerCreatePayload;

// ============================================
// UPDATE PAYLOADS
// ============================================

export interface MachineUpdatePayload extends Partial<MachineCreatePayload> {
  make?: string;
}

export interface VehicleUpdatePayload extends Partial<VehicleCreatePayload> {
  make?: string;
}

export interface TrailerUpdatePayload extends Partial<TrailerCreatePayload> {
  make?: string;
}

// ============================================
// LIST PARAMS
// ============================================

export interface EquipmentListParams extends BaseListParams {
  make?: string;
  year?: number;
  model?: string;
  color?: string;
  service_status?: ServiceStatus;
  trashed?: boolean;
  /** Comma-separated machine,vehicle,trailer for unified `/equipment/all/` list */
  equipment_type?: string;
}

// ============================================
// RESPONSES
// ============================================

export type PaginatedEquipmentResponse<T> = PaginatedResponseAlt<T>;
export type PaginatedMachineResponse = PaginatedEquipmentResponse<MachineV2>;
export type PaginatedVehicleResponse = PaginatedEquipmentResponse<VehicleV2>;
export type PaginatedTrailerResponse = PaginatedEquipmentResponse<TrailerV2>;
