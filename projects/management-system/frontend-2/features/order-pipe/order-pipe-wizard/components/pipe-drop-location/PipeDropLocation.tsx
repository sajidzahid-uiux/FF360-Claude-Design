import { OrderItemsSummary } from "./PipeDropLocationDetails";
import { PipeDropLocationMap } from "./PipeDropLocationMap";

function PipeDropLocationLeft() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PipeDropLocationMap />
    </div>
  );
}

function PipeDropLocationRight() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <OrderItemsSummary />
    </div>
  );
}

function PipeDropLocationMobile() {
  return (
    <div className="flex flex-col gap-4">
      <PipeDropLocationMap />
      <OrderItemsSummary />
    </div>
  );
}

export const PipeDropLocation = {
  Left: PipeDropLocationLeft,
  Right: PipeDropLocationRight,
  Mobile: PipeDropLocationMobile,
};
