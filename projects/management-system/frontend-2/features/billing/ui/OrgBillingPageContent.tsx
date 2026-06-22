"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { TabsSwitcher } from "@fieldflow360/org-ui";
import { loadStripe } from "@stripe/stripe-js";

import type { OrganizationListRow } from "@/api/types";
import { STRIPE_PUBLISHABLE_KEY } from "@/constants";
import { useBilling, useOrganizationData, useRouteIds } from "@/hooks";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import type { SubscriptionInfo } from "@/hooks/useBilling";
import { orgPath } from "@/shared/config/routes";
import { PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";

import CurrentPlan from "./CurrentPlan";
import InvoicesList from "./InvoicesList";
import PaymentMethods from "./PaymentMethods";

type BillingTab = "plan" | "payment" | "invoices";

const BILLING_TABS: { value: BillingTab; label: string }[] = [
  { value: "plan", label: "Plan" },
  { value: "payment", label: "Payment" },
  { value: "invoices", label: "Invoices" },
];

export default function BillingPage() {
  const canViewPage = useDataFromStorageByKey(StorageKey.IS_OWNER);

  const [activeTab, setActiveTab] = useState<BillingTab>("plan");
  const { getSubscriptionInfoWithPermission, addCard } = useBilling();
  const { orgId } = useRouteIds();
  const {
    data: organizationData,
    isLoading,
    error,
    refetch: refetchOrganizationData,
  } = useOrganizationData();

  const currentPlanId = useMemo(
    () =>
      organizationData?.find(
        (org: OrganizationListRow) => org.id === Number(orgId)
      )?.current_plan,
    [organizationData, orgId]
  );

  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [addingCardFromRedirect, setAddingCardFromRedirect] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch subscription info on component mount only if user has permission
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      const info = await getSubscriptionInfoWithPermission(canViewPage);
      setSubscriptionInfo(info);
    };

    fetchSubscriptionInfo();
  }, [canViewPage, getSubscriptionInfoWithPermission]);

  // Log organization data for debugging (no-op when set; used as dependency)
  useEffect(() => {
    if (organizationData) {
      void organizationData;
    }
  }, [organizationData]);

  // Handle Stripe redirect after setup intent (robust, 3D Secure compatible)
  useEffect(() => {
    const setupIntentId = searchParams.get("setup_intent");
    const clientSecretParam = searchParams.get("setup_intent_client_secret");
    const redirectStatus = searchParams.get("redirect_status");

    if (
      setupIntentId &&
      clientSecretParam &&
      redirectStatus === "succeeded" &&
      !addingCardFromRedirect
    ) {
      setAddingCardFromRedirect(true);
      loadStripe(STRIPE_PUBLISHABLE_KEY).then(async (stripe) => {
        if (!stripe) return;
        const result = await stripe.retrieveSetupIntent(clientSecretParam);
        const paymentMethodId = result.setupIntent?.payment_method;
        if (paymentMethodId) {
          addCard(paymentMethodId as string)
            .then(() => {
              // Optionally show a toast here if you want
              router.replace(orgPath(orgId, `/settings/org/billing`));
            })
            .catch(() => {
              // Optionally show an error toast here
              router.replace(orgPath(orgId, `/settings/org/billing`));
            })
            .finally(() => setAddingCardFromRedirect(false));
        } else {
          router.replace(orgPath(orgId, `/settings/org/billing`));
          setAddingCardFromRedirect(false);
        }
      });
    }
  }, [searchParams, addingCardFromRedirect, addCard, router, orgId]);

  const handlePlanChange = async () => {
    // Refresh organization data
    await refetchOrganizationData();

    // Also refresh subscription info
    try {
      const info = await getSubscriptionInfoWithPermission(canViewPage);
      setSubscriptionInfo(info);
    } catch (err) {
      console.error("Error fetching subscription info:", err);
    }
  };

  return (
    <PageRenderer
      data={organizationData || []}
      emptyState={{
        title: "No organization data",
        description: "Organization billing information will appear here.",
      }}
      error={
        error
          ? new Error(error.message || "Failed to load organization data")
          : null
      }
      isLoading={isLoading || false}
      loadingMessage="Loading billing information..."
      padding="none"
      renderChildrenWhenEmpty={true}
      title=""
    >
      {() => {
        if (!canViewPage) {
          return <AccessDeniedView />;
        }

        return (
          <div className="w-full min-w-0 space-y-4">
            <TabsSwitcher
              items={BILLING_TABS}
              value={activeTab}
              onChange={setActiveTab}
            />

            {activeTab === "plan" &&
              (currentPlanId ? (
                <CurrentPlan
                  currentPlanId={currentPlanId}
                  subscriptionInfo={subscriptionInfo}
                  onPlanChange={handlePlanChange}
                />
              ) : (
                <div>
                  <p>No organization ID found</p>
                </div>
              ))}

            {activeTab === "payment" && <PaymentMethods />}

            {activeTab === "invoices" && <InvoicesList />}
          </div>
        );
      }}
    </PageRenderer>
  );
}
