"use client";

import { useSyncTrialSubscription } from "@/hooks/useSyncTrialSubscription";
import { useTrialSubscription } from "@/shared/model/user-store";

export function FreeTrialSpan() {
  useSyncTrialSubscription();
  const trialSubscription = useTrialSubscription();

  if (!trialSubscription?.trialing || !trialSubscription.remaining_days) {
    return null;
  }

  const { remaining_days } = trialSubscription;

  return (
    <span className="bg-accent absolute bottom-4 left-[50%] z-50 flex -translate-x-1/2 items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium text-black">
      Free Trial: You have {remaining_days} day
      {remaining_days > 1 ? "s" : ""} left.
    </span>
  );
}
