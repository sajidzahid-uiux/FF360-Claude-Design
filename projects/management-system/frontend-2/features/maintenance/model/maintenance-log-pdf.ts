import type { Maintenance, RecordEquipment, TeamMember } from "@/api/types";

export type MaintenanceLogPdfItem = Pick<
  Maintenance,
  "date" | "description"
> & {
  assigned_to?: number[] | null;
};

export type MaintenanceLogPdfEquipmentInfo = Pick<
  RecordEquipment,
  "name" | "serial_number"
> & {
  equipment_type?: string;
};

export interface MaintenanceLogPdfCompanyInfo {
  name: string;
  email?: string;
  logo?: string | null;
  address?: string;
  phone?: string;
}

export interface MaintenanceLogPdfProps {
  equipmentInfo: MaintenanceLogPdfEquipmentInfo;
  maintenanceLogs: MaintenanceLogPdfItem[];
  teamData: TeamMember[];
  companyInfo: MaintenanceLogPdfCompanyInfo;
}
