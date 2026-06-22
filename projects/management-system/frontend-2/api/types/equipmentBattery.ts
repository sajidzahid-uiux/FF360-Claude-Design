import type { ApiSuccessResponse, IdOf } from "./common";
import type { BaseEquipmentV2, MachineV2, VehicleV2 } from "./equipment";

export interface BatteryType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export type BatteryTypeListApiResponse = ApiSuccessResponse<BatteryType[]>;
export type BatteryTypeApiResponse = ApiSuccessResponse<BatteryType>;
export type BatteryTypeDeleteApiResponse = ApiSuccessResponse<null>;

export interface BatteryReplacementRecord {
  id: number;
  equipment: number;
  battery_type: number | null;
  battery_type_name: string | null;
  replacement_date: string | null;
  battery_lifetime_years: string | null;
  battery_lifetime_display: string | null;
  next_replacement_date: string | null;
  warranty_details: string | null;
  battery_image: string | null;
  battery_warranty_image: string | null;
  battery_image_url: string | null;
  battery_warranty_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type BatteryReplacementApiResponse =
  ApiSuccessResponse<BatteryReplacementRecord | null>;

export type BatteryReplacementMutationApiResponse =
  ApiSuccessResponse<BatteryReplacementRecord>;

export type BatteryLifetimeYears =
  | 1.0
  | 1.5
  | 2.0
  | 2.5
  | 3.0
  | 3.5
  | 4.0
  | 4.5
  | 5.0
  | 5.5
  | 6.0
  | 6.5
  | 7.0
  | 7.5
  | 8.0
  | 8.5
  | 9.0
  | 9.5
  | 10.0;

export interface BatteryReplacementData {
  battery_type?: number;
  replacement_date?: string;
  battery_lifetime_years?: BatteryLifetimeYears;
  warranty_details?: string;
}

export interface BatteryReplacementFiles {
  battery_image?: File | null;
  battery_warranty_image?: File | null;
}

export interface BatteryTypeCreatePayload {
  name: string;
}

export interface BatteryTypeUpdatePayload {
  typeId: IdOf<BatteryType>;
  name: string;
}

export interface BatteryTypeDeletePayload {
  typeId: IdOf<BatteryType>;
}

export interface EquipmentBatteryReplacementCreateArgs {
  equipmentId: IdOf<BaseEquipmentV2>;
  data: BatteryReplacementData;
  files?: BatteryReplacementFiles;
}

export interface MachineBatteryReplacementCreateArgs {
  machineId: IdOf<MachineV2>;
  data: BatteryReplacementData;
  files?: BatteryReplacementFiles;
}

export interface VehicleBatteryReplacementCreateArgs {
  vehicleId: IdOf<VehicleV2>;
  data: BatteryReplacementData;
  files?: BatteryReplacementFiles;
}

export interface EquipmentBatteryReplacementUpdateArgs extends EquipmentBatteryReplacementCreateArgs {
  id: IdOf<BatteryReplacementRecord>;
}

export interface MachineBatteryReplacementUpdateArgs extends MachineBatteryReplacementCreateArgs {
  id: IdOf<BatteryReplacementRecord>;
}

export interface VehicleBatteryReplacementUpdateArgs extends VehicleBatteryReplacementCreateArgs {
  id: IdOf<BatteryReplacementRecord>;
}

export interface EquipmentBatteryReplacementDeleteArgs {
  equipmentId: IdOf<BaseEquipmentV2>;
  id: IdOf<BatteryReplacementRecord>;
}

export interface MachineBatteryReplacementDeleteArgs {
  machineId: IdOf<MachineV2>;
  id: IdOf<BatteryReplacementRecord>;
}

export interface VehicleBatteryReplacementDeleteArgs {
  vehicleId: IdOf<VehicleV2>;
  id: IdOf<BatteryReplacementRecord>;
}
