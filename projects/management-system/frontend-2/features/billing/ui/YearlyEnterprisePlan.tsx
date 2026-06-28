import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";

import { useSeatUsage } from "@/hooks";
import type { SubscriptionInfo } from "@/hooks/useBilling";
import { useModalStack } from "@/shared/model/use-modal-stack";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";
import { SeatUsageDisplay } from "./SeatUsageDisplay";

interface YearlyEnterprisePlanProps {
  subscriptionInfo: SubscriptionInfo | null;
  planName?: string;
  onCancelSubscription?: () => void;
  isCancelling?: boolean;
}

export default function YearlyEnterprisePlan({
  subscriptionInfo,
  planName = "Enterprise",
  onCancelSubscription,
  isCancelling = false,
}: YearlyEnterprisePlanProps) {
  const { stack, openModal, closeModalKey } = useModalStack();
  const showCancelDialog = stack.some((f) => f.key === "cancel-subscription");
  const { data: seatUsage, isLoading: seatUsageLoading } = useSeatUsage();

  const handleCancelSubscription = () => {
    openModal("cancel-subscription");
  };

  const handleConfirmCancelSubscription = async () => {
    if (onCancelSubscription) {
      await onCancelSubscription();
    }
    closeModalKey("cancel-subscription");
  };

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">Current plan</CardTitle>
            <CardDescription>Your enterprise subscription.</CardDescription>
          </div>
          {!subscriptionInfo?.trialing ? (
            <Button
              disabled={isCancelling}
              loading={isCancelling}
              size={ComponentSizeEnum.SM}
              title={isCancelling ? "Cancelling..." : "Cancel subscription"}
              variant={ButtonVariantEnum.DELETE}
              onClick={handleCancelSubscription}
            />
          ) : null}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-bg-app border-border-subtle mb-4 rounded-xl border p-4">
            <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
              Plan
            </p>
            <h3 className="text-text-primary mt-1 text-2xl font-semibold">
              {planName}
            </h3>
          </div>
          <SeatUsageDisplay
            isLoading={seatUsageLoading}
            seatUsage={seatUsage}
          />
        </CardContent>
      </Card>
      <CancelSubscriptionDialog
        isLoading={isCancelling}
        open={showCancelDialog}
        planName={planName}
        renewalDate={subscriptionInfo?.renewal_date || ""}
        onConfirm={handleConfirmCancelSubscription}
        onOpenChange={(o) => {
          if (!o) closeModalKey("cancel-subscription");
        }}
      />
    </>
  );
}
