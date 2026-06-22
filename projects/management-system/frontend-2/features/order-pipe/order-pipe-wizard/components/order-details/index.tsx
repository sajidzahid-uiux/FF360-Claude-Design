import { CreateOrderCard } from "./CreateOrderCard";
import { OrderDetailsCard } from "./OrderDetailsCard";

function OrderDetailsLeft() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <OrderDetailsCard />
    </div>
  );
}

function OrderDetailsRight() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CreateOrderCard />
    </div>
  );
}

function OrderDetailsMobile() {
  return (
    <div className="flex flex-col gap-4">
      <OrderDetailsCard />
      <CreateOrderCard />
    </div>
  );
}

export const OrderDetails = {
  Left: OrderDetailsLeft,
  Right: OrderDetailsRight,
  Mobile: OrderDetailsMobile,
};
