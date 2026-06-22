"use client";

import { useCallback, useEffect, useRef } from "react";

import { toast } from "sonner";

import type { VendorFormV2 } from "@/api/types";
import { useCanProceed, useOrderPipeCategories } from "@/hooks/queries";

import {
  useOrderDetailsContext,
  useVendorContext,
  useVendorFormContext,
} from "../context";
import { mapVendorFormVendorToVendor } from "../utils/mapVendorFormVendorToVendor";
import { vendorFormItemsToOrderDetailsItems } from "../utils/transformVendorFormItemsToOrderDetails";

interface UseOrderPipeStepNavigationParams {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  order: VendorFormV2;
}

/**
 * Manages step navigation for the Order Pipe wizard.
 *
 * Responsibilities:
 * - Restores vendor and order items from the order on initial load
 * - Validates the current step before allowing forward navigation
 * - Provides `handleStepClick` for the stepper to call
 */
export function useOrderPipeStepNavigation({
  currentStep,
  setCurrentStep,
  order,
}: UseOrderPipeStepNavigationParams) {
  const { selectedVendor, setSelectedVendor } = useVendorContext();
  const { orderItems, setOrderItems } = useOrderDetailsContext();
  const { vendorFormId } = useVendorFormContext();
  const { categories, isFetched: isCategoriesFetched } = useOrderPipeCategories(
    {
      providerId: order.vendor?.provider_id ?? null,
      enabled: true,
    }
  );
  const hasRestoredVendorRef = useRef(false);
  const hasRestoredOrderItemsRef = useRef(false);

  const lastValidatedProviderIdRef = useRef<number | null>(null);

  // Restore vendor from order on initial load
  useEffect(() => {
    if (hasRestoredVendorRef.current) return;
    if (!order?.vendor_id || !order?.vendor) return;
    hasRestoredVendorRef.current = true;
    setSelectedVendor(mapVendorFormVendorToVendor(order.vendor));
    lastValidatedProviderIdRef.current = order.vendor.provider_id;
  }, [order?.vendor_id, order?.vendor, setSelectedVendor]);

  useEffect(() => {
    if (hasRestoredOrderItemsRef.current) return;
    if (!isCategoriesFetched) return;
    if (!order?.items || order.items.length === 0) return;
    if (orderItems.length > 0) return;

    hasRestoredOrderItemsRef.current = true;
    setOrderItems(
      vendorFormItemsToOrderDetailsItems(order.items, categories ?? [])
    );
  }, [
    isCategoriesFetched,
    order?.items,
    orderItems.length,
    categories,
    setOrderItems,
  ]);

  const { refetch: refetchCanProceed } = useCanProceed(
    vendorFormId,
    currentStep === 3
  );

  const handleStepClick = useCallback(
    async (targetStep: number) => {
      if (targetStep === currentStep) return;

      // Backward navigation is always allowed
      if (targetStep < currentStep) {
        setCurrentStep(targetStep);
        return;
      }

      // Only allow moving one step forward at a time
      if (targetStep > currentStep + 1) return;

      // Validate current step before proceeding
      if (currentStep === 1) {
        if (!selectedVendor) {
          toast.error("Please select a vendor before proceeding");
          return;
        }

        const currentProviderId = selectedVendor.provider?.id;
        const lastProviderId = lastValidatedProviderIdRef.current;

        const providerChangedInSession =
          currentProviderId != null &&
          lastProviderId != null &&
          currentProviderId !== lastProviderId;

        if (providerChangedInSession) {
          setOrderItems([]);
        } else if (orderItems.length === 0 && (order.items?.length ?? 0) > 0) {
          setOrderItems(
            vendorFormItemsToOrderDetailsItems(order.items ?? [], categories)
          );
        }

        lastValidatedProviderIdRef.current = currentProviderId ?? null;
      } else if (currentStep === 2) {
        if (orderItems.length === 0) {
          toast.error("Please add at least one item before proceeding");
          return;
        }
        if (!vendorFormId) {
          toast.error("Vendor form not found. Please go back to Step 1.");
          return;
        }
      } else if (currentStep === 3) {
        if (!vendorFormId) {
          toast.error("Vendor form not found. Please go back to Step 1.");
          return;
        }
        try {
          const { data: proceedData } = await refetchCanProceed();
          if (proceedData && !proceedData.can_proceed) {
            toast.error(proceedData.message || "Cannot proceed to next step");
            return;
          }
        } catch {
          toast.error("Failed to validate step. Please try again.");
          return;
        }
      }

      setCurrentStep(targetStep);
    },
    [
      currentStep,
      selectedVendor,
      orderItems.length,
      vendorFormId,
      order.items,
      categories,
      setCurrentStep,
      setOrderItems,
      refetchCanProceed,
    ]
  );

  return { handleStepClick };
}
