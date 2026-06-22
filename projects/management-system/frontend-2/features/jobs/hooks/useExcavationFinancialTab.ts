import { useEffect, useMemo, useState } from "react";

import { EquipmentType, JobType } from "@/constants";
import { useMachineFinancialAssignment } from "@/features/jobs/hooks/useMachineFinancialAssignment";
import { formatFinancialAmount } from "@/features/jobs/ui/financial-tab/lib/formatAmount";
import type { JobEquipmentEntry } from "@/features/jobs/ui/financial-tab/types";
import { useRecordEquipment, useUnitSystem } from "@/hooks";
import { useUpdateJobFinancial } from "@/hooks/mutations";
import { useJobFinancial } from "@/hooks/queries";

interface UseExcavationFinancialTabOptions {
  jobId: number;
  jobEquipments: JobEquipmentEntry[];
  salesPriceFromLead?: string | null;
}

export function useExcavationFinancialTab({
  jobId,
  jobEquipments,
  salesPriceFromLead,
}: UseExcavationFinancialTabOptions) {
  const unitSystem = useUnitSystem();
  const distUnit = unitSystem === "metric" ? "Kilometers" : "Miles";

  const { data: financialData, isLoading: financialLoading } = useJobFinancial(
    jobId,
    JobType.EXCAVATION
  );

  const { data: allEquipmentData } = useRecordEquipment({
    equipmentType: EquipmentType.MACHINES,
    paginate: false,
  });
  const allEquipment = useMemo(
    () => (Array.isArray(allEquipmentData) ? allEquipmentData : []),
    [allEquipmentData]
  );

  const updateJobFinancial = useUpdateJobFinancial();

  const machineAssignment = useMachineFinancialAssignment({
    jobId,
    jobType: JobType.EXCAVATION,
    jobEquipments,
    allEquipment,
    calculationMode: "backend",
  });

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

  const totalMilesCost = formatFinancialAmount(financialData?.total_miles_cost);
  const totalTravelCost = formatFinancialAmount(
    financialData?.total_travel_cost
  );
  const totalCost = formatFinancialAmount(financialData?.total_cost);
  const budgetProfit = formatFinancialAmount(financialData?.budget_profit);
  const actualProfit = formatFinancialAmount(financialData?.actual_profit);

  const hasFinancialChanges = useMemo(
    () =>
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
      materialPrice !== originalFinancialValues.materialPrice,
    [
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
    ]
  );

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
    } catch (error) {
      console.error("Error saving financial data:", error);
    }
  };

  const handleCancel = () => {
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

  const isLoading =
    financialLoading || machineAssignment.machineAssignmentsLoading;

  return {
    distUnit,
    disabled: false as boolean | undefined,
    financialLoading: isLoading,
    hasFinancialChanges,
    updateJobFinancial,
    handleSave,
    handleCancel,
    summary: {
      salesPrice,
      setSalesPrice,
      totalCost,
      budgetProfit,
      actualProfit,
    },
    labor: {
      budgetLaborHours,
      setBudgetLaborHours,
      actualLaborHours,
      budgetOperatorHours,
      setBudgetOperatorHours,
      actualOperatorHours,
      setActualOperatorHours,
    },
    travel: {
      miles,
      setMiles,
      milesRate,
      setMilesRate,
      totalMilesCost,
      travelHours,
      setTravelHours,
      travelRate,
      setTravelRate,
      totalTravelCost,
    },
    materials: {
      materialDescription,
      setMaterialDescription,
      materialPrice,
      setMaterialPrice,
    },
    machineAssignment,
  };
}

export type UseExcavationFinancialTabReturn = ReturnType<
  typeof useExcavationFinancialTab
>;
