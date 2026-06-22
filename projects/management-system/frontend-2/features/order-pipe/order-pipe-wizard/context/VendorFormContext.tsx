"use client";

import type { ReactNode } from "react";

import {
  useOrderPipeWizardActions,
  useOrderPipeWizardStore,
} from "@/features/order-pipe/model/order-pipe-wizard-store";

export function VendorFormProvider({
  children,
}: {
  children: ReactNode;
  initialVendorFormId?: number | null;
}) {
  return <>{children}</>;
}

export function useVendorFormContext() {
  const vendorFormId = useOrderPipeWizardStore(
    (state) => state.activeSessionId
  );

  if (vendorFormId == null) {
    throw new Error(
      "useVendorFormContext must be used within VendorFormProvider"
    );
  }

  const { openSession } = useOrderPipeWizardActions();

  return {
    vendorFormId,
    setVendorFormId: (id: number | null) => {
      if (id == null) return;
      const session = useOrderPipeWizardStore.getState().sessions[id];
      if (session) {
        useOrderPipeWizardStore.setState({ activeSessionId: id });
        return;
      }
      const current = useOrderPipeWizardStore.getState().activeSessionId;
      const fallback = current
        ? useOrderPipeWizardStore.getState().sessions[current]?.order
        : null;
      if (fallback) {
        openSession(fallback, 1);
      }
    },
  };
}
