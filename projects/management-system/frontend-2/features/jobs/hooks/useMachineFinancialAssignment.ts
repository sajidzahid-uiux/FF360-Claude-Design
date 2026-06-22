import { useEffect, useMemo, useRef, useState } from "react";

import { toast } from "sonner";

import type { FinancialMachineAssignment } from "@/api/types";
import { JobType } from "@/constants";
import { matchAssignedMachines } from "@/features/jobs/ui/financial-tab/lib/assignedMachines";
import { formatFinancialAmount } from "@/features/jobs/ui/financial-tab/lib/formatAmount";
import type {
  JobEquipmentEntry,
  MachineCalculations,
} from "@/features/jobs/ui/financial-tab/types";
import { EMPTY_MACHINE_CALCULATIONS } from "@/features/jobs/ui/financial-tab/types";
import {
  useCreateFinancialMachineAssignment,
  useUpdateFinancialMachineAssignment,
} from "@/hooks/mutations";
import { useFinancialMachineAssignments } from "@/hooks/queries";

type MachineCalculationMode = "backend" | "client";

interface UseMachineFinancialAssignmentOptions {
  jobId: number;
  jobType: JobType.EXCAVATION | JobType.TILING;
  jobEquipments: JobEquipmentEntry[];
  allEquipment: Array<{
    id: number;
    hour_rate?: number | string | null;
    machine_name?: string;
  }>;
  calculationMode: MachineCalculationMode;
}

function getBackendMachineCalculations(
  assignment: FinancialMachineAssignment | undefined
): MachineCalculations {
  if (!assignment) {
    return EMPTY_MACHINE_CALCULATIONS;
  }

  return {
    budgetHoursCost: formatFinancialAmount(assignment.budget_hours_cost),
    actualHoursCost: formatFinancialAmount(assignment.actual_hours_cost),
    budgetTotalCost: formatFinancialAmount(assignment.budget_total_cost),
    actualTotalCost: formatFinancialAmount(assignment.actual_total_cost),
    machineBudgetProfit: formatFinancialAmount(
      assignment.machine_budget_profit
    ),
    machineActualProfit: formatFinancialAmount(
      assignment.machine_actual_profit
    ),
  };
}

function getClientMachineCalculations(
  machineBudgetHours: string,
  selectedMachineActualHours: string,
  machineRate: string,
  machineLaborCostPerHour: string
): MachineCalculations {
  const budgetHoursVal = parseFloat(machineBudgetHours) || 0;
  const actualHoursVal = parseFloat(selectedMachineActualHours) || 0;
  const machineRateVal = parseFloat(machineRate) || 0;
  const machineLaborCostVal = parseFloat(machineLaborCostPerHour) || 0;

  const budgetHoursCost = (budgetHoursVal * machineRateVal).toFixed(2);
  const actualHoursCost = (actualHoursVal * machineRateVal).toFixed(2);
  const budgetTotalCost = (budgetHoursVal * machineLaborCostVal).toFixed(2);
  const actualTotalCost = (actualHoursVal * machineLaborCostVal).toFixed(2);

  return {
    budgetHoursCost,
    actualHoursCost,
    budgetTotalCost,
    actualTotalCost,
    machineBudgetProfit: (
      parseFloat(budgetHoursCost) - parseFloat(budgetTotalCost)
    ).toFixed(2),
    machineActualProfit: (
      parseFloat(budgetHoursCost) - parseFloat(actualTotalCost)
    ).toFixed(2),
  };
}

