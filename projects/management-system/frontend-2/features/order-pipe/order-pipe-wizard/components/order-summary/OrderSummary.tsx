import { ReviewLeft } from "./ReviewLeft";
import { ReviewRight } from "./ReviewRight";

function OrderSummaryLeft() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ReviewLeft />
    </div>
  );
}

function OrderSummaryRight() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ReviewRight />
    </div>
  );
}

function OrderSummaryMobile() {
  return (
    <div className="flex flex-col gap-4">
      <ReviewLeft />
      <ReviewRight />
    </div>
  );
}

export const OrderSummary = {
  Left: OrderSummaryLeft,
  Right: OrderSummaryRight,
  Mobile: OrderSummaryMobile,
};
