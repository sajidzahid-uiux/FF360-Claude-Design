"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Dropdown,
} from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { JobFinancialUpdatePayload, MachineV2 } from "@/api/types";
import { EquipmentType, JobType } from "@/constants";
import PaymentStatusCard from "@/features/jobs/ui/tiling/PaymentStatusCard";
import { usePaymentStatuses, useRecordEquipment } from "@/hooks";
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
  // Fetch financial data
  const { data: financialData, isLoading: financialLoading } = useJobFinancial(
    jobId,
    JobType.TILING
  );

  // Fetch payment statuses
  const { data: paymentStatuses = [] } = usePaymentStatuses();

  // Fetch machine assignments
  const {
    data: machineAssignments = [],
    isLoading: machineAssignmentsLoading,
  } = useFinancialMachineAssignments(jobId, JobType.TILING);

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
  const [laborRate, setLaborRate] = useState<string>("");
  const [budgetHours, setBudgetHours] = useState<string>("");
  const [actualHours, setActualHours] = useState<string>("");
  const [budgetMaterial, setBudgetMaterial] = useState<string>("");
  const [actualMaterial, setActualMaterial] = useState<string>("");
  const [overheadPerFoot, setOverheadPerFoot] = useState<string>("");

  // Payment status state
  const [paymentStatusId, setPaymentStatusId] = useState<string>("");
  const [originalPaymentStatusId, setOriginalPaymentStatusId] =
    useState<string>("");

  // Machine assignment state
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [machineBudgetHours, setMachineBudgetHours] = useState<string>("");
  const [machineRate, setMachineRate] = useState<string>("");
  const [machineLaborCostPerHour, setMachineLaborCostPerHour] =
    useState<string>("");

  // Track original financial values to detect changes
  const [originalFinancialValues, setOriginalFinancialValues] = useState({
    salesPrice: "",
    laborRate: "",
    budgetHours: "",
    budgetMaterial: "",
    actualMaterial: "",
    overheadPerFoot: "",
  });

  // Initialize form from financial data
  useEffect(() => {
    if (financialData) {
      const salesPriceValue =
        financialData.sales_price || salesPriceFromLead || "";
      const laborRateValue = financialData.labor_rate || "";
      const budgetHoursValue = financialData.budget_hours || "";
      const budgetMaterialValue = financialData.budget_material || "";
      const actualMaterialValue = financialData.actual_material || "";
      const overheadPerFootValue = financialData.overhead_per_foot || "";
      const paymentStatusValue =
        financialData.payment_status?.toString() || "none";

      setSalesPrice(salesPriceValue);
      setLaborRate(laborRateValue);
      setBudgetHours(budgetHoursValue);
      const currentActualHours = actualHours;
      if (!currentActualHours || currentActualHours === "0") {
        setActualHours(financialData.actual_hours?.toString() || "");
      }
      setBudgetMaterial(budgetMaterialValue);
      setActualMaterial(actualMaterialValue);
      setOverheadPerFoot(overheadPerFootValue);
      setPaymentStatusId(paymentStatusValue);

      // Store original values
      setOriginalFinancialValues({
        salesPrice: salesPriceValue,
        laborRate: laborRateValue,
        budgetHours: budgetHoursValue,
        budgetMaterial: budgetMaterialValue,
        actualMaterial: actualMaterialValue,
        overheadPerFoot: overheadPerFootValue,
      });
      setOriginalPaymentStatusId(paymentStatusValue);
    } else if (salesPriceFromLead) {
      setSalesPrice(salesPriceFromLead);
      setOriginalFinancialValues({
        salesPrice: salesPriceFromLead,
        laborRate: "",
        budgetHours: "",
        budgetMaterial: "",
        actualMaterial: "",
        overheadPerFoot: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialData, salesPriceFromLead]);

  // Use values directly from backend
  const laborBudget = financialData?.labor_budget
    ? parseFloat(financialData.labor_budget.toString()).toFixed(2)
    : "0.00";

  const actualCost = financialData?.actual_cost
    ? parseFloat(financialData.actual_cost.toString()).toFixed(2)
    : "0.00";

  const overhead = financialData?.overhead
    ? parseFloat(financialData.overhead.toString()).toFixed(2)
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

  // Get actual hours for selected machine
  const selectedMachineActualHours = useMemo(() => {
    if (!selectedMachine) return "";
    const jobEquipment = assignedMachines.find(
      (eq) => eq.id.toString() === selectedMachine
    );
    return jobEquipment?.total_hours?.toString() || "0.00";
  }, [selectedMachine, assignedMachines]);

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
      laborRate !== originalFinancialValues.laborRate ||
      budgetHours !== originalFinancialValues.budgetHours ||
      budgetMaterial !== originalFinancialValues.budgetMaterial ||
      actualMaterial !== originalFinancialValues.actualMaterial ||
      overheadPerFoot !== originalFinancialValues.overheadPerFoot ||
      paymentStatusId !== originalPaymentStatusId
    );
  }, [
    salesPrice,
    laborRate,
    budgetHours,
    budgetMaterial,
    actualMaterial,
    overheadPerFoot,
    originalFinancialValues,
    paymentStatusId,
    originalPaymentStatusId,
  ]);

  // Handle save
  const handleSave = async () => {
    try {
      const data: JobFinancialUpdatePayload = {
        sales_price: salesPrice || null,
        labor_rate: laborRate || null,
        budget_hours: budgetHours || null,
        budget_material: budgetMaterial || null,
        actual_material: actualMaterial || null,
        overhead_per_foot: overheadPerFoot || null,
      };

      // Include payment_status if it changed
      if (paymentStatusId !== originalPaymentStatusId) {
        data.payment_status =
          paymentStatusId && paymentStatusId !== "none"
            ? parseInt(paymentStatusId)
            : null;
      }

      await updateJobFinancial.mutateAsync({
        jobId,
        jobType: JobType.TILING,
        data,
      });
      // Update original values after successful save
      setOriginalFinancialValues({
        salesPrice: salesPrice || "",
        laborRate: laborRate || "",
        budgetHours: budgetHours || "",
        budgetMaterial: budgetMaterial || "",
        actualMaterial: actualMaterial || "",
        overheadPerFoot: overheadPerFoot || "",
      });
      setOriginalPaymentStatusId(paymentStatusId);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving financial data:", error);
    }
  };

  // Handle cancel - revert changes to original values
  const handleCancel = () => {
    setIsEditing(false);
    setSalesPrice(originalFinancialValues.salesPrice);
    setLaborRate(originalFinancialValues.laborRate);
    setBudgetHours(originalFinancialValues.budgetHours);
    setBudgetMaterial(originalFinancialValues.budgetMaterial);
    setActualMaterial(originalFinancialValues.actualMaterial);
    setOverheadPerFoot(originalFinancialValues.overheadPerFoot);
    setPaymentStatusId(originalPaymentStatusId);
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
          jobType: JobType.TILING,
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
          jobType: JobType.TILING,
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

  // Calculate machine assignment values (for display cards)
  const machineCalculations = useMemo(() => {
    const budgetHoursVal = parseFloat(machineBudgetHours) || 0;
    const actualHoursVal = parseFloat(selectedMachineActualHours) || 0;
    const machineRateVal = parseFloat(machineRate) || 0;
    const machineLaborCostVal = parseFloat(machineLaborCostPerHour) || 0;

    const budgetHoursCost = (budgetHoursVal * machineRateVal).toFixed(2);
    const actualHoursCost = (actualHoursVal * machineRateVal).toFixed(2);
    const budgetTotalCost = (budgetHoursVal * machineLaborCostVal).toFixed(2);
    const actualTotalCost = (actualHoursVal * machineLaborCostVal).toFixed(2);
    const machineBudgetProfit = (
      parseFloat(budgetHoursCost) - parseFloat(budgetTotalCost)
    ).toFixed(2);
    const machineActualProfit = (
      parseFloat(budgetHoursCost) - parseFloat(actualTotalCost)
    ).toFixed(2);

    return {
      budgetHoursCost,
      actualHoursCost,
      budgetTotalCost,
      actualTotalCost,
      machineBudgetProfit,
      machineActualProfit,
    };
  }, [
    machineBudgetHours,
    selectedMachineActualHours,
    machineRate,
    machineLaborCostPerHour,
  ]);

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

      {/* Payment Status */}
      <PaymentStatusCard
        disabled={editDisabled}
        paymentStatuses={paymentStatuses}
        paymentStatusId={paymentStatusId}
        onChange={setPaymentStatusId}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Sales Price Card - editable in edit mode, read-only otherwise */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Sales Price</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <SanitizedInput
                className="text-2xl font-bold"
                disabled={editDisabled}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={salesPrice}
                onChange={(e) => setSalesPrice(e.target.value)}
              />
            ) : (
              <div className="text-2xl font-bold">
                ${salesPrice ? parseFloat(salesPrice).toFixed(2) : "0.00"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Profit Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-semibold">
                Budget Profit
              </CardTitle>
              <Tooltip content="Budget Profit = Sales Price – Budget Labor – Budget Material – Overhead" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${budgetProfit}</div>
          </CardContent>
        </Card>

        {/* Actual Profit Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-semibold">
                Actual Profit
              </CardTitle>
              <Tooltip content="Actual Profit = Sales Price – Actual Labor – Actual Material – Overhead" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${actualProfit}</div>
          </CardContent>
        </Card>

        {/* Machine Profit Card - Split into 2 rows */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-semibold">
                  Machine Profit Budget
                </CardTitle>
                <Tooltip content="Machine Profit (Budget) = Total of All Machines' Budget Profit" />
              </div>
              <div className="text-right text-2xl font-bold">
                $
                {financialData?.machine_budget_profit_total
                  ? parseFloat(
                      financialData.machine_budget_profit_total.toString()
                    ).toFixed(2)
                  : "0.00"}
              </div>
            </div>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-semibold">
                  Machine Profit Actual
                </CardTitle>
                <Tooltip content="Machine Profit (Actual) = Total of All Machines' Actual Profit" />
              </div>
              <div className="text-right text-2xl font-bold">
                $
                {financialData?.machine_actual_profit_total
                  ? parseFloat(
                      financialData.machine_actual_profit_total.toString()
                    ).toFixed(2)
                  : "0.00"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crew Card - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">Crew</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Section 1: Labor Rate */}
            <div>
              <Label htmlFor="labor-rate" variant="inputBlock">
                Labor Rate
              </Label>
              <SanitizedInput
                disabled={editDisabled}
                id="labor-rate"
                placeholder="0.00"
                step="0.01"
                type="number"
                value={laborRate}
                onChange={(e) => setLaborRate(e.target.value)}
              />
            </div>

            {/* Section 2: Budget Hours and Actual Hours */}
            <div className="space-y-2">
              <div>
                <Label htmlFor="budget-hours" variant="inputBlock">
                  Budget Hours
                </Label>
                <SanitizedInput
                  disabled={editDisabled}
                  id="budget-hours"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={budgetHours}
                  onChange={(e) => setBudgetHours(e.target.value)}
                />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Label htmlFor="actual-hours" variant="inputBlock">
                    Actual Hours
                  </Label>
                  <Tooltip content="Actual Hours = Sum Of Total Hours From Time Tracking Page" />
                </div>
                <SanitizedInput
                  disabled
                  readOnly
                  className="bg-bg-surface"
                  id="actual-hours"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={actualHours}
                />
              </div>
            </div>

            {/* Section 3: Labor Budget and Actual Budget */}
            <div className="space-y-2">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Label>Labor Budget</Label>
                  <Tooltip content="Labor Budget = Budget Hours × Labor Rate" />
                </div>
                <SanitizedInput
                  disabled
                  className="bg-bg-surface"
                  type="text"
                  value={`$${laborBudget}`}
                />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Label>Actual Cost</Label>
                  <Tooltip content="Actual Cost = Labor Rate × Actual Hours" />
                </div>
                <SanitizedInput
                  disabled
                  className="bg-bg-surface"
                  type="text"
                  value={`$${actualCost}`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material and Overhead Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Material Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">Material</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label htmlFor="budget-material" variant="inputBlock">
                Budget Material
              </Label>
              <SanitizedInput
                disabled={editDisabled}
                id="budget-material"
                placeholder="0.00"
                step="0.01"
                type="number"
                value={budgetMaterial}
                onChange={(e) => setBudgetMaterial(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="actual-material" variant="inputBlock">
                Actual Material
              </Label>
              <SanitizedInput
                disabled={editDisabled}
                id="actual-material"
                placeholder="0.00"
                step="0.01"
                type="number"
                value={actualMaterial}
                onChange={(e) => setActualMaterial(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Overhead Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">Overhead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label htmlFor="overhead-per-foot" variant="inputBlock">
                Overhead Per Foot
              </Label>
              <SanitizedInput
                disabled={editDisabled}
                id="overhead-per-foot"
                placeholder="0.00"
                step="0.01"
                type="number"
                value={overheadPerFoot}
                onChange={(e) => setOverheadPerFoot(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Label>Overhead</Label>
                <Tooltip content="Overhead = Job Footage × Overhead Per Foot" />
              </div>
              <SanitizedInput
                disabled
                className="bg-bg-surface"
                type="text"
                value={`$${overhead}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machine Assignment Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-semibold">
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
                  <CardTitle className="mb-2 text-3xl font-semibold">
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
                  <CardTitle className="mb-2 text-3xl font-semibold">
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
                  <CardTitle className="mb-2 text-3xl font-semibold">
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
                      value={`$${
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
                      value={`$${
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
                    <CardTitle className="mb-4 text-3xl font-semibold">
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
                    <CardTitle className="mb-4 text-3xl font-semibold">
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
                    <CardTitle className="mb-4 text-3xl font-semibold">
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
