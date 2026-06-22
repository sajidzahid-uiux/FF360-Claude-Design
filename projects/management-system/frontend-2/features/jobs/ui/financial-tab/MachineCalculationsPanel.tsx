import { CardTitle, Label } from "@/shared/ui/primitives";
import { Tooltip } from "@/shared/ui/primitives/tooltip";

import type { MachineCalculations } from "./types";

interface MachineCalculationsPanelProps {
  calculations: MachineCalculations;
  titleSize?: "sm" | "md";
}

export function MachineCalculationsPanel({
  calculations,
  titleSize = "sm",
}: MachineCalculationsPanelProps) {
  const titleClassName =
    titleSize === "md"
      ? "mb-4 text-3xl font-semibold"
      : "mb-2 text-3xl font-semibold";

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex-1 space-y-2">
        <CardTitle className={titleClassName}>Costs</CardTitle>
        <div>
          <div className="mb-1 flex items-center gap-1">
            <Label variant="caption">Budget Hours Cost</Label>
            <Tooltip content="Budget Hours Cost = Budget Hours × Machine Rate" />
          </div>
          <div className="text-lg font-semibold">
            ${calculations.budgetHoursCost}
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1">
            <Label variant="caption">Actual Hours Cost</Label>
            <Tooltip content="Actual Hours Cost = Actual Hours × Machine Rate" />
          </div>
          <div className="text-lg font-semibold">
            ${calculations.actualHoursCost}
          </div>
        </div>
      </div>

      <div className="bg-border hidden w-px md:block" />

      <div className="flex-1 space-y-2">
        <CardTitle className={titleClassName}>Total Costs</CardTitle>
        <div>
          <div className="mb-1 flex items-center gap-1">
            <Label variant="caption">Budget Total Cost</Label>
            <Tooltip content="Budget Total Cost = Budget Hours × Machine & Labor Cost Per Hour" />
          </div>
          <div className="text-lg font-semibold">
            ${calculations.budgetTotalCost}
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1">
            <Label variant="caption">Actual Total Cost</Label>
            <Tooltip content="Actual Total Cost = Actual Hours × Machine & Labor Cost Per Hour" />
          </div>
          <div className="text-lg font-semibold">
            ${calculations.actualTotalCost}
          </div>
        </div>
      </div>

      <div className="bg-border hidden w-px md:block" />

      <div className="flex-1 space-y-2">
        <CardTitle className={titleClassName}>Machine Profits</CardTitle>
        <div>
          <div className="mb-1 flex items-center gap-1">
            <Label variant="caption">Machine Budget Profit</Label>
            <Tooltip content="Machine Budget Profit = Budget Hours Cost – Budget Total Cost" />
          </div>
          <div className="text-lg font-semibold">
            ${calculations.machineBudgetProfit}
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1">
            <Label variant="caption">Machine Actual Profit</Label>
            <Tooltip content="Machine Actual Profit = Budget Hours Cost – Actual Total Cost" />
          </div>
          <div className="text-lg font-semibold">
            ${calculations.machineActualProfit}
          </div>
        </div>
      </div>
    </div>
  );
}
