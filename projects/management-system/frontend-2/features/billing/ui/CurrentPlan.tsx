import { useEffect, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  TabsSwitcher,
  Toggle,
} from "@fieldflow360/org-ui";
import { CheckCircle2, Repeat } from "lucide-react";
import { toast } from "sonner";

import {
  type PlanData,
  getBillingCycle,
  getPlanByApiId,
  plans,
} from "@/features/billing/lib/plan";
import Features from "@/features/billing/ui/Features";
import { useBilling, useSeatUsage, useTeamData } from "@/hooks";
import type { SubscriptionInfo } from "@/hooks/useBilling";
import { ContactSalesDialog } from "@/shared/ui/common";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";
import ConfirmPlanChangeDialog from "./ConfirmPlanChangeDialog";
import { SeatUsageDisplay } from "./SeatUsageDisplay";
import YearlyEnterprisePlan from "./YearlyEnterprisePlan";

type CurrentPlanDisplay = PlanData & { type: string };

const PLAN_FEATURES = [
  "Job & Lead Management",
  "Billing & Financial Tools",
  "Order & Supply Management",
  "Equipment & Maintenance",
  "Dashboards & Analytics",
] as const;

interface CurrentPlanProps {
  subscriptionInfo: SubscriptionInfo | null;
  currentPlanId?: string;
  onPlanChange?: () => void;
}