export function useMachineFinancialAssignment({
  jobId,
  jobType,
  jobEquipments,
  allEquipment,
  calculationMode,
}: UseMachineFinancialAssignmentOptions) {
  const {
    data: machineAssignments = [],
    isLoading: machineAssignmentsLoading,
  } = useFinancialMachineAssignments(jobId, jobType);

  const createFinancialMachineAssignment =
    useCreateFinancialMachineAssignment();
  const updateFinancialMachineAssignment =
    useUpdateFinancialMachineAssignment();

  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [machineBudgetHours, setMachineBudgetHours] = useState<string>("");
  const [machineRate, setMachineRate] = useState<string>("");
  const [machineLaborCostPerHour, setMachineLaborCostPerHour] =
    useState<string>("");

  const lastLoadedMachineRef = useRef<string>("");
  const lastAssignmentDataRef = useRef<string>("");

  const assignedMachines = useMemo(
    () => matchAssignedMachines(jobEquipments, allEquipment),
    [jobEquipments, allEquipment]
  );

  const selectedMachineActualHours = useMemo(() => {
    if (!selectedMachine) {
      return calculationMode === "backend" ? "0.00" : "";
    }

    const jobEquipment = assignedMachines.find(
      (eq) => eq.id.toString() === selectedMachine
    );

    if (!jobEquipment) {
      return calculationMode === "backend" ? "0.00" : "";
    }

    if (calculationMode === "client") {
      return jobEquipment.total_hours?.toString() || "0.00";
    }

    const assignment = machineAssignments.find(
      (ma) => ma.job_equipment === jobEquipment.id
    );

    return assignment?.actual_hours
      ? formatFinancialAmount(assignment.actual_hours)
      : "0.00";
  }, [selectedMachine, assignedMachines, machineAssignments, calculationMode]);

  const machineAssignmentsHash = useMemo(
    () =>
      machineAssignments
        .map(
          (ma) =>
            `${ma.job_equipment}-${ma.budget_hours || ""}-${
              ma.machine_rate || ""
            }-${ma.machine_labor_cost_per_hour || ""}`
        )
        .join("|"),
    [machineAssignments]
  );

  const assignedMachinesHash = useMemo(
    () =>
      assignedMachines
        .map((eq) => `${eq.id}-${eq.equipment?.hour_rate || ""}`)
        .join("|"),
    [assignedMachines]
  );

  useEffect(() => {
    if (!selectedMachine) {
      if (lastLoadedMachineRef.current !== "") {
        lastLoadedMachineRef.current = "";
        lastAssignmentDataRef.current = "";
      }
      return;
    }

    const jobEquipment = assignedMachines.find(
      (eq) => eq.id.toString() === selectedMachine
    );
    if (!jobEquipment) {
      return;
    }

    const existingAssignment = machineAssignments.find(
      (ma) => ma.job_equipment === jobEquipment.id
    );

    const assignmentDataHash = existingAssignment
      ? `${existingAssignment.budget_hours || ""}-${
          existingAssignment.machine_rate || ""
        }-${existingAssignment.machine_labor_cost_per_hour || ""}`
      : "new";

    if (
      selectedMachine === lastLoadedMachineRef.current &&
      assignmentDataHash === lastAssignmentDataRef.current
    ) {
      return;
    }

    if (existingAssignment) {
      setMachineBudgetHours(existingAssignment.budget_hours || "");
      setMachineRate(existingAssignment.machine_rate || "");
      setMachineLaborCostPerHour(
        existingAssignment.machine_labor_cost_per_hour || ""
      );
    } else {
      setMachineRate(jobEquipment.equipment?.hour_rate?.toString() || "");
      setMachineBudgetHours("");
      setMachineLaborCostPerHour("");
    }

    lastLoadedMachineRef.current = selectedMachine;
    lastAssignmentDataRef.current = assignmentDataHash;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMachine, machineAssignmentsHash, assignedMachinesHash]);

  const machineCalculations = useMemo((): MachineCalculations => {
    if (!selectedMachine) {
      return EMPTY_MACHINE_CALCULATIONS;
    }

    const jobEquipment = assignedMachines.find(
      (eq) => eq.id.toString() === selectedMachine
    );
    if (!jobEquipment) {
      return EMPTY_MACHINE_CALCULATIONS;
    }

    if (calculationMode === "client") {
      return getClientMachineCalculations(
        machineBudgetHours,
        selectedMachineActualHours,
        machineRate,
        machineLaborCostPerHour
      );
    }

    const assignment = machineAssignments.find(
      (ma) => ma.job_equipment === jobEquipment.id
    );

    return getBackendMachineCalculations(assignment);
  }, [
    selectedMachine,
    assignedMachines,
    machineAssignments,
    calculationMode,
    machineBudgetHours,
    selectedMachineActualHours,
    machineRate,
    machineLaborCostPerHour,
  ]);

  const handleMachineAssignmentSave = async () => {
    if (!selectedMachine) {
      toast.error("Please select a machine");
      return;
    }

    const jobEquipment = assignedMachines.find(
      (eq) => eq.id.toString() === selectedMachine
    );
    if (!jobEquipment) {
      toast.error("Selected machine not found");
      return;
    }

    const existingAssignment = machineAssignments.find(
      (ma) => ma.job_equipment === jobEquipment.id
    );

    try {
      if (existingAssignment) {
        await updateFinancialMachineAssignment.mutateAsync({
          jobId,
          jobType,
          assignmentId: existingAssignment.id,
          data: {
            budget_hours: machineBudgetHours || null,
            machine_rate: machineRate || null,
            machine_labor_cost_per_hour: machineLaborCostPerHour || null,
          },
        });
      } else {
        await createFinancialMachineAssignment.mutateAsync({
          jobId,
          jobType,
          data: {
            job_equipment: jobEquipment.id,
            budget_hours: machineBudgetHours || null,
            machine_rate:
              machineRate ||
              jobEquipment.equipment?.hour_rate?.toString() ||
              null,
            machine_labor_cost_per_hour: machineLaborCostPerHour || null,
          },
        });
      }

      setSelectedMachine("");
      setMachineBudgetHours("");
      setMachineRate("");
      setMachineLaborCostPerHour("");
      toast.success("Machine assignment saved successfully");
    } catch (error) {
      console.error("Error saving machine assignment:", error);
    }
  };

  const handleMachineAssignmentCancel = () => {
    setSelectedMachine("");
    setMachineBudgetHours("0");
    setMachineRate("0");
    setMachineLaborCostPerHour("0");
  };

  return {
    assignedMachines,
    machineAssignments,
    machineAssignmentsLoading,
    selectedMachine,
    setSelectedMachine,
    machineBudgetHours,
    setMachineBudgetHours,
    machineRate,
    setMachineRate,
    machineLaborCostPerHour,
    setMachineLaborCostPerHour,
    selectedMachineActualHours,
    machineCalculations,
    handleMachineAssignmentSave,
    handleMachineAssignmentCancel,
  };
}

export type UseMachineFinancialAssignmentReturn = ReturnType<
  typeof useMachineFinancialAssignment
>;
