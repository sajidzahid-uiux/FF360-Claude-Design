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
import { useModalStack } from "@/shared/model/use-modal-stack";
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

interface ChangePlanCardProps {
  plan: PlanData;
  billingCycle: "monthly" | "yearly";
  isUpdating: boolean;
  selected: PlanData | null;
  currentPlanApiId?: string;
  onSelect: (plan: PlanData) => void;
}

/**
 * A single plan in the "Change plan" horizontal stack. One component drives both
 * the monthly and yearly views off `billingCycle`, so the four plans line up in
 * an even, equal-height row.
 */
function ChangePlanCard({
  plan,
  billingCycle,
  isUpdating,
  selected,
  currentPlanApiId,
  onSelect,
}: ChangePlanCardProps) {
  const isCurrent = plan.apiId[billingCycle] === currentPlanApiId;
  const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const perJob =
    billingCycle === "monthly"
      ? plan.perJobPrice.monthly
      : plan.perJobPrice.yearly;
  const isProcessing = isUpdating && selected?.id === plan.id;

  const ctaLabel = isProcessing
    ? "Processing..."
    : plan.id === "enterprise"
      ? "Contact Sales"
      : isCurrent
        ? "Current plan"
        : "Select Plan";

  return (
    <Card
      className={`flex h-full flex-col rounded-xl border ${
        plan.popular ? "border-accent ring-accent/30 ring-1" : ""
      }`}
    >
      <div className="flex h-full flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-text-primary font-semibold">{plan.name}</h3>
            <p className="text-text-muted text-xs">{plan.description}</p>
            {plan.maxUsers != null ? (
              <p className="text-text-muted text-xs">
                {plan.maxUsers} user{plan.maxUsers === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>
          {plan.popular ? (
            <Badge
              className="bg-accent text-text-inverse shrink-0 border-0 text-xs"
              variant="outline"
            >
              POPULAR
            </Badge>
          ) : null}
        </div>

        <div className="mb-1">
          {price ? (
            <>
              <span className="text-text-primary text-2xl font-bold">
                ${price}
              </span>
              <span className="text-text-muted text-sm">
                /{billingCycle === "monthly" ? "month" : "year"}
              </span>
            </>
          ) : (
            <span className="text-text-primary text-2xl font-bold">
              Custom Pricing
            </span>
          )}
        </div>

        {billingCycle === "yearly" && plan.yearlyDiscount ? (
          <div className="mb-2 flex items-center gap-2">
            <span className="text-text-muted text-xs line-through">
              ${plan.monthlyPrice ? plan.monthlyPrice * 12 : 0}/year
            </span>
            <Badge
              className="bg-accent text-text-inverse border-0 text-xs"
              variant="outline"
            >
              -{plan.yearlyDiscount}%
            </Badge>
          </div>
        ) : null}

        {perJob ? (
          <p className="text-text-muted mb-3 text-xs">{perJob}</p>
        ) : null}

        {plan.freeTrialDays ? (
          <div className="mb-3">
            <Badge
              className="bg-accent text-text-inverse border-0 text-xs"
              variant="outline"
            >
              {plan.freeTrialDays} day free trial
            </Badge>
          </div>
        ) : null}

        <div className="mt-auto pt-2">
          <Button
            aria-label={ctaLabel}
            className="w-full"
            disabled={isUpdating || isCurrent}
            loading={isProcessing}
            title={ctaLabel}
            variant={
              plan.popular ? ButtonVariantEnum.DEFAULT : ButtonVariantEnum.SURFACE
            }
            onClick={() => onSelect(plan)}
          />
        </div>
      </div>
    </Card>
  );
}

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
  const { stack, openModal, closeModalKey } = useModalStack();
  const showCancelDialog = stack.some((f) => f.key === "cancel-subscription");
  const [localSubscriptionInfo, setLocalSubscriptionInfo] =
    useState(subscriptionInfo);

  const { data: teamData } = useTeamData();
  const { data: seatUsage, isLoading: seatUsageLoading } = useSeatUsage();

  // Extract plan info based on current_plan in organization data
  useEffect(() => {
    if (currentPlanId) {
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
      const newAutoRenewState = !localSubscriptionInfo?.auto_renew;
      await toggleAutoRenew(newAutoRenewState);

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
    openModal("cancel-subscription");
  };

  const handleConfirmCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();
      closeModalKey("cancel-subscription");
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
      const updatedInfo = await getSubscriptionInfoWithPermission(true);
      setLocalSubscriptionInfo(updatedInfo);
      setIsChangingPlan(false);

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
            <div className="flex justify-center">
              <TabsSwitcher
                items={[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly" },
                ]}
                value={billingCycle}
                onChange={(value) =>
                  setBillingCycle(value as "monthly" | "yearly")
                }
              />
            </div>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
              }}
            >
              {plans
                .filter((plan) => plan.id !== "enterprise_yearly")
                .map((plan) => (
                  <ChangePlanCard
                    key={plan.id}
                    billingCycle={billingCycle}
                    currentPlanApiId={currentPlanId}
                    isUpdating={isUpdatingPlan}
                    plan={plan}
                    selected={selectedPlan}
                    onSelect={handleSelectPlan}
                  />
                ))}
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
          onOpenChange={(o) => {
            if (!o) closeModalKey("cancel-subscription");
          }}
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
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-lg">Current plan</CardTitle>
            <CardDescription>Your current subscription plan.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              leftIcon={<Repeat className="h-4 w-4" />}
              size={ComponentSizeEnum.SM}
              title="Change plan"
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

          {localSubscriptionInfo?.renewal_date ? (
            <div className="border-border-subtle text-text-muted flex items-center gap-2 border-t pt-4 text-sm">
              <Repeat className="h-4 w-4 shrink-0" />
              <p>
                {localSubscriptionInfo.auto_renew ? "Renews" : "Expires"} on{" "}
                {new Date(
                  localSubscriptionInfo.renewal_date
                ).toLocaleDateString()}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <CancelSubscriptionDialog
        isLoading={isCancelling}
        open={showCancelDialog}
        planName={planName}
        renewalDate={localSubscriptionInfo?.renewal_date || ""}
        onConfirm={handleConfirmCancelSubscription}
        onOpenChange={(o) => {
          if (!o) closeModalKey("cancel-subscription");
        }}
      />
    </>
  );
}
