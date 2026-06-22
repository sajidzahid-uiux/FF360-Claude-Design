"use client";

import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouteIds } from "@/hooks/lib/useRouteIds";
import axios from "@/lib/axios";
import { getErrorMessage } from "@/utils/apiError";

export interface PaymentCard {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface SubscriptionInfo {
  renewal_date: string;
  remaining_days: number;
  trialing: boolean;
  auto_renew: boolean;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  invoices: {
    amount_paid: number;
    status: string;
    created: string;
  }[];
}

interface Invoice {
  id: string;
  status: string;
  amount_paid: number;
  billing_date: string;
  plan: string;
  invoice_pdf: string;
}

const NO_ACTIVE_SUBSCRIPTION_MESSAGE = "no active Stripe subscription";

function getAxiosResponseStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return undefined;
  }
  const response = (error as { response?: { status?: number } }).response;
  return response?.status;
}

export const useBilling = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noActiveSubscription, setNoActiveSubscription] = useState(false);
  const { orgId } = useRouteIds();
  const { selectedOrganization } = useAuth();
  const organizationId = orgId || selectedOrganization;
  // Stripe checkout session
  const createCheckoutSession = async (planId: string) => {
    if (!organizationId) {
      throw new Error("No organization ID found");
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `/ms/organizations/${organizationId}/create-checkout-session/`,
        {
          plan: planId,
        }
      );
      return response.data;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(
        err,
        "Failed to create checkout session"
      );
      console.error("Create checkout session error:", err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change subscription plan
  const changePlan = async (newPlanId: string) => {
    if (!organizationId) {
      throw new Error("No organization ID found");
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `/ms/organizations/${organizationId}/change-plan/`,
        {
          plan: newPlanId,
        }
      );
      return response.data;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Failed to change plan");
      console.error("Change plan error:", err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async (cancelAtPeriodEnd: boolean = true) => {
    if (!organizationId) {
      throw new Error("No organization ID found");
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `/ms/organizations/${organizationId}/cancel-plan/`,
        {
          cancel_at_period_end: cancelAtPeriodEnd,
        }
      );
      return response.data;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Failed to cancel subscription");
      console.error("Cancel subscription error:", err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get subscription info
  // const getSubscriptionInfo = async (): Promise<SubscriptionInfo | null> => {
  //   setLoading(true);
  //   setError(null);
  //   if (!organizationId) {
  //     throw new Error("No organization ID found");
  //   }
  //   try {
  //     const response = await axios.get(
  //       `/ms/organizations/${organizationId}/subscription-info/`
  //     );
  //     return response.data;
  //   } catch (err: any) {
  //     const errorMsg =
  //       err.response?.data?.message || "Failed to get subscription info";
  //     console.error("Subscription info error:", err);
  //     setError(errorMsg);
  //     return null;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Get subscription info with permission check
  const getSubscriptionInfoWithPermission = useCallback(
    async (hasPermission?: boolean): Promise<SubscriptionInfo | null> => {
      if (!hasPermission) {
        return null;
      }

      setLoading(true);
      setError(null);
      if (!organizationId) {
        throw new Error("No organization ID found");
      }
      try {
        setNoActiveSubscription(false);
        const response = await axios.get(
          `/ms/organizations/${organizationId}/subscription-info/`
        );
        return response.data;
      } catch (err: unknown) {
        const status = getAxiosResponseStatus(err);
        if (status === 403 || status === 401) {
          return null;
        }

        const response =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { status?: number; data?: unknown } })
                .response
            : undefined;
        const data = response?.data;
        const message = Array.isArray(data)
          ? data.join(" ")
          : data &&
              typeof data === "object" &&
              "message" in data &&
              typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "";
        if (
          status === 400 &&
          (message || String(data))
            .toLowerCase()
            .includes(NO_ACTIVE_SUBSCRIPTION_MESSAGE.toLowerCase())
        ) {
          setNoActiveSubscription(true);
        }
        const errorMsg = getErrorMessage(
          err,
          "Failed to get subscription info"
        );
        console.error("Subscription info error:", err);
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [organizationId]
  );

  // Toggle auto-renew
  const toggleAutoRenew = async (enable?: boolean) => {
    if (!organizationId) {
      throw new Error("No organization ID found");
    }

    setLoading(true);
    setError(null);
    try {
      // If enable is not explicitly provided, we'll need to get the current state first
      // and toggle it, but for now we'll send the explicit value if provided
      const payload = {
        enable: enable !== undefined ? enable : true,
      };

      const response = await axios.post(
        `/ms/organizations/${organizationId}/toggle-auto-renew/`,
        payload
      );
      return response.data;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Failed to toggle auto-renew");
      console.error("Toggle auto-renew error:", err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add payment method/card
  const addCard = useCallback(
    async (paymentMethodId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `/ms/organizations/${organizationId}/add-card/`,
          {
            payment_method_id: paymentMethodId,
          }
        );
        return response.data;
      } catch (err: unknown) {
        const errorMsg = getErrorMessage(err, "Failed to add card");
        console.error("Add card error:", err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [organizationId]
  );

  // List payment methods/cards
  const listCards = useCallback(async (): Promise<PaymentCard[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `/ms/organizations/${organizationId}/list-cards/`
      );
      return response.data;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Failed to list cards");
      console.error("List cards error:", err);
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Delete payment method/card
  const deleteCard = useCallback(
    async (paymentMethodId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.delete(
          `/ms/organizations/${organizationId}/delete-card/?payment_method_id=${paymentMethodId}`
        );
        return response.data;
      } catch (err: unknown) {
        const errorMsg = getErrorMessage(err, "Failed to delete card");
        console.error("Delete card error:", err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [organizationId]
  );

  // Set default payment method/card
  const setDefaultCard = useCallback(
    async (paymentMethodId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `/ms/organizations/${organizationId}/default-card/`,
          {
            payment_method_id: paymentMethodId,
          }
        );
        return response.data;
      } catch (err: unknown) {
        const errorMsg = getErrorMessage(err, "Failed to set default card");
        console.error("Set default card error:", err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [organizationId]
  );

  // Get invoices (you might need to add this endpoint to your backend)
  const getInvoices = async (): Promise<Invoice[]> => {
    if (!organizationId) {
      throw new Error("No organization ID found");
    }

    setLoading(true);
    setError(null);
    try {
      // Assuming there's an endpoint for fetching invoices
      const response = await axios.get(
        `/ms/organizations/${organizationId}/invoices/`
      );
      return response.data;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Failed to get invoices");
      console.error("Get invoices error:", err);
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    noActiveSubscription,
    createCheckoutSession,
    changePlan,
    cancelSubscription,
    // getSubscriptionInfo,
    getSubscriptionInfoWithPermission,
    toggleAutoRenew,
    addCard,
    listCards,
    deleteCard,
    setDefaultCard,
    getInvoices,
  };
};
