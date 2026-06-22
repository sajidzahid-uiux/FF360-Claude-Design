import type { FinancialMachineAssignment } from "@/api/types";
import { Label, SanitizedInput } from "@/shared/ui/primitives";

import { MachineCalculationsPanel } from "./MachineCalculationsPanel";
import { formatFinancialAmount } from "./lib/formatAmount";
import type { AssignedMachine } from "./types";

interface ExistingMachineAssignmentCardProps {
  assignment: FinancialMachineAssignment;
  jobEquipment: AssignedMachine | undefined;
  prefixMachineRate?: boolean;
}

export function ExistingMachineAssignmentCard({
  assignment,
  jobEquipment,
  prefixMachineRate = false,
}: ExistingMachineAssignmentCardProps) {
  const actualHoursValue = assignment.actual_hours || 0;
  const budgetHoursCost = assignment.budget_hours_cost || 0;
  const actualHoursCost = assignment.actual_hours_cost || 0;
  const budgetTotalCost = assignment.budget_total_cost || 0;
  const actualTotalCost = assignment.actual_total_cost || 0;
  const machineBudgetProfit = assignment.machine_budget_profit || 0;
  const machineActualProfit = assignment.machine_actual_profit || 0;

  const machineRateDisplay = prefixMachineRate
    ? `$${formatFinancialAmount(assignment.machine_rate)}`
    : formatFinancialAmount(assignment.machine_rate);

  const laborCostDisplay = prefixMachineRate
    ? `$${formatFinancialAmount(assignment.machine_labor_cost_per_hour)}`
    : formatFinancialAmount(assignment.machine_labor_cost_per_hour);

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h4 className="text-2xl font-semibold">
        {assignment.machine_name ||
          jobEquipment?.equipment?.machine_name ||
          `Machine ${assignment.id}`}
      </h4>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label variant="inputBlock">Budget Hours</Label>
          <SanitizedInput
            disabled
            readOnly
            className="bg-bg-surface"
            type="text"
            value={formatFinancialAmount(assignment.budget_hours)}
          />
        </div>
        <div>
          <Label variant="inputBlock">Actual Hours</Label>
          <SanitizedInput
            disabled
            readOnly
            className="bg-bg-surface"
            type="text"
            value={formatFinancialAmount(actualHoursValue)}
          />
        </div>
        <div>
          <Label variant="inputBlock">Machine Rate</Label>
          <SanitizedInput
            disabled
            readOnly
            className="bg-bg-surface"
            type="text"
            value={machineRateDisplay}
          />
        </div>
        <div>
          <Label variant="inputBlock">Machine & Labor Cost Per Hour</Label>
          <SanitizedInput
            disabled
            readOnly
            className="bg-bg-surface"
            type="text"
            value={laborCostDisplay}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <MachineCalculationsPanel
          calculations={{
            budgetHoursCost: formatFinancialAmount(budgetHoursCost),
            actualHoursCost: formatFinancialAmount(actualHoursCost),
            budgetTotalCost: formatFinancialAmount(budgetTotalCost),
            actualTotalCost: formatFinancialAmount(actualTotalCost),
            machineBudgetProfit: formatFinancialAmount(machineBudgetProfit),
            machineActualProfit: formatFinancialAmount(machineActualProfit),
          }}
          titleSize="md"
        />
      </div>
    </div>
  );
}
