"use client";
import { useState } from "react";
import { MdArrowBack } from "react-icons/md";

import { Button, TabsSwitcher } from "@fieldflow360/org-ui";
import { CheckCircle2, Loader2 } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { type PlanData, plans } from "@/features/billing/lib/plan";
import Features from "@/features/billing/ui/Features";
import { useBilling, useDebounceNavigation } from "@/hooks";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { AUTH_ROUTES } from "@/lib/auth-routes";
import { ContactSalesDialog } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";
import { Badge, Card } from "@/shared/ui/primitives";

export default function SubscribePage() {
  // Use the reactive auth context so that when the role query completes after a
  // fresh login the component re-renders without requiring a manual refresh.
  const { loading: authLoading, currentUser } = useAuth();
  // Storage-based value is a fast initial read but becomes stale after logout
  // clears storage, so treat it as a secondary signal only.
  const canViewPage = useDataFromStorageByKey(StorageKey.IS_OWNER);

  // roleDataReady is true once the role query has resolved for the current org.
  // currentUser?.roleDetails is undefined before the query runs and null/object
  // after it resolves.
  const roleDataReady = currentUser?.roleDetails !== undefined;

  // Primary: reactive context value; fallback: storage value (non-null sessions).
  const isOwner = roleDataReady
    ? currentUser?.roleDetails?.is_owner
    : canViewPage;

  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [showContactSales, setShowContactSales] = useState(false);
  const { navigateTo } = useDebounceNavigation();

  // Replace with your actual organization ID
  const { createCheckoutSession } = useBilling();

  const handleSelectPlan = async (plan: PlanData) => {
    setSelectedPlan(plan);

    if (plan.id === "enterprise") {
      setShowContactSales(true);
      return;
    }

    setIsLoading(true);

    try {
      // Use the correct plan ID format from your available plans
      const planId = plan.apiId[billingCycle];

      // Call the createCheckoutSession endpoint
      const response = await createCheckoutSession(planId);

      // Redirect to Stripe checkout using the URL from the response
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      alert("There was an error processing your request. Please try again.");
      setIsLoading(false);
    }
  };

  // Show a spinner while auth is initializing OR while we're in the gap between
  // a fresh login and the role query completing (storage was cleared on logout,
  // so canViewPage is null until the async query writes IS_OWNER back).
  if (authLoading || (!roleDataReady && isOwner === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-text-muted h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isOwner) {
    return <AccessDeniedView />;
  }

  return (
    <div className="bg-bg-app min-h-screen py-8">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-4 flex items-center">
          <MdArrowBack
            className="text-text-muted mr-2 h-5 w-5"
            onClick={() => navigateTo(AUTH_ROUTES.organizations)}
          />
          <h1 className="text-text-primary text-2xl font-bold">Billings</h1>
        </div>
        <p className="text-text-muted mb-6 text-sm">
          Choose a plan to get started
        </p>

        {/* Free Trial Notice */}
        <div className="bg-bg-surface-elevated mb-8 flex items-center rounded-lg border p-4">
          <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
          <span className="text-text-primary text-sm">
            <span className="font-semibold">Free Trial Available</span> — All
            plans include a 14-day free trial. Your card will not be charged
            until the trial period ends, and you can cancel anytime.
          </span>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="bg-accent text-text-inverse mx-auto flex h-8 w-8 items-center justify-center rounded-full font-semibold">
              1
            </div>
            <div className="text-text-primary mt-1 text-sm font-medium">
              Choose a Plan
            </div>
          </div>
          <div className="border-border-subtle mx-2 flex-1 border-t-2" />
          <div className="text-text-muted flex-1 text-center">
            <div className="border-border-subtle mx-auto flex h-8 w-8 items-center justify-center rounded-full border font-semibold">
              2
            </div>
            <div className="mt-1 text-sm font-medium">Payment Method</div>
          </div>
        </div>

        {/* Plan Selection Section */}
        <div className="mb-8">
          <h2 className="text-text-primary mb-4 text-lg font-semibold">
            Choose a Plan
          </h2>
          <p className="text-text-muted mb-6 text-sm">
            Select the best that works best for your needs
          </p>

          <div className="mb-6 flex justify-end">
            <TabsSwitcher
              items={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Annually" },
              ]}
              value={billingCycle}
              onChange={(value) => setBillingCycle(value)}
            />
          </div>
          <div className="mb-6">
            {billingCycle === "monthly" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {plans
                  .filter((plan) => plan.id !== "enterprise_yearly")
                  .map((plan) => (
                    <Card
                      key={plan.id}
                      className="flex h-full flex-col overflow-hidden rounded-xl border"
                    >
                      <div className="relative flex h-full flex-col p-6">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h3 className="text-text-primary font-semibold">
                              {plan.name}
                            </h3>
                            <p className="text-text-muted text-xs">
                              {plan.description}
                            </p>
                            <p className="text-text-muted text-xs">
                              {plan.maxUsers ? `${plan.maxUsers} users` : ""}
                            </p>
                          </div>
                          {plan.popular && (
                            <Badge
                              className="bg-accent text-text-inverse absolute top-2 right-2 border-0 text-xs"
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
                      </div>
                      <div className="border-t p-6">
                        <Button
                          aria-label={
                            isLoading && selectedPlan?.id === plan.id
                              ? "Processing..."
                              : plan.id === "enterprise"
                                ? "Contact Sales"
                                : "Purchase Plan"
                          }
                          className="w-full"
                          disabled={isLoading && selectedPlan?.id === plan.id}
                          loading={isLoading && selectedPlan?.id === plan.id}
                          title={
                            isLoading && selectedPlan?.id === plan.id
                              ? "Processing..."
                              : plan.id === "enterprise"
                                ? "Contact Sales"
                                : "Purchase Plan"
                          }
                          onClick={() => handleSelectPlan(plan)}
                        />
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
                      <div className="relative flex h-full flex-col p-6">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h3 className="text-text-primary font-semibold">
                              {plan.name}
                            </h3>
                            <p className="text-text-muted text-xs">
                              {plan.description}
                            </p>
                            <p className="text-text-muted text-xs">
                              {plan.maxUsers ? `${plan.maxUsers} users` : ""}
                            </p>
                          </div>
                          {plan.popular && (
                            <Badge
                              className="bg-accent text-text-inverse absolute top-2 right-2 border-0 text-xs"
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
                              {plan.monthlyPrice ? plan.monthlyPrice * 12 : "0"}{" "}
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
                      </div>
                      <div className="border-t p-6">
                        <Button
                          aria-label={
                            isLoading && selectedPlan?.id === plan.id
                              ? "Processing..."
                              : plan.id === "enterprise"
                                ? "Contact Sales"
                                : "Purchase Plan"
                          }
                          className="w-full"
                          disabled={isLoading && selectedPlan?.id === plan.id}
                          loading={isLoading && selectedPlan?.id === plan.id}
                          title={
                            isLoading && selectedPlan?.id === plan.id
                              ? "Processing..."
                              : plan.id === "enterprise"
                                ? "Contact Sales"
                                : "Purchase Plan"
                          }
                          onClick={() => handleSelectPlan(plan)}
                        />
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <Features />
      </div>
      <ContactSalesDialog
        open={showContactSales}
        onOpenChange={setShowContactSales}
      />
    </div>
  );
}