export default function CurrentPlan({
  subscriptionInfo,
  currentPlanId,
  onPlanChange,
}: CurrentPlanProps) {
  const {
    toggleAutoRenew,
    cancelSubscription,
    changePlan,
    getSubscriptionInfoWithPermission,
  } = useBilling();

  const [isCancelling, setIsCancelling] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [currentPlan, setCurrentPlan] = useState<CurrentPlanDisplay | null>(
    null
  );
  const [showContactSales, setShowContactSales] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [localSubscriptionInfo, setLocalSubscriptionInfo] =
    useState(subscriptionInfo);

  const { data: teamData } = useTeamData();
  const { data: seatUsage, isLoading: seatUsageLoading } = useSeatUsage();

  // Extract plan info based on current_plan in organization data
  useEffect(() => {
    if (currentPlanId) {
      // For debugging

      const cycle = getBillingCycle(currentPlanId);

      const planData = getPlanByApiId(currentPlanId);

      if (planData) {
        setCurrentPlan({
          ...planData,
          type: cycle === "monthly" ? "Monthly" : "Yearly",
        });
      } else {
        console.warn("No plan data found for ID:", currentPlanId);
      }
    }
  }, [currentPlanId]);

  useEffect(() => {
    setLocalSubscriptionInfo(subscriptionInfo);
  }, [subscriptionInfo]);

  // Default values if we can't determine from organizationData
  const planName = currentPlan ? currentPlan.name : "Small Team Plan";
  const planType = currentPlan ? currentPlan.type : "Yearly";
  const monthlyPrice = currentPlan ? currentPlan.monthlyPrice : "0";
  const yearlyPrice = currentPlan ? currentPlan.yearlyPrice : "0";

  const price = planType === "Monthly" ? monthlyPrice : yearlyPrice;
  const perJobPrice =
    planType === "Monthly"
      ? currentPlan?.perJobPrice?.monthly
      : currentPlan?.perJobPrice?.yearly;

  const handleToggleAutoRenew = async () => {
    try {
      // Pass the new desired state (opposite of current state)
      const newAutoRenewState = !localSubscriptionInfo?.auto_renew;
      await toggleAutoRenew(newAutoRenewState);

      // Update local state (in a real app you would re-fetch the data)
      if (localSubscriptionInfo) {
        setLocalSubscriptionInfo({
          ...localSubscriptionInfo,
          auto_renew: newAutoRenewState,
        });
      }
    } catch (error) {
      console.error("Error toggling auto-renew:", error);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleChangePlan = () => {
    setIsChangingPlan(true);
  };

  const handleSelectPlan = async (plan: PlanData) => {
    setSelectedPlan(plan);

    if (plan.id === "enterprise") {
      setShowContactSales(true);
      return;
    }

    const active = seatUsage?.used_seats ?? teamData?.length ?? 0;
    const pending = seatUsage?.pending_invites ?? 0;
    const allocated = active + pending;
    const planLimit = plan.maxUsers;
    if (planLimit != null && allocated > planLimit) {
      toast.error(
        `Allocated seats (${allocated}: ${active} active + ${pending} pending) exceed this plan's limit (${planLimit}). Remove members or cancel invites before switching.`
      );
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedPlan) return;

    setIsUpdatingPlan(true);
    try {
      const planId = selectedPlan.apiId[billingCycle];
      await changePlan(planId);
      // Re-fetch subscription info after plan change
      const updatedInfo = await getSubscriptionInfoWithPermission(true);
      setLocalSubscriptionInfo(updatedInfo);
      setIsChangingPlan(false);

      // Call the callback to refresh organization data
      if (onPlanChange) {
        onPlanChange();
      }
    } catch (err) {
      console.error("Error changing plan:", err);
    } finally {
      setIsUpdatingPlan(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCancelChangePlan = () => {
    setIsChangingPlan(false);
  };

  // If in plan changing mode, show the plan selection UI
  if (isChangingPlan) {
    return (
      <>
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-lg">Change plan</CardTitle>
              <CardDescription>
                Select a new plan for your subscription.
              </CardDescription>
            </div>
            <Button
              size={ComponentSizeEnum.SM}
              title="Cancel"
              variant={ButtonVariantEnum.SURFACE}
              onClick={handleCancelChangePlan}
            />
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <div className="flex justify-end">
              <TabsSwitcher
                items={[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly" },
                ]}
                value={billingCycle}
                onChange={(value) => setBillingCycle(value)}
              />
            </div>
            <div>
              {billingCycle === "monthly" ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  {plans
                    .filter((plan) => plan.id !== "enterprise_yearly")
                    .map((plan) => (
                      <Card
                        key={plan.id}
                        className="flex h-full flex-col overflow-hidden rounded-xl border"
                      >
                        <div className="flex h-full flex-col p-6">
                          <div className="mb-3 flex items-start justify-between">
                            <div>
                              <h3 className="text-text-primary font-semibold">
                                {plan.name}
                              </h3>
                              <p className="text-text-muted text-xs">
                                {plan.description}
                              </p>
                              <p className="text-text-muted text-xs">
                                {plan.maxUsers != null
                                  ? `${plan.maxUsers} user${plan.maxUsers === 1 ? "" : "s"}`
                                  : ""}
                              </p>
                            </div>
                            {plan.popular && (
                              <Badge
                                className="bg-accent text-text-inverse border-0 text-xs"
                                variant="outline"
                              >
                                POPULAR
                              </Badge>
                            )}
                          </div>
                          <div className="mb-2">
                            {plan.monthlyPrice ? (
                              <>
                                <span className="text-text-primary text-2xl font-bold">
                                  ${plan.monthlyPrice}
                                </span>
                                <span className="text-text-muted text-sm">
                                  /month
                                </span>
                              </>
                            ) : (
                              <span className="text-text-primary text-2xl font-bold">
                                Custom Pricing
                              </span>
                            )}
                          </div>
                          <p className="text-text-muted mb-4 text-xs">
                            {plan.perJobPrice.monthly}
                          </p>
                          {plan.freeTrialDays && (
                            <div className="flex h-full items-end justify-start">
                              <Badge
                                className="bg-accent text-text-inverse h-fit border-0 text-xs"
                                variant="outline"
                              >
                                {plan.freeTrialDays} day free trial
                              </Badge>
                            </div>
                          )}
                          <div className="mt-auto pt-2">
                            <Button
                              aria-label={
                                isUpdatingPlan && selectedPlan?.id === plan.id
                                  ? "Processing..."
                                  : plan.id === "enterprise"
                                    ? "Contact Sales"
                                    : "Select Plan"
                              }
                              className="w-full"
                              disabled={isUpdatingPlan}
                              loading={
                                isUpdatingPlan && selectedPlan?.id === plan.id
                              }
                              title={
                                isUpdatingPlan && selectedPlan?.id === plan.id
                                  ? "Processing..."
                                  : plan.id === "enterprise"
                                    ? "Contact Sales"
                                    : "Select Plan"
                              }
                              variant={
                                plan.popular
                                  ? ButtonVariantEnum.DEFAULT
                                  : ButtonVariantEnum.SURFACE
                              }
                              onClick={() => handleSelectPlan(plan)}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  {plans
                    .filter((plan) => plan.id !== "enterprise_yearly")
                    .map((plan) => (
                      <Card
                        key={plan.id}
                        className="flex h-full flex-col overflow-hidden rounded-xl border"
                      >
                        <div className="flex h-full flex-col p-6">
                          <div className="mb-3 flex items-start justify-between">
                            <div>
                              <h3 className="text-text-primary font-semibold">
                                {plan.name}
                              </h3>
                              <p className="text-text-muted text-xs">
                                {plan.description}
                              </p>
                              <p className="text-text-muted text-xs">
                                {plan.maxUsers != null
                                  ? `${plan.maxUsers} user${plan.maxUsers === 1 ? "" : "s"}`
                                  : ""}
                              </p>
                            </div>
                            {plan.popular && (
                              <Badge
                                className="bg-accent text-text-inverse border-0 text-xs"
                                variant="outline"
                              >
                                POPULAR
                              </Badge>
                            )}
                          </div>
                          <div className="mb-2">
                            {plan.yearlyPrice ? (
                              <>
                                <span className="text-text-primary text-2xl font-bold">
                                  ${plan.yearlyPrice}
                                </span>
                                <span className="text-text-muted text-sm">
                                  /year
                                </span>
                              </>
                            ) : (
                              <span className="text-text-primary text-2xl font-bold">
                                Custom Pricing
                              </span>
                            )}
                          </div>
                          {plan.yearlyDiscount && (
                            <div className="mb-4 flex h-full items-center gap-2">
                              <p className="text-text-muted block flex h-full items-center justify-center text-xs line-through">
                                $
                                {plan.monthlyPrice
                                  ? plan.monthlyPrice * 12
                                  : "0"}{" "}
                                / year
                              </p>
                              <div className="flex h-full items-center justify-center">
                                <Badge
                                  className="bg-accent text-text-inverse border-0 text-xs"
                                  variant="outline"
                                >
                                  -${plan.yearlyDiscount}%
                                </Badge>
                              </div>
                            </div>
                          )}
                          <p className="text-text-muted mb-4 text-xs">
                            {plan.perJobPrice.yearly}
                          </p>
                          {plan.freeTrialDays && (
                            <div className="flex h-full items-end justify-start">
                              <Badge
                                className="bg-accent text-text-inverse h-fit border-0 text-xs"
                                variant="outline"
                              >
                                {plan.freeTrialDays} day free trial
                              </Badge>
                            </div>
                          )}
                          <div className="mt-auto pt-2">
                            <Button
                              aria-label={
                                isUpdatingPlan && selectedPlan?.id === plan.id
                                  ? "Processing..."
                                  : plan.id === "enterprise"
                                    ? "Contact Sales"
                                    : "Select Plan"
                              }
                              className="w-full"
                              disabled={isUpdatingPlan}
                              loading={
                                isUpdatingPlan && selectedPlan?.id === plan.id
                              }
                              title={
                                isUpdatingPlan && selectedPlan?.id === plan.id
                                  ? "Processing..."
                                  : plan.id === "enterprise"
                                    ? "Contact Sales"
                                    : "Select Plan"
                              }
                              variant={
                                plan.popular
                                  ? ButtonVariantEnum.DEFAULT
                                  : ButtonVariantEnum.SURFACE
                              }
                              onClick={() => handleSelectPlan(plan)}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Features />
        <ContactSalesDialog
          open={showContactSales}
          onOpenChange={setShowContactSales}
        />
        <ConfirmPlanChangeDialog
          isLoading={isUpdatingPlan}
          open={showConfirmDialog}
          planName={selectedPlan?.name || ""}
          onConfirm={handleConfirmPlanChange}
          onOpenChange={setShowConfirmDialog}
        />
        <CancelSubscriptionDialog
          isLoading={isCancelling}
          open={showCancelDialog}
          planName={planName}
          renewalDate={localSubscriptionInfo?.renewal_date || ""}
          onConfirm={handleConfirmCancelSubscription}
          onOpenChange={setShowCancelDialog}
        />
      </>
    );
  }

  // Check if it's enterprise yearly plan - show special view
  if (currentPlanId === "enterprise_yearly") {
    return (
      <YearlyEnterprisePlan
        isCancelling={isCancelling}
        planName="Enterprise"
        subscriptionInfo={localSubscriptionInfo}
        onCancelSubscription={handleConfirmCancelSubscription}
      />
    );
  }

  // Otherwise show the regular current plan view
  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Current plan</CardTitle>
          <CardDescription>Your current subscription plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <div className="bg-bg-app border-border-subtle flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                Plan
              </p>
              <h3 className="text-text-primary mt-1 text-2xl font-semibold tracking-tight">
                {planName}
              </h3>
              <p className="text-text-muted mt-1 text-sm">{planType} billing</p>
            </div>
            <div className="shrink-0 sm:text-right">
              <p className="text-text-primary text-3xl font-semibold tracking-tight">
                ${price}
                <span className="text-text-muted text-base font-normal">
                  /{planType === "Monthly" ? "mo" : "yr"}
                </span>
              </p>
              {perJobPrice ? (
                <p className="text-text-muted mt-1 text-sm">{perJobPrice}</p>
              ) : null}
            </div>
          </div>

          <SeatUsageDisplay
            isLoading={seatUsageLoading}
            seatUsage={seatUsage}
          />

          <div className="border-border-subtle flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-text-primary text-sm font-medium">
                Auto-renew subscription
              </p>
              {localSubscriptionInfo?.auto_renew ? (
                <p className="text-text-muted mt-1 text-sm">
                  Renews on{" "}
                  {localSubscriptionInfo?.renewal_date
                    ? new Date(
                        localSubscriptionInfo.renewal_date
                      ).toLocaleDateString()
                    : "—"}
                </p>
              ) : (
                <p className="text-text-muted mt-1 text-sm">
                  Expires on{" "}
                  {localSubscriptionInfo?.renewal_date
                    ? new Date(
                        localSubscriptionInfo.renewal_date
                      ).toLocaleDateString()
                    : "—"}
                </p>
              )}
            </div>
            {!localSubscriptionInfo?.trialing ? (
              <Toggle
                aria-label="Auto renew subscription"
                checked={localSubscriptionInfo?.auto_renew ?? false}
                className="shrink-0"
                disabled={isUpdatingPlan}
                onChange={() => {
                  void handleToggleAutoRenew();
                }}
              />
            ) : null}
          </div>

          <div>
            <h3 className="text-text-primary mb-3 text-sm font-semibold">
              Included features
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {PLAN_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="text-text-secondary flex items-center gap-2 text-sm"
                >
                  <CheckCircle2
                    aria-hidden
                    className="text-accent h-4 w-4 shrink-0"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-border-subtle flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                size={ComponentSizeEnum.SM}
                title="Change plan"
                variant={ButtonVariantEnum.SURFACE}
                onClick={handleChangePlan}
              />
              {!localSubscriptionInfo?.trialing ? (
                <Button
                  disabled={isCancelling}
                  loading={isCancelling}
                  size={ComponentSizeEnum.SM}
                  title={isCancelling ? "Cancelling..." : "Cancel subscription"}
                  variant={ButtonVariantEnum.DELETE}
                  onClick={handleCancelSubscription}
                />
              ) : null}
            </div>
            {localSubscriptionInfo?.renewal_date ? (
              <div className="text-text-muted flex items-center gap-2 text-sm">
                <Repeat className="h-4 w-4 shrink-0" />
                <p>
                  {localSubscriptionInfo.auto_renew ? "Renews" : "Expires"} on{" "}
                  {new Date(
                    localSubscriptionInfo.renewal_date
                  ).toLocaleDateString()}
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <CancelSubscriptionDialog
        isLoading={isCancelling}
        open={showCancelDialog}
        planName={planName}
        renewalDate={localSubscriptionInfo?.renewal_date || ""}
        onConfirm={handleConfirmCancelSubscription}
        onOpenChange={setShowCancelDialog}
      />
    </>
  );
}
