"use client";

import type { ReactNode } from "react";

import type { Vendor } from "@/api/types";
import {
  useOrderPipeWizardActions,
  useOrderPipeWizardSession,
  useOrderPipeWizardStore,
} from "@/features/order-pipe/model/order-pipe-wizard-store";

function requireSessionId(): number {
  const sessionId = useOrderPipeWizardStore.getState().activeSessionId;
  if (sessionId == null) {
    throw new Error(
      "useVendorContext must be used within an active order pipe wizard session"
    );
  }
  return sessionId;
}

export function VendorProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useVendorContext() {
  const vendorFormId = useOrderPipeWizardStore(
    (state) => state.activeSessionId
  );
  const session = useOrderPipeWizardSession(vendorFormId);
  const { setSelectedVendor, setSearchResults } = useOrderPipeWizardActions();

  if (vendorFormId == null || !session) {
    throw new Error("useVendorContext must be used within VendorProvider");
  }

  return {
    selectedVendor: session.selectedVendor,
    setSelectedVendor: (vendor: Vendor | null) => {
      setSelectedVendor(vendorFormId, vendor);
    },
    searchResults: session.searchResults,
    setSearchResults: (vendors: Vendor[]) => {
      setSearchResults(vendorFormId, vendors);
    },
  };
}

export { requireSessionId };
