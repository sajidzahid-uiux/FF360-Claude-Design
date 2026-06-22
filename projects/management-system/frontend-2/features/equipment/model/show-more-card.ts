import type { MachineV2, TrailerV2 } from "@/api/types";

export type ImageValue = File | string | null | undefined;

export type MachineDetailRecord = Omit<
  MachineV2,
  "id" | "assigned_team_member" | "equipment_image" | "serial_number_image"
> & {
  id: string;
  name?: string;
  assigned_team_member?: string | null;
  equipment_image?: ImageValue;
  serial_number_image?: ImageValue;
};

export type TrailerDetailRecord = Omit<
  TrailerV2,
  | "id"
  | "assigned_team_member"
  | "equipment_image"
  | "insurance_image"
  | "registration_image"
  | "serial_number_image"
> & {
  id: string;
  name?: string;
  assigned_team_member?: string | null;
  equipment_image?: ImageValue;
  insurance_image?: ImageValue;
  registration_image?: ImageValue;
  serial_number_image?: ImageValue;
};

export interface ShowMoreCardAccessProps {
  isTrashed?: boolean;
  onRestore?: () => void;
  onDelete?: () => void;
  hasRestorePermission?: boolean;
  hasDeletePermission?: boolean;
  canDelete?: boolean;
  canWrite?: boolean;
  canRead?: boolean;
}

export interface ShowMoreMachineCardProps extends ShowMoreCardAccessProps {
  equipment: MachineDetailRecord;
  onClose: () => void;
}

export interface ShowMoreTrailerCardProps extends ShowMoreCardAccessProps {
  equipment: TrailerDetailRecord;
  onClose: () => void;
}

export type MachineEditableFields = {
  serial_number?: string | null;
  current_hours?: string | number | null;
  hour_rate?: string | number | null;
  tracker_status?: string;
  assigned_team_member?: string | null;
  year?: string | number | null;
  make?: string | null;
  model?: string | null;
  color?: string | null;
};

export type TrailerEditableFields = {
  serial_number?: string;
  license_plate?: string;
  tracker_status?: string;
  assigned_team_member?: string | null;
  year?: string | number | null;
  make?: string | null;
  model?: string | null;
  color?: string | null;
};

export type EditingFilterValues = {
  last_changed: string;
  threshold: string;
  filter_number: string;
};
