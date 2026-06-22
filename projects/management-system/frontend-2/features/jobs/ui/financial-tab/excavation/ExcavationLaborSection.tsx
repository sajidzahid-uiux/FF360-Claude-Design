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

interface ExcavationLaborSectionProps {
  disabled?: boolean;
  distUnit: string;
  budgetLaborHours: string;
  setBudgetLaborHours: (value: string) => void;
  actualLaborHours: string;
  budgetOperatorHours: string;
  setBudgetOperatorHours: (value: string) => void;
  actualOperatorHours: string;
  setActualOperatorHours: (value: string) => void;
  miles: string;
  setMiles: (value: string) => void;
  milesRate: string;
  setMilesRate: (value: string) => void;
  totalMilesCost: string;
  travelHours: string;
  setTravelHours: (value: string) => void;
  travelRate: string;
  setTravelRate: (value: string) => void;
  totalTravelCost: string;
  materialDescription: string;
  setMaterialDescription: (value: string) => void;
  materialPrice: string;
  setMaterialPrice: (value: string) => void;
}

export function ExcavationLaborSection({
  disabled = false,
  distUnit,
  budgetLaborHours,
  setBudgetLaborHours,
  actualLaborHours,
  budgetOperatorHours,
  setBudgetOperatorHours,
  actualOperatorHours,
  setActualOperatorHours,
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
  materialDescription,
  setMaterialDescription,
  materialPrice,
  setMaterialPrice,
}: ExcavationLaborSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">Labor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label htmlFor="budget-labor-hours" variant="inputBlock">
                Budget Labor Hours
              </Label>
              <SanitizedInput
                disabled={disabled}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">Operator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label htmlFor="budget-operator-hours" variant="inputBlock">
                Budget Operator Hours
              </Label>
              <SanitizedInput
                disabled={disabled}
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
                disabled={disabled}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">{distUnit}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="miles" variant="inputBlock">
                  {distUnit}
                </Label>
                <SanitizedInput
                  disabled={disabled}
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
                  disabled={disabled}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">Travel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="travel-hours" variant="inputBlock">
                  Travel Hours
                </Label>
                <SanitizedInput
                  disabled={disabled}
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
                  disabled={disabled}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">
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
                disabled={disabled}
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
                disabled={disabled}
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
    </>
  );
}

interface ExcavationJobMaterialsSectionProps {
  disabled?: boolean;
  materialDescription: string;
  setMaterialDescription: (value: string) => void;
  materialPrice: string;
  setMaterialPrice: (value: string) => void;
}

export function ExcavationJobMaterialsSection({
  disabled = false,
  materialDescription,
  setMaterialDescription,
  materialPrice,
  setMaterialPrice,
}: ExcavationJobMaterialsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-semibold">Job Materials</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-1">
            <Label htmlFor="material-description" variant="inputBlock">
              Material Description
            </Label>
            <SanitizedTextarea
              className="min-h-[100px]"
              disabled={disabled}
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
              disabled={disabled}
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
  );
}
