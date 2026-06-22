import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Dropdown,
} from "@fieldflow360/org-ui";

import type { FinancialMachineAssignment } from "@/api/types";
import type { UseMachineFinancialAssignmentReturn } from "@/features/jobs/hooks/useMachineFinancialAssignment";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  SanitizedInput,
} from "@/shared/ui/primitives";

import { ExistingMachineAssignmentCard } from "./ExistingMachineAssignmentCard";
import { MachineCalculationsPanel } from "./MachineCalculationsPanel";

interface MachineAssignmentSectionProps extends Pick<
  UseMachineFinancialAssignmentReturn,
  | "assignedMachines"
  | "machineAssignments"
  | "selectedMachine"
  | "setSelectedMachine"
  | "machineBudgetHours"
  | "setMachineBudgetHours"
  | "machineRate"
  | "setMachineRate"
  | "machineLaborCostPerHour"
  | "setMachineLaborCostPerHour"
  | "selectedMachineActualHours"
  | "machineCalculations"
  | "handleMachineAssignmentSave"
  | "handleMachineAssignmentCancel"
> {
  disabled?: boolean;
  prefixMachineRate?: boolean;
}

export function MachineAssignmentSection({
  assignedMachines,
  machineAssignments,
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
  disabled = false,
  prefixMachineRate = false,
}: MachineAssignmentSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-3xl font-semibold">
          Machine Assignment
        </CardTitle>
        {!disabled ? (
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
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <Label htmlFor="select-machine" variant="inputBlock">
              Select Machine
            </Label>
            <Dropdown
              fullWidth
              disabled={disabled}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="machine-budget-hours" variant="inputBlock">
                Budget Hours
              </Label>
              <SanitizedInput
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
                id="machine-labor-cost"
                placeholder="0.00"
                step="0.01"
                type="number"
                value={machineLaborCostPerHour}
                onChange={(e) => setMachineLaborCostPerHour(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <MachineCalculationsPanel calculations={machineCalculations} />
            </CardContent>
          </Card>
        </div>

        {machineAssignments.map((assignment: FinancialMachineAssignment) => {
          const jobEquipment = assignedMachines.find(
            (eq) => eq.id === assignment.job_equipment
          );

          return (
            <ExistingMachineAssignmentCard
              key={assignment.id}
              assignment={assignment}
              jobEquipment={jobEquipment}
              prefixMachineRate={prefixMachineRate}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
