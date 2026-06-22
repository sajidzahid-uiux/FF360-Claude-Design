import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SanitizedInput,
} from "@/shared/ui/primitives";
import { Tooltip } from "@/shared/ui/primitives/tooltip";

interface ExcavationSummaryCardsProps {
  disabled?: boolean;
  distUnit: string;
  salesPrice: string;
  setSalesPrice: (value: string) => void;
  totalCost: string;
  budgetProfit: string;
  actualProfit: string;
}

export function ExcavationSummaryCards({
  disabled = false,
  distUnit,
  salesPrice,
  setSalesPrice,
  totalCost,
  budgetProfit,
  actualProfit,
}: ExcavationSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">Sales Price</CardTitle>
        </CardHeader>
        <CardContent>
          <SanitizedInput
            disabled={disabled}
            placeholder="0.00"
            step="0.01"
            type="number"
            value={salesPrice}
            onChange={(e) => setSalesPrice(e.target.value)}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-3xl font-semibold">Total Cost</CardTitle>
            <Tooltip
              content={`Total Cost = Total ${distUnit} Cost + Actual Total Cost Of All Machines + Job Materials`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalCost}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-3xl font-semibold">
              Budget Total Profit
            </CardTitle>
            <Tooltip
              content={`Budget Total Profit = Sales Price – Total ${distUnit} Cost – Total Travel Cost – Actual Total Cost Of All Machines – Job Materials`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${budgetProfit}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-3xl font-semibold">
              Actual Total Profit
            </CardTitle>
            <Tooltip content="Actual Total Profit = Sales Price – Total Cost" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${actualProfit}</div>
        </CardContent>
      </Card>
    </div>
  );
}
