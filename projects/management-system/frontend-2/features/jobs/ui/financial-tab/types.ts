import type { MachineV2 } from "@/api/types";

export type JobEquipmentEntry = {
  id: number;
  equipment: number | { id: number };
  total_hours: number;
};

export type AssignedMachine = JobEquipmentEntry & { equipment: MachineV2 };

export interface FinancialTabBaseProps {
  jobId: number;
  jobEquipments: JobEquipmentEntry[];
  salesPriceFromLead?: string | null;
  disabled?: boolean;
}

export type MachineCalculations = {
  budgetHoursCost: string;
  actualHoursCost: string;
  budgetTotalCost: string;
  actualTotalCost: string;
  machineBudgetProfit: string;
  machineActualProfit: string;
};

export const EMPTY_MACHINE_CALCULATIONS: MachineCalculations = {
  budgetHoursCost: "0.00",
  actualHoursCost: "0.00",
  budgetTotalCost: "0.00",
  actualTotalCost: "0.00",
  machineBudgetProfit: "0.00",
  machineActualProfit: "0.00",
};
