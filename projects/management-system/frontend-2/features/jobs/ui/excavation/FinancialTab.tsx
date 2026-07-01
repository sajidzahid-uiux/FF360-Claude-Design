"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Dropdown,
} from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { MachineV2 } from "@/api/types";
import { EquipmentType, JobType } from "@/constants";
import { useRecordEquipment, useUnitSystem } from "@/hooks";
import {
  useCreateFinancialMachineAssignment,
  useUpdateFinancialMachineAssignment,
  useUpdateJobFinancial,
} from "@/hooks/mutations";
import {
  useFinancialMachineAssignments,
  useJobFinancial,
} from "@/hooks/queries";
import { DetailViewEditActions } from "@/shared/ui/common";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  SanitizedInput,
  SanitizedTextarea,
} from "@/shared/ui/primitives";
import { Tooltip } from "@/shared/ui/primitives/tooltip";

type JobEquipmentEntry = {
  id: number;
  equipment: number | { id: number };
  total_hours: number;
};

type AssignedMachine = JobEquipmentEntry & { equipment: MachineV2 };

interface FinancialTabProps {
  jobId: number;
  jobEquipments: JobEquipmentEntry[];
  salesPriceFromLead?: string | null;
  disabled?: boolean;
}

export default function FinancialTab({
  jobId,
  jobEquipments,
  salesPriceFromLead,
  disabled = false,
}: FinancialTabProps) {
  const unitSystem = useUnitSystem();
  const distUnit = unitSystem === "metric" ? "Kilometers" : "Miles";

  // Fetch financial data
  const { data: financialData, isLoading: financialLoading } = useJobFinancial(
    jobId,
    JobType.EXCAVATION
  );

  // Fetch machine assignments
  const {
    data: machineAssignments = [],
    isLoading: machineAssignmentsLoading,
  } = useFinancialMachineAssignments(jobId, JobType.EXCAVATION);

  // Fetch all equipment to get details for job equipments
  const { data: allEquipmentData } = useRecordEquipment({
    equipmentType: EquipmentType.MACHINES,
    paginate: false,
  });
  const allEquipment = useMemo(
    () => (Array.isArray(allEquipmentData) ? allEquipmentData : []),
    [allEquipmentData]
  );
  const updateJobFinancial = useUpdateJobFinancial();
  const createFinancialMachineAssignment =
    useCreateFinancialMachineAssignment();
  const updateFinancialMachineAssignment =
    useUpdateFinancialMachineAssignment();

  // Explicit edit mode: fields are read-only until the user clicks Edit, then
  // Save/Cancel persist or revert — consistent with every other detail tab.
  const [isEditing, setIsEditing] = useState(false);
  const editDisabled = disabled || !isEditing;

  // Local state for form fields
  const [salesPrice, setSalesPrice] = useState<string>("");
  const [budgetLaborHours, setBudgetLaborHours] = useState<string>("");
  const [actualLaborHours, setActualLaborHours] = useState<string>("");
  const [budgetOperatorHours, setBudgetOperatorHours] = useState<string>("");
  const [actualOperatorHours, setActualOperatorHours] = useState<string>("");
  const [miles, setMiles] = useState<string>("");
  const [milesRate, setMilesRate] = useState<string>("");
  const [travelHours, setTravelHours] = useState<string>("");
  const [travelRate, setTravelRate] = useState<string>("");
  const [materialDescription, setMaterialDescription] = useState<string>("");
  const [materialPrice, setMaterialPrice] = useState<string>("");

  // Machine assignment state
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [machineBudgetHours, setMachineBudgetHours] = useState<string>("");
  const [machineRate, setMachineRate] = useState<string>("");
  const [machineLaborCostPerHour, setMachineLaborCostPerHour] =
    useState<string>("");

  // Track original financial values to detect changes
  const [originalFinancialValues, setOriginalFinancialValues] = useState({
    salesPrice: "",
    budgetLaborHours: "",
    actualLaborHours: "",
    budgetOperatorHours: "",
    actualOperatorHours: "",
    miles: "",
    milesRate: "",
    travelHours: "",
    travelRate: "",
    materialDescription: "",
    materialPrice: "",
  });

  // Initialize form from financial data
  useEffect(() => {
    if (financialData) {
      const salesPriceValue =
        financialData.sales_price || salesPriceFromLead || "";
      const budgetLaborHoursValue = financialData.budget_labor_hours || "";
      const actualLaborHoursValue =
        financialData.actual_labor_hours?.toString() || "";
      const budgetOperatorHoursValue =
        financialData.budget_operator_hours || "";
      const actualOperatorHoursValue =
        financialData.actual_operator_hours || "";
      const milesValue = financialData.miles || "";
      const milesRateValue = financialData.miles_rate || "";
      const travelHoursValue = financialData.travel_hours || "";
      const travelRateValue = financialData.travel_rate || "";
      const materialDescriptionValue = financialData.material_description || "";
      const materialPriceValue = financialData.material_price || "";

      setSalesPrice(salesPriceValue);
      setBudgetLaborHours(budgetLaborHoursValue);
      // Only set actual labor hours from financial data if not already set from time tracking
      const currentActualHours = actualLaborHours;
      if (!currentActualHours || currentActualHours === "0") {
        setActualLaborHours(actualLaborHoursValue);
      }
      setBudgetOperatorHours(budgetOperatorHoursValue);
      setActualOperatorHours(actualOperatorHoursValue);
      setMiles(milesValue);
      setMilesRate(milesRateValue);
      setTravelHours(travelHoursValue);
      setTravelRate(travelRateValue);
      setMaterialDescription(materialDescriptionValue);
      setMaterialPrice(materialPriceValue);

      // Store original values (use actualLaborHours state if it was set from time tracking)
      setOriginalFinancialValues({
        salesPrice: salesPriceValue,
        budgetLaborHours: budgetLaborHoursValue,
        actualLaborHours:
          currentActualHours && currentActualHours !== "0"
            ? currentActualHours
            : actualLaborHoursValue,
        budgetOperatorHours: budgetOperatorHoursValue,
        actualOperatorHours: actualOperatorHoursValue,
        miles: milesValue,
        milesRate: milesRateValue,
        travelHours: travelHoursValue,
        travelRate: travelRateValue,
        materialDescription: materialDescriptionValue,
        materialPrice: materialPriceValue,
      });
    } else if (salesPriceFromLead) {
      setSalesPrice(salesPriceFromLead);
      setOriginalFinancialValues({
        salesPrice: salesPriceFromLead,
        budgetLaborHours: "",
        actualLaborHours: "",
        budgetOperatorHours: "",
        actualOperatorHours: "",
        miles: "",
        milesRate: "",
        travelHours: "",
        travelRate: "",
        materialDescription: "",
        materialPrice: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialData, salesPriceFromLead]);

  // Use values directly from backend
  const totalMilesCost = financialData?.total_miles_cost
    ? parseFloat(financialData.total_miles_cost.toString()).toFixed(2)
    : "0.00";

  const totalTravelCost = financialData?.total_travel_cost
    ? parseFloat(financialData.total_travel_cost.toString()).toFixed(2)
    : "0.00";

  const totalCost = financialData?.total_cost
    ? parseFloat(financialData.total_cost.toString()).toFixed(2)
    : "0.00";

  const budgetProfit = financialData?.budget_profit
    ? parseFloat(financialData.budget_profit.toString()).toFixed(2)
    : "0.00";

  const actualProfit = financialData?.actual_profit
    ? parseFloat(financialData.actual_profit.toString()).toFixed(2)
    : "0.00";

  // Get machines assigned to this job (only machines, not vehicles/trailers)
  const assignedMachines = useMemo(() => {
    if (!jobEquipments || jobEquipments.length === 0) return [];
    if (!allEquipment || allEquipment.length === 0) return [];

    // Match job equipment with full equipment details
    const matched = jobEquipments
      .map((jobEq) => {
        const equipmentId =
          typeof jobEq.equipment === "object"
            ? jobEq.equipment?.id
            : jobEq.equipment;

        if (!equipmentId) return null;

        // Find the full equipment details
        const fullEquipment = allEquipment.find(
          (eq) => eq.id === equipmentId
        ) as MachineV2 | undefined;

        if (!fullEquipment) return null;

        return {
          ...jobEq,
          equipment: fullEquipment,
        };
      })
      .filter((item): item is AssignedMachine => item !== null);

    return matched;
  }, [jobEquipments, allEquipment]);

  // Get actual hours for selected machine from backend
  const selectedMachineActualHours = useMemo(() => {
    if (!selectedMachine) return "0.00";
    const jobEquipment = assignedMachines.find(
      (eq) => eq.id.toString() === selectedMachine
    );
    if (!jobEquipment) return "0.00";
    const assignment = machineAssignments.find(
      (ma) => ma.job_equipment === jobEquipment.id
    );
    return assignment?.actual_hours
      ? parseFloat(assignment.actual_hours.toString()).toFixed(2)
      : "0.00";
  }, [selectedMachine, assignedMachines, machineAssignments]);

  // Track last loaded machine and assignment data to prevent infinite loops
  const lastLoadedMachineRef = useRef<string>("");
  const lastAssignmentDataRef = useRef<string>("");

  // Create stable string representation of machine assignments for comparison
  const machineAssignmentsHash = useMemo(() => {
    return machineAssignments
      .map(
        (ma) =>
          `${ma.job_equipment}-${ma.budget_hours || ""}-${
            ma.machine_rate || ""
          }-${ma.machine_labor_cost_per_hour || ""}`
      )
      .join("|");
  }, [machineAssignments]);

  // Create stable string representation of assigned machines for comparison
  const assignedMachinesHash = useMemo(() => {
    return assignedMachines
      .map((eq) => `${eq.id}-${eq.equipment?.hour_rate || ""}`)
      .join("|");
  }, [assignedMachines]);

  // When machine is selected, load existing assignment or save original values
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
    if (!jobEquipment) return;

    // Check if assignment already exists
    const existingAssignment = machineAssignments.find(
      (ma) => ma.job_equipment === jobEquipment.id
    );

    // Create a hash of the assignment data to detect changes
    const assignmentDataHash = existingAssignment
      ? `${existingAssignment.budget_hours || ""}-${
          existingAssignment.machine_rate || ""
        }-${existingAssignment.machine_labor_cost_per_hour || ""}`
      : "new";

    // Skip if we've already loaded this exact machine with the same data
    if (
      selectedMachine === lastLoadedMachineRef.current &&
      assignmentDataHash === lastAssignmentDataRef.current
    ) {
      return;
    }

    if (existingAssignment) {
      // Load existing assignment values
      const budgetHours = existingAssignment.budget_hours || "";
      const rate = existingAssignment.machine_rate || "";
      const laborCost = existingAssignment.machine_labor_cost_per_hour || "";

      setMachineBudgetHours(budgetHours);
      setMachineRate(rate);
      setMachineLaborCostPerHour(laborCost);
    } else {
      // New assignment - set default rate from equipment
      const defaultRate = jobEquipment.equipment?.hour_rate?.toString() || "";
      setMachineRate(defaultRate);
      setMachineBudgetHours("");
      setMachineLaborCostPerHour("");
    }

    // Mark this machine and data as loaded
    lastLoadedMachineRef.current = selectedMachine;
    lastAssignmentDataRef.current = assignmentDataHash;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMachine, machineAssignmentsHash, assignedMachinesHash]);

  // Check if financial data has changed
  const hasFinancialChanges = useMemo(() => {
    return (
      salesPrice !== originalFinancialValues.salesPrice ||
      budgetLaborHours !== originalFinancialValues.budgetLaborHours ||
      actualLaborHours !== originalFinancialValues.actualLaborHours ||
      budgetOperatorHours !== originalFinancialValues.budgetOperatorHours ||
      actualOperatorHours !== originalFinancialValues.actualOperatorHours ||
      miles !== originalFinancialValues.miles ||
      milesRate !== originalFinancialValues.milesRate ||
      travelHours !== originalFinancialValues.travelHours ||
      travelRate !== originalFinancialValues.travelRate ||
      materialDescription !== originalFinancialValues.materialDescription ||
      materialPrice !== originalFinancialValues.materialPrice
    );
  }, [
    salesPrice,
    budgetLaborHours,
    actualLaborHours,
    budgetOperatorHours,
    actualOperatorHours,
    miles,
    milesRate,
    travelHours,
    travelRate,
    materialDescription,
    materialPrice,
    originalFinancialValues,
  ]);

  // Handle save
  const handleSave = async () => {
    try {
      await updateJobFinancial.mutateAsync({
        jobId,
        jobType: JobType.EXCAVATION,
        data: {
          sales_price: salesPrice || null,
          budget_labor_hours: budgetLaborHours || null,
          budget_operator_hours: budgetOperatorHours || null,
          actual_operator_hours: actualOperatorHours || null,
          miles: miles || null,
          miles_rate: milesRate || null,
          travel_hours: travelHours || null,
          travel_rate: travelRate || null,
          material_description: materialDescription || null,
          material_price: materialPrice || null,
        },
      });
      // Update original values after successful save
      setOriginalFinancialValues({
        salesPrice: salesPrice || "",
        budgetLaborHours: budgetLaborHours || "",
        actualLaborHours: actualLaborHours || "",
        budgetOperatorHours: budgetOperatorHours || "",
        actualOperatorHours: actualOperatorHours || "",
        miles: miles || "",
        milesRate: milesRate || "",
        travelHours: travelHours || "",
        travelRate: travelRate || "",
        materialDescription: materialDescription || "",
        materialPrice: materialPrice || "",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving financial data:", error);
    }
  };

  // Handle cancel - revert changes to original values
  const handleCancel = () => {
    setIsEditing(false);
    setSalesPrice(originalFinancialValues.salesPrice);
    setBudgetLaborHours(originalFinancialValues.budgetLaborHours);
    setActualLaborHours(originalFinancialValues.actualLaborHours);
    setBudgetOperatorHours(originalFinancialValues.budgetOperatorHours);
    setActualOperatorHours(originalFinancialValues.actualOperatorHours);
    setMiles(originalFinancialValues.miles);
    setMilesRate(originalFinancialValues.milesRate);
    setTravelHours(originalFinancialValues.travelHours);
    setTravelRate(originalFinancialValues.travelRate);
    setMaterialDescription(originalFinancialValues.materialDescription);
    setMaterialPrice(originalFinancialValues.materialPrice);
  };

  // Handle machine assignment save
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

    // Check if assignment already exists
    const existingAssignment = machineAssignments.find(
      (ma) => ma.job_equipment === jobEquipment.id
    );

    try {
      if (existingAssignment) {
        // Update existing assignment
        await updateFinancialMachineAssignment.mutateAsync({
          jobId,
          jobType: JobType.EXCAVATION,
          assignmentId: existingAssignment.id,
          data: {
            budget_hours: machineBudgetHours || null,
            machine_rate: machineRate || null,
            machine_labor_cost_per_hour: machineLaborCostPerHour || null,
          },
        });
      } else {
        // Create new assignment
        await createFinancialMachineAssignment.mutateAsync({
          jobId,
          jobType: JobType.EXCAVATION,
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

      // Reset form
      setSelectedMachine("");
      setMachineBudgetHours("");
      setMachineRate("");
      setMachineLaborCostPerHour("");

      toast.success("Machine assignment saved successfully");
    } catch (error) {
      console.error("Error saving machine assignment:", error);
    }
  };

  // Handle machine assignment cancel
  const handleMachineAssignmentCancel = () => {
    setSelectedMachine("");
    setMachineBudgetHours("0");
    setMachineRate("0");
    setMachineLaborCostPerHour("0");
  };

  // Get calculated values from backend for selected machine
  const machineCalculations = useMemo(() => {
    if (!selectedMachine) {
      return {
        budgetHoursCost: "0.00",
        actualHoursCost: "0.00",
        budgetTotalCost: "0.00",
        actualTotalCost: "0.00",
        machineBudgetProfit: "0.00",
        machineActualProfit: "0.00",
      };
    }
    const jobEquipment = assignedMachines.find(
      (eq) => eq.id.toString() === selectedMachine
    );
    if (!jobEquipment) {
      return {
        budgetHoursCost: "0.00",
        actualHoursCost: "0.00",
        budgetTotalCost: "0.00",
        actualTotalCost: "0.00",
        machineBudgetProfit: "0.00",
        machineActualProfit: "0.00",
      };
    }
    const assignment = machineAssignments.find(
      (ma) => ma.job_equipment === jobEquipment.id
    );
    if (!assignment) {
      return {
        budgetHoursCost: "0.00",
        actualHoursCost: "0.00",
        budgetTotalCost: "0.00",
        actualTotalCost: "0.00",
        machineBudgetProfit: "0.00",
        machineActualProfit: "0.00",
      };
    }
    return {
      budgetHoursCost: assignment.budget_hours_cost
        ? parseFloat(assignment.budget_hours_cost.toString()).toFixed(2)
        : "0.00",
      actualHoursCost: assignment.actual_hours_cost
        ? parseFloat(assignment.actual_hours_cost.toString()).toFixed(2)
        : "0.00",
      budgetTotalCost: assignment.budget_total_cost
        ? parseFloat(assignment.budget_total_cost.toString()).toFixed(2)
        : "0.00",
      actualTotalCost: assignment.actual_total_cost
        ? parseFloat(assignment.actual_total_cost.toString()).toFixed(2)
        : "0.00",
      machineBudgetProfit: assignment.machine_budget_profit
        ? parseFloat(assignment.machine_budget_profit.toString()).toFixed(2)
        : "0.00",
      machineActualProfit: assignment.machine_actual_profit
        ? parseFloat(assignment.machine_actual_profit.toString()).toFixed(2)
        : "0.00",
    };
  }, [selectedMachine, assignedMachines, machineAssignments]);

  if (financialLoading || machineAssignmentsLoading) {
    return <div className="p-4">Loading financial data...</div>;
  }

  return (
    <div className="mt-8 flex flex-col gap-4 p-2 sm:p-4">
      {/* Section header: Edit → Save/Cancel, matching every other detail tab. */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-text-primary text-base font-semibold">Financial</h2>
        <div className="flex items-center gap-2">
          <DetailViewEditActions
            canEdit={!disabled}
            canSave={hasFinancialChanges}
            editAriaLabel="Edit financial details"
            editLabel="Edit"
            isEditing={isEditing}
            isSaving={updateJobFinancial.isPending}
            saveLabel="Save"
            size={ComponentSizeEnum.SM}
            onCancel={handleCancel}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="gap-2 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-text-muted text-sm font-medium">
              Sales Price
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <SanitizedInput
              disabled={editDisabled}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={salesPrice}
              onChange={(e) => setSalesPrice(e.target.value)}
            />
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="px-4">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-text-muted text-sm font-medium">
                Total Cost
              </CardTitle>
              <Tooltip
                content={`Total Cost = Total ${distUnit} Cost + Actual Total Cost Of All Machines + Job Materials`}
              />
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-xl font-bold">${totalCost}</div>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="px-4">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-text-muted text-sm font-medium">
                Budget Total Profit
              </CardTitle>
              <Tooltip
                content={`Budget Total Profit = Sales Price – Total ${distUnit} Cost – Total Travel Cost – Actual Total Cost Of All Machines – Job Materials`}
              />
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-xl font-bold">${budgetProfit}</div>
          </CardContent>
        </Card>
        <Card className="gap-2 py-4">
          <CardHeader className="px-4">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-text-muted text-sm font-medium">
                Actual Total Profit
              </CardTitle>
              <Tooltip content="Actual Total Profit = Sales Price – Total Cost" />
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-xl font-bold">${actualProfit}</div>
          </CardContent>
        </Card>
      </div>

      {/* Labor, Operator, Miles/Kilometers, Travel Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Labor Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Labor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label htmlFor="budget-labor-hours" variant="inputBlock">
                Budget Labor Hours
              </Label>
              <SanitizedInput
                disabled={editDisabled}
                id="budget-labor-hours"
                placeholder="0.00"
                step="0.01"
                type="number"
                value={budgetLaborHours}
                onChange={(e) => setBudgetLaborHours(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Label htmlFor="actual-labor-hours" variant="inputBlock">
                  Actual Labor Hours
                </Label>
                <Tooltip content="Actual Labor Hours = Sum of Total Hours From Time Tracking Page" />
              </div>
              <SanitizedInput
                disabled
                readOnly
                className="bg-bg-surface"
                id="actual-labor-hours"
                placeholder="0.00"
                step="0.01"
                type="number"
                value={actualLaborHours}
              />
            </div>
          </CardContent>
        </Card>

        {/* Operator Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Operator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label htmlFor="budget-operator-hours" variant="inputBlock">
                Budget Operator Hours
              </Label>
              <SanitizedInput
                disabled={editDisabled}
                id="budget-operator-hours"
                placeholder="0.00"
                step="0.01"
                type="number"
                value={budgetOperatorHours}
                onChange={(e) => setBudgetOperatorHours(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="actual-operator-hours" variant="inputBlock">
                Actual Operator Hours
              </Label>
              <SanitizedInput
                disabled={editDisabled}
                id="actual-operator-hours"
                placeholder="0.00"
                step="0.01"
                type="number"
                value={actualOperatorHours}
                onChange={(e) => setActualOperatorHours(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Miles/Kilometers Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{distUnit}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="miles" variant="inputBlock">
                  {distUnit}
                </Label>
                <SanitizedInput
                  disabled={editDisabled}
                  id="miles"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={miles}
                  onChange={(e) => setMiles(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="miles-rate" variant="inputBlock">
                  {distUnit} Rate
                </Label>
                <SanitizedInput
                  disabled={editDisabled}
                  id="miles-rate"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={milesRate}
                  onChange={(e) => setMilesRate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Label>Total {distUnit} Cost</Label>
                <Tooltip
                  content={`Total ${distUnit} Cost = ${distUnit} × ${distUnit} Rate`}
                />
              </div>
              <SanitizedInput
                disabled
                className="bg-bg-surface"
                type="text"
                value={`$${totalMilesCost}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Travel Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Travel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="travel-hours" variant="inputBlock">
                  Travel Hours
                </Label>
                <SanitizedInput
                  disabled={editDisabled}
                  id="travel-hours"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={travelHours}
                  onChange={(e) => setTravelHours(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="travel-rate" variant="inputBlock">
                  Travel Rate
                </Label>
                <SanitizedInput
                  disabled={editDisabled}
                  id="travel-rate"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={travelRate}
                  onChange={(e) => setTravelRate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Label>Total Travel Cost</Label>
                <Tooltip content="Total Travel Cost = Travel Hours × Travel Rate" />
              </div>
              <SanitizedInput
                disabled
                className="bg-bg-surface"
                type="text"
                value={`$${totalTravelCost}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Materials Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Job Materials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-1">
              <Label htmlFor="material-description" variant="inputBlock">
                Material Description
              </Label>
              <SanitizedTextarea
                className="min-h-[100px]"
                disabled={editDisabled}
                id="material-description"
                placeholder="Enter material description"
                value={materialDescription}
                onChange={(e) => setMaterialDescription(e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="material-price" variant="inputBlock">
                Material Price
              </Label>
              <SanitizedInput
                disabled={editDisabled}
                id="material-price"
                placeholder="0.00"
                step="0.01"
                type="number"
                value={materialPrice}
                onChange={(e) => setMaterialPrice(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Machine Assignment Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Machine Assignment
          </CardTitle>
          {/* Cancel and Save Buttons - Top Right (only while editing) */}
          {isEditing && (
            <div className="flex gap-2">
              <Button
                aria-label="Cancel"
                disabled={!selectedMachine}
                size={ComponentSizeEnum.SM}
                title="Cancel"
                variant={ButtonVariantEnum.SURFACE}
                onClick={handleMachineAssignmentCancel}
              />
              <Button
                aria-label="Save Changes"
                disabled={!selectedMachine}
                size={ComponentSizeEnum.SM}
                title="Save Changes"
                onClick={handleMachineAssignmentSave}
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Machine Assignment */}
          <div className="space-y-4 rounded-lg border p-4">
            {/* Select Machine - Full Width Above */}
            <div>
              <Label htmlFor="select-machine" variant="inputBlock">
                Select Machine
              </Label>
              <Dropdown
                fullWidth
                disabled={editDisabled}
                options={
                  assignedMachines.length === 0
                    ? [
                        {
                          value: "no-machines",
                          label: "No machines assigned to this job",
                          disabled: true,
                        },
                      ]
                    : assignedMachines.map((eq) => ({
                        value: eq.id.toString(),
                        label: eq.equipment?.machine_name || `Machine ${eq.id}`,
                      }))
                }
                placeholder="Select machine"
                value={selectedMachine || undefined}
                onChange={setSelectedMachine}
              />
            </div>
            {/* Other Fields - 4 in a row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="machine-budget-hours" variant="inputBlock">
                  Budget Hours
                </Label>
                <SanitizedInput
                  disabled={editDisabled}
                  id="machine-budget-hours"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={machineBudgetHours}
                  onChange={(e) => setMachineBudgetHours(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="machine-actual-hours" variant="inputBlock">
                  Actual Hours
                </Label>
                <SanitizedInput
                  disabled
                  readOnly
                  className="bg-bg-surface"
                  id="machine-actual-hours"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={selectedMachineActualHours}
                />
              </div>
              <div>
                <Label htmlFor="machine-rate" variant="inputBlock">
                  Machine Rate
                </Label>
                <SanitizedInput
                  disabled={editDisabled}
                  id="machine-rate"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={machineRate}
                  onChange={(e) => setMachineRate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="machine-labor-cost" variant="inputBlock">
                  Machine & Labor Cost Per Hour
                </Label>
                <SanitizedInput
                  disabled={editDisabled}
                  id="machine-labor-cost"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={machineLaborCostPerHour}
                  onChange={(e) => setMachineLaborCostPerHour(e.target.value)}
                />
              </div>
            </div>

            {/* Calculated Values - Single Section with Vertical Dividers */}
            <Card>
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row">
                {/* Costs Section */}
                <div className="flex-1 space-y-2">
                  <CardTitle className="mb-2 text-base font-semibold">
                    Costs
                  </CardTitle>
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      <Label variant="caption">Budget Hours Cost</Label>
                      <Tooltip content="Budget Hours Cost = Budget Hours × Machine Rate" />
                    </div>
                    <div className="text-lg font-semibold">
                      ${machineCalculations.budgetHoursCost}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      <Label variant="caption">Actual Hours Cost</Label>
                      <Tooltip content="Actual Hours Cost = Actual Hours × Machine Rate" />
                    </div>
                    <div className="text-lg font-semibold">
                      ${machineCalculations.actualHoursCost}
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="bg-border hidden w-px md:block" />

                {/* Total Costs Section */}
                <div className="flex-1 space-y-2">
                  <CardTitle className="mb-2 text-base font-semibold">
                    Total Costs
                  </CardTitle>
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      <Label variant="caption">Budget Total Cost</Label>
                      <Tooltip content="Budget Total Cost = Budget Hours × Machine & Labor Cost Per Hour" />
                    </div>
                    <div className="text-lg font-semibold">
                      ${machineCalculations.budgetTotalCost}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      <Label variant="caption">Actual Total Cost</Label>
                      <Tooltip content="Actual Total Cost = Actual Hours × Machine & Labor Cost Per Hour" />
                    </div>
                    <div className="text-lg font-semibold">
                      ${machineCalculations.actualTotalCost}
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="bg-border hidden w-px md:block" />

                {/* Machine Profits Section */}
                <div className="flex-1 space-y-2">
                  <CardTitle className="mb-2 text-base font-semibold">
                    Machine Profits
                  </CardTitle>
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      <Label variant="caption">Machine Budget Profit</Label>
                      <Tooltip content="Machine Budget Profit = Budget Hours Cost – Budget Total Cost" />
                    </div>
                    <div className="text-lg font-semibold">
                      ${machineCalculations.machineBudgetProfit}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      <Label variant="caption">Machine Actual Profit</Label>
                      <Tooltip content="Machine Actual Profit = Budget Hours Cost – Actual Total Cost" />
                    </div>
                    <div className="text-lg font-semibold">
                      ${machineCalculations.machineActualProfit}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Existing Machine Assignments */}
          {machineAssignments.map((assignment) => {
            const jobEquipment = assignedMachines.find(
              (eq) => eq.id === assignment.job_equipment
            );

            // Use values directly from backend
            const actualHoursValue = assignment.actual_hours || 0;
            const budgetHoursCost = assignment.budget_hours_cost || 0;
            const actualHoursCost = assignment.actual_hours_cost || 0;
            const budgetTotalCost = assignment.budget_total_cost || 0;
            const actualTotalCost = assignment.actual_total_cost || 0;
            const machineBudgetProfit = assignment.machine_budget_profit || 0;
            const machineActualProfit = assignment.machine_actual_profit || 0;

            return (
              <div
                key={assignment.id}
                className="space-y-4 rounded-lg border p-4"
              >
                {/* Machine Name at Top */}
                <h4 className="text-2xl font-semibold">
                  {assignment.machine_name ||
                    jobEquipment?.equipment?.machine_name ||
                    `Machine ${assignment.id}`}
                </h4>

                {/* 4 Fields in a row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label variant="inputBlock">Budget Hours</Label>
                    <SanitizedInput
                      disabled
                      readOnly
                      className="bg-bg-surface"
                      type="text"
                      value={
                        assignment.budget_hours
                          ? parseFloat(
                              assignment.budget_hours.toString()
                            ).toFixed(2)
                          : "0.00"
                      }
                    />
                  </div>
                  <div>
                    <Label variant="inputBlock">Actual Hours</Label>
                    <SanitizedInput
                      disabled
                      readOnly
                      className="bg-bg-surface"
                      type="text"
                      value={
                        actualHoursValue
                          ? parseFloat(actualHoursValue.toString()).toFixed(2)
                          : "0.00"
                      }
                    />
                  </div>
                  <div>
                    <Label variant="inputBlock">Machine Rate</Label>
                    <SanitizedInput
                      disabled
                      readOnly
                      className="bg-bg-surface"
                      type="text"
                      value={`${
                        assignment.machine_rate
                          ? parseFloat(
                              assignment.machine_rate.toString()
                            ).toFixed(2)
                          : "0.00"
                      }`}
                    />
                  </div>
                  <div>
                    <Label variant="inputBlock">
                      Machine & Labor Cost Per Hour
                    </Label>
                    <SanitizedInput
                      disabled
                      readOnly
                      className="bg-bg-surface"
                      type="text"
                      value={`${
                        assignment.machine_labor_cost_per_hour
                          ? parseFloat(
                              assignment.machine_labor_cost_per_hour.toString()
                            ).toFixed(2)
                          : "0.00"
                      }`}
                    />
                  </div>
                </div>

                {/* Costs, Total Costs, Machine Profits - Single Section with Vertical Dividers */}
                <div className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row">
                  {/* Costs Section */}
                  <div className="flex-1 space-y-2">
                    <CardTitle className="mb-4 text-base font-semibold">
                      Costs
                    </CardTitle>
                    <div>
                      <div className="mb-1 flex items-center gap-1">
                        <Label variant="caption">Budget Hours Cost</Label>
                        <Tooltip content="Budget Hours Cost = Budget Hours × Machine Rate" />
                      </div>
                      <div className="text-lg font-semibold">
                        ${parseFloat(budgetHoursCost.toString()).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-1">
                        <Label variant="caption">Actual Hours Cost</Label>
                        <Tooltip content="Actual Hours Cost = Actual Hours × Machine Rate" />
                      </div>
                      <div className="text-lg font-semibold">
                        ${parseFloat(actualHoursCost.toString()).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="bg-border hidden w-px md:block" />

                  {/* Total Costs Section */}
                  <div className="flex-1 space-y-2">
                    <CardTitle className="mb-4 text-base font-semibold">
                      Total Costs
                    </CardTitle>
                    <div>
                      <div className="mb-1 flex items-center gap-1">
                        <Label variant="caption">Budget Total Cost</Label>
                        <Tooltip content="Budget Total Cost = Budget Hours × Machine & Labor Cost Per Hour" />
                      </div>
                      <div className="text-lg font-semibold">
                        ${parseFloat(budgetTotalCost.toString()).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-1">
                        <Label variant="caption">Actual Total Cost</Label>
                        <Tooltip content="Actual Total Cost = Actual Hours × Machine & Labor Cost Per Hour" />
                      </div>
                      <div className="text-lg font-semibold">
                        ${parseFloat(actualTotalCost.toString()).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="bg-border hidden w-px md:block" />

                  {/* Machine Profits Section */}
                  <div className="flex-1 space-y-2">
                    <CardTitle className="mb-4 text-base font-semibold">
                      Machine Profits
                    </CardTitle>
                    <div>
                      <div className="mb-1 flex items-center gap-1">
                        <Label variant="caption">Machine Budget Profit</Label>
                        <Tooltip content="Machine Budget Profit = Budget Hours Cost – Budget Total Cost" />
                      </div>
                      <div className="text-lg font-semibold">
                        ${parseFloat(machineBudgetProfit.toString()).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-1">
                        <Label variant="caption">Machine Actual Profit</Label>
                        <Tooltip content="Machine Actual Profit = Budget Hours Cost – Actual Total Cost" />
                      </div>
                      <div className="text-lg font-semibold">
                        ${parseFloat(machineActualProfit.toString()).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
