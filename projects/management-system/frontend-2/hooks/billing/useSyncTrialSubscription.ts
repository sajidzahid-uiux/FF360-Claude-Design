"use client";

import { useEffect } from "react";

import { type SubscriptionInfo, useBilling } from "@/hooks/billing/useBilling";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useOrganizationById } from "@/hooks/useOrganizationData";
import { useRouteIds } from "@/hooks/useRouteIds";
import {
  type TrialSubscriptionInfo,
  useTrialSubscriptionActions,
} from "@/shared/model/user-store";

function toTrialSubscriptionInfo(
  value: SubscriptionInfo | null
): TrialSubscriptionInfo | null {
  if (!value?.trialing || !value.remaining_days) {
    return null;
  }
  return {
    trialing: value.trialing,
    remaining_days: value.remaining_days,
  };
}

export function useSyncTrialSubscription() {
  const { orgId } = useRouteIds();
  const { data: org } = useOrganizationById(orgId);
  const { getSubscriptionInfoWithPermission } = useBilling();
  const { setTrialSubscription } = useTrialSubscriptionActions();

  const isOrgOwner = useDataFromStorageByKey(StorageKey.IS_OWNER) === true;
  const isEnterprisePlan = org?.current_plan?.startsWith("enterprise");

  useEffect(() => {
    const sync = async () => {
      if (!orgId || org === undefined || isEnterprisePlan || !isOrgOwner) {
        setTrialSubscription(null);
        return;
      }

      const info = await getSubscriptionInfoWithPermission(true);
      setTrialSubscription(toTrialSubscriptionInfo(info));
    };

    void sync();
  }, [
    getSubscriptionInfoWithPermission,
    isEnterprisePlan,
    isOrgOwner,
    org,
    orgId,
    setTrialSubscription,
  ]);
}
