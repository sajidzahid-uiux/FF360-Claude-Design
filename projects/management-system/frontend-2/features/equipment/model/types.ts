import type {
  EquipmentListRow,
  MachineV2,
  MaintenanceAttribute,
  TrailerV2,
  VehicleV2,
} from "@/api/types";

export type EquipmentPageData = EquipmentListRow;

export type MachinePageData = MachineV2 & { equipment_type: string };
export type VehiclePageData = VehicleV2 & { equipment_type: string };
export type TrailerPageData = TrailerV2 & { equipment_type: string };

export interface MachineSubmitData {
  make: string;
  year?: number;
  model?: string;
  color?: string;
  assigned_team_member?: string;
  current_hours?: number;
  hour_rate?: number;
  tracker_status?: string;
  serial_number?: string;
  equipment_image: File | null;
  serial_number_image: File | null;
  maintenance_attributes?: Array<{
    title: string;
    last_changed?: number;
    threshold?: number;
    filter_number?: string | null;
    automatic: boolean;
  }>;
}

export interface VehicleSubmitData {
  make: string;
  year?: number;
  model?: string;
  color?: string;
  assigned_team_member?: string;
  current_miles?: number;
  tracker_status?: string;
  license_plate?: string;
  serial_number?: string;
  equipment_image: File | null;
  registration_image: File | null;
  insurance_image: File | null;
  serial_number_image: File | null;
  maintenance_attributes?: Array<{
    title: string;
    last_changed?: number;
    threshold?: number;
    filter_number?: string | null;
    automatic: boolean;
  }>;
}

export interface TrailerSubmitData {
  make: string;
  year?: number;
  model?: string;
  color?: string;
  assigned_team_member?: string;
  tracker_status?: string;
  license_plate?: string;
  serial_number?: string;
  equipment_image: File | null;
  insurance_image: File | null;
  registration_image: File | null;
  serial_number_image: File | null;
}

export type { MaintenanceAttribute };
