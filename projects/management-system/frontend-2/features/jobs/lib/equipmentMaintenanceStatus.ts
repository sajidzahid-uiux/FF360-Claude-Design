import type { EquipmentMaintenanceCheckResponse } from "@/features/jobs";

export interface MaintenanceDueSoonEntry {
  filter: string;
  hoursLeft: number | null;
}

export interface TransformedMaintenanceByMachine {
  [machineName: string]: {
    overdue: string[];
    dueSoon: MaintenanceDueSoonEntry[];
  };
}

export interface MaintenanceStatusBadge {
  status: "Overdue" | "Due Soon" | "Good";
  bgColor: string;
  textColor: string;
  dotClassName: string;
  remainingHours: number | null;
}

const OVERDUE_REGEX = /^(.*?)\s+([a-zA-Z0-9_]+)\s+needs maintenance$/i;
const DUE_SOON_REGEX =
  /^(.*?)\s+([a-zA-Z0-9_]+)\s+is close to maintenance,?\s*([\d.]+)?\s*hours left/i;

export function transformMaintenanceData(
  data: EquipmentMaintenanceCheckResponse
): TransformedMaintenanceByMachine {
  const transformed: TransformedMaintenanceByMachine = {};

  for (const item of data.need_maintenance) {
    const match = item.match(OVERDUE_REGEX);
    if (!match) continue;
    const machineName = match[1].trim().toLowerCase();
    const filter = match[2].trim().toLowerCase();
    if (!transformed[machineName]) {
      transformed[machineName] = { overdue: [], dueSoon: [] };
    }
    if (!transformed[machineName].overdue.includes(filter)) {
      transformed[machineName].overdue.push(filter);
    }
  }

  for (const item of data.close_to_maintenance) {
    const match = item.match(DUE_SOON_REGEX);
    if (!match) continue;
    const machineName = match[1].trim().toLowerCase();
    const filter = match[2].trim().toLowerCase();
    const hoursLeft = match[3] ? parseFloat(match[3]) : null;
    if (!transformed[machineName]) {
      transformed[machineName] = { overdue: [], dueSoon: [] };
    }
    if (
      !transformed[machineName].dueSoon.some((entry) => entry.filter === filter)
    ) {
      transformed[machineName].dueSoon.push({ filter, hoursLeft });
    }
  }

  return transformed;
}

export function getMaintenanceFilters(
  equipmentName: string,
  maintenanceData: EquipmentMaintenanceCheckResponse
): { overdue: string[]; dueSoon: MaintenanceDueSoonEntry[] } {
  const key = equipmentName.toLowerCase();
  const entry = transformMaintenanceData(maintenanceData)[key];
  return entry ?? { overdue: [], dueSoon: [] };
}

export function getMaintenanceStatus(
  equipmentName: string,
  attrTitle: string,
  maintenanceData: EquipmentMaintenanceCheckResponse
): MaintenanceStatusBadge {
  const equipmentNameLower = equipmentName.toLowerCase();
  const attrTitleLower = attrTitle.toLowerCase();
  const transformed = transformMaintenanceData(maintenanceData);
  const equipmentEntry = transformed[equipmentNameLower];

  const needsMaintenance =
    equipmentEntry?.overdue.includes(attrTitleLower) ?? false;
  const dueSoonEntry = equipmentEntry?.dueSoon.find(
    (entry) => entry.filter === attrTitleLower
  );

  if (needsMaintenance) {
    return {
      status: "Overdue",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      dotClassName: "bg-red-500",
      remainingHours: null,
    };
  }
  if (dueSoonEntry) {
    return {
      status: "Due Soon",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      dotClassName: "bg-yellow-500",
      remainingHours: dueSoonEntry.hoursLeft,
    };
  }
  return {
    status: "Good",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    dotClassName: "bg-green-500",
    remainingHours: null,
  };
}
