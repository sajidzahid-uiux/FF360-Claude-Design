"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { CreditCard, Star } from "lucide-react";
import { toast } from "sonner";

import { useBilling, useRouteIds } from "@/hooks";
import type { PaymentCard } from "@/hooks/useBilling";
import { orgPath } from "@/shared/config/routes";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

export default function PaymentMethods() {
  const { setDefaultCard, listCards, addCard } = useBilling();
  const can_view_billing = true;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orgId } = useRouteIds();

  const [paymentMethods, setPaymentMethods] = useState<PaymentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCardFromRedirect, setAddingCardFromRedirect] = useState(false);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      const cards = await listCards();
      setPaymentMethods(cards);
    } catch {
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }, [listCards]);

  useEffect(() => {
    if (can_view_billing) {
      void fetchPaymentMethods();
    }
  }, [can_view_billing, fetchPaymentMethods]);

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
      addCard(setupIntentId)
        .then(() => {
          toast.success("Payment method added successfully!");
          void fetchPaymentMethods();
          router.replace(orgPath(orgId, `/settings/org/billing`));
        })
        .catch(() => {
          toast.error("Failed to add payment method after redirect.");
          router.replace(orgPath(orgId, `/settings/org/billing`));
        })
        .finally(() => setAddingCardFromRedirect(false));
    }
  }, [
    searchParams,
    addingCardFromRedirect,
    addCard,
    router,
    fetchPaymentMethods,
    orgId,
  ]);

  const formatExpiry = (month: number, year: number) => {
    return `${month}/${year.toString().slice(-4)}`;
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      await setDefaultCard(cardId);
      toast.success("Default payment method updated");
      void fetchPaymentMethods();
    } catch {
      toast.error("Failed to update default payment method");
    }
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Payment methods</CardTitle>
        <CardDescription>
          Manage cards used for subscription billing.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <p className="text-text-muted py-8 text-center text-sm">
            Loading payment methods...
          </p>
        ) : paymentMethods.length === 0 ? (
          <p className="text-text-muted py-8 text-center text-sm">
            No payment methods found.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((card) => (
              <div
                key={card.id}
                className="border-border-subtle bg-bg-app flex items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-bg-surface-elevated text-text-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-text-primary truncate text-sm font-medium">
                      {capitalizeFirstLetter(card.brand)} •••• {card.last4}
                    </p>
                    <p className="text-text-muted text-xs">
                      Expires {formatExpiry(card.exp_month, card.exp_year)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {card.is_default ? (
                    <Badge className="text-xs" variant="secondary">
                      Default
                    </Badge>
                  ) : (
                    <Button
                      iconOnly
                      aria-label="Set as default payment method"
                      leftIcon={<Star className="h-4 w-4" />}
                      size={ComponentSizeEnum.SM}
                      variant={ButtonVariantEnum.GHOST}
                      onClick={() => void handleSetDefault(card.id)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
