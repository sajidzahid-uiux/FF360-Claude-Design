import { useEffect, useMemo, useState } from "react";

import type { JobFinancialUpdatePayload } from "@/api/types";
import { EquipmentType, JobType } from "@/constants";
import { useMachineFinancialAssignment } from "@/features/jobs/hooks/useMachineFinancialAssignment";
import { formatFinancialAmount } from "@/features/jobs/ui/financial-tab/lib/formatAmount";
import type { JobEquipmentEntry } from "@/features/jobs/ui/financial-tab/types";
import { usePaymentStatuses, useRecordEquipment } from "@/hooks";
import { useUpdateJobFinancial } from "@/hooks/mutations";
import { useJobFinancial } from "@/hooks/queries";

interface UseTilingFinancialTabOptions {
  jobId: number;
  jobEquipments: JobEquipmentEntry[];
  salesPriceFromLead?: string | null;
}

export function useTilingFinancialTab({
  jobId,
  jobEquipments,
  salesPriceFromLead,
}: UseTilingFinancialTabOptions) {
  const { data: financialData, isLoading: financialLoading } = useJobFinancial(
    jobId,
    JobType.TILING
  );

  const { data: paymentStatuses = [] } = usePaymentStatuses();

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
    jobType: JobType.TILING,
    jobEquipments,
    allEquipment,
    calculationMode: "client",
  });

  const [salesPrice, setSalesPrice] = useState<string>("");
  const [isEditingSalesPrice, setIsEditingSalesPrice] =
    useState<boolean>(false);
  const [laborRate, setLaborRate] = useState<string>("");
  const [budgetHours, setBudgetHours] = useState<string>("");
  const [actualHours, setActualHours] = useState<string>("");
  const [budgetMaterial, setBudgetMaterial] = useState<string>("");
  const [actualMaterial, setActualMaterial] = useState<string>("");
  const [overheadPerFoot, setOverheadPerFoot] = useState<string>("");
  const [paymentStatusId, setPaymentStatusId] = useState<string>("");
  const [originalPaymentStatusId, setOriginalPaymentStatusId] =
    useState<string>("");

  const [originalFinancialValues, setOriginalFinancialValues] = useState({
    salesPrice: "",
    laborRate: "",
    budgetHours: "",
    budgetMaterial: "",
    actualMaterial: "",
    overheadPerFoot: "",
  });

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

  const laborBudget = formatFinancialAmount(financialData?.labor_budget);
  const actualCost = formatFinancialAmount(financialData?.actual_cost);
  const overhead = formatFinancialAmount(financialData?.overhead);
  const budgetProfit = formatFinancialAmount(financialData?.budget_profit);
  const actualProfit = formatFinancialAmount(financialData?.actual_profit);
  const machineBudgetProfitTotal = formatFinancialAmount(
    financialData?.machine_budget_profit_total
  );
  const machineActualProfitTotal = formatFinancialAmount(
    financialData?.machine_actual_profit_total
  );

  const hasFinancialChanges = useMemo(
    () =>
      salesPrice !== originalFinancialValues.salesPrice ||
      laborRate !== originalFinancialValues.laborRate ||
      budgetHours !== originalFinancialValues.budgetHours ||
      budgetMaterial !== originalFinancialValues.budgetMaterial ||
      actualMaterial !== originalFinancialValues.actualMaterial ||
      overheadPerFoot !== originalFinancialValues.overheadPerFoot ||
      paymentStatusId !== originalPaymentStatusId,
    [
      salesPrice,
      laborRate,
      budgetHours,
      budgetMaterial,
      actualMaterial,
      overheadPerFoot,
      originalFinancialValues,
      paymentStatusId,
      originalPaymentStatusId,
    ]
  );

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

      if (paymentStatusId !== originalPaymentStatusId) {
        data.payment_status =
          paymentStatusId && paymentStatusId !== "none"
            ? parseInt(paymentStatusId, 10)
            : null;
      }

      await updateJobFinancial.mutateAsync({
        jobId,
        jobType: JobType.TILING,
        data,
      });
      setOriginalFinancialValues({
        salesPrice: salesPrice || "",
        laborRate: laborRate || "",
        budgetHours: budgetHours || "",
        budgetMaterial: budgetMaterial || "",
        actualMaterial: actualMaterial || "",
        overheadPerFoot: overheadPerFoot || "",
      });
      setOriginalPaymentStatusId(paymentStatusId);
    } catch (error) {
      console.error("Error saving financial data:", error);
    }
  };

  const handleCancel = () => {
    setSalesPrice(originalFinancialValues.salesPrice);
    setLaborRate(originalFinancialValues.laborRate);
    setBudgetHours(originalFinancialValues.budgetHours);
    setBudgetMaterial(originalFinancialValues.budgetMaterial);
    setActualMaterial(originalFinancialValues.actualMaterial);
    setOverheadPerFoot(originalFinancialValues.overheadPerFoot);
    setPaymentStatusId(originalPaymentStatusId);
  };

  const cancelSalesPriceEdit = () => {
    setIsEditingSalesPrice(false);
    setSalesPrice(originalFinancialValues.salesPrice);
  };

  const saveSalesPriceEdit = async () => {
    try {
      await handleSave();
      setIsEditingSalesPrice(false);
    } catch (error) {
      console.error("Error saving sales price:", error);
    }
  };

  const isLoading =
    financialLoading || machineAssignment.machineAssignmentsLoading;

  return {
    financialData,
    financialLoading: isLoading,
    hasFinancialChanges,
    updateJobFinancial,
    handleSave,
    handleCancel,
    paymentStatuses,
    paymentStatusId,
    setPaymentStatusId,
    summary: {
      salesPrice,
      setSalesPrice,
      isEditingSalesPrice,
      setIsEditingSalesPrice,
      cancelSalesPriceEdit,
      saveSalesPriceEdit,
      budgetProfit,
      actualProfit,
      machineBudgetProfitTotal,
      machineActualProfitTotal,
    },
    crew: {
      laborRate,
      setLaborRate,
      budgetHours,
      setBudgetHours,
      actualHours,
      laborBudget,
      actualCost,
    },
    materialOverhead: {
      budgetMaterial,
      setBudgetMaterial,
      actualMaterial,
      setActualMaterial,
      overheadPerFoot,
      setOverheadPerFoot,
      overhead,
    },
    machineAssignment,
  };
}

export type UseTilingFinancialTabReturn = ReturnType<
  typeof useTilingFinancialTab
>;
