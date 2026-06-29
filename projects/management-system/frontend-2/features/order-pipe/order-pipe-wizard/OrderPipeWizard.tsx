"use client";

import { useEffect, useMemo } from "react";

import type { RemainedOrderedItem, VendorFormV2 } from "@/api/types";
import {
  useOrderPipeWizardActions,
  useOrderPipeWizardSession,
  useOrderPipeWizardStore,
} from "@/features/order-pipe/model/order-pipe-wizard-store";
import { usePipeDropPayload } from "@/hooks/queries";

import {
  OrderDetails,
  OrderPipeActions,
  OrderPipeWizardStepHeader,
  OrderPipeWizardStepIndicator,
  OrderSummary,
  PipeDropLocation,
  VendorSelection,
} from "./components/index";
import { MapRefProvider } from "./components/order-summary/MapRefContext";
import {
  OrderDetailsProvider,
  VendorFormProvider,
  VendorProvider,
  useOrderDetailsContext,
  useVendorContext,
} from "./context";
import { useOrderPipeStepNavigation } from "./hooks/useOrderPipeStepNavigation";

interface OrderPipeWizardProps {
  order: VendorFormV2;
  onClose: () => void;
}

const STEP_CONFIG = {
  1: {
    title: "Select Vendor",
    warning: "You must select a vendor before proceeding to Step 2.",
    component: VendorSelection,
  },
  2: {
    title: "Order Details",
    warning: "You must order items before proceeding to Step 3.",
    component: OrderDetails,
  },
  3: {
    title: "Pipe Drop Location",
    warning:
      "You must select a location for all your ordered items before proceeding to Step 4.",
    component: PipeDropLocation,
  },
  4: {
    title: "Review",
    warning: undefined,
    component: OrderSummary,
  },
};

function OrderPipeWizardStepHeaderWithVendorWarning({
  stepNumber,
  stepConfig,
  onBack,
}: {
  stepNumber: number;
  stepConfig: (typeof STEP_CONFIG)[keyof typeof STEP_CONFIG];
  onBack: () => void;
}) {
  const { selectedVendor } = useVendorContext();
  const { orderItems } = useOrderDetailsContext();
  const shouldHideWarning =
    (stepNumber === 1 && Boolean(selectedVendor)) ||
    (stepNumber === 2 && orderItems.length > 0) ||
    stepNumber === 3;
  const warning = shouldHideWarning ? undefined : stepConfig.warning;
  return (
    <OrderPipeWizardStepHeader
      stepNumber={stepNumber}
      title={stepConfig.title}
      warning={warning}
      onBack={onBack}
    />
  );
}

function getInitialStep(
  order: VendorFormV2,
  remainedOrderedItems?: RemainedOrderedItem[] | null
): number {
  const hasVendor = Boolean(order?.vendor_id);
  const hasItems = Boolean(order?.items && order.items.length > 0);
  const deliveryLocations = order?.delivery_locations ?? [];
  const allDeliveryLocationsHaveItems =
    deliveryLocations.length > 0 &&
    deliveryLocations.every((loc) => loc.items && loc.items.length >= 1);
  const noRemainingItems =
    !remainedOrderedItems ||
    remainedOrderedItems.length === 0 ||
    remainedOrderedItems.every((r) => r.remained_quantity <= 0);

  if (
    hasVendor &&
    hasItems &&
    noRemainingItems &&
    allDeliveryLocationsHaveItems
  ) {
    return 4;
  }
  if (hasVendor && hasItems) return 3;
  if (hasVendor) return 2;
  return 1;
}

function OrderPipeWizardLayout({
  currentStep,
  setCurrentStep,
  order,
  onClose,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  order: VendorFormV2;
  onClose: () => void;
}) {
  const { handleStepClick } = useOrderPipeStepNavigation({
    currentStep,
    setCurrentStep,
    order,
  });

  const stepConfig = STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG];
  const StepComponent = stepConfig.component;
  const {
    Left: LeftContent,
    Right: RightContent,
    Mobile: MobileContent,
  } = StepComponent;

  const isReviewStep = currentStep === 4;

  const content = (
    <div className="bg-bg-app w-full p-4 md:p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <OrderPipeWizardStepHeaderWithVendorWarning
              stepConfig={stepConfig}
              stepNumber={currentStep}
              onBack={onClose}
            />
          </div>
          <OrderPipeActions
            currentStep={currentStep}
            orderId={order?.id}
            onClose={onClose}
          />
        </div>

        {/* Mobile */}
        <div className="mt-2 lg:hidden">
          <OrderPipeWizardStepIndicator
            currentStep={currentStep}
            orientation="horizontal"
            onStepClick={handleStepClick}
          />
        </div>

        <div className="mt-4 lg:hidden">
          <MobileContent />
        </div>

        {/* Desktop layout */}
        <div className="mt-6 hidden gap-8 lg:flex lg:h-[calc(100svh-15rem)] lg:min-h-[520px] lg:items-stretch">
          <div className="w-12 flex-shrink-0">
            <OrderPipeWizardStepIndicator
              currentStep={currentStep}
              orientation="vertical"
              onStepClick={handleStepClick}
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <LeftContent />
          </div>

          {RightContent && (
            <aside
              className={`flex min-h-0 flex-shrink-0 flex-col gap-6 ${
                currentStep === 2
                  ? "w-[40%] max-w-[590px]"
                  : "w-[35%] max-w-[500px]"
              }`}
            >
              <RightContent />
            </aside>
          )}
        </div>
      </div>
    </div>
  );

  return isReviewStep ? (
    <MapRefProvider>{content}</MapRefProvider>
  ) : (
    <>{content}</>
  );
}

function OrderPipeWizardContent({
  order,
  onClose,
  remainedOrderedItems,
}: {
  order: VendorFormV2;
  onClose: () => void;
  remainedOrderedItems: RemainedOrderedItem[];
}) {
  const { openSession, closeSession, setCurrentStep } =
    useOrderPipeWizardActions();
  const initialStep = useMemo(
    () => getInitialStep(order, remainedOrderedItems),
    [order, remainedOrderedItems]
  );

  useEffect(() => {
    openSession(order, initialStep);
    return () => {
      closeSession(order.id);
    };
  }, [closeSession, initialStep, openSession, order]);

  const session = useOrderPipeWizardSession(order.id);
  const activeSessionId = useOrderPipeWizardStore(
    (state) => state.activeSessionId
  );
  const currentStep = session?.currentStep ?? initialStep;

  // `openSession` runs in the effect above (after the first render), but the
  // wizard layout reads the active session synchronously via useVendorContext.
  // Until the session for THIS order is active, render a loader so opening an
  // order on first load (e.g. a fresh tab, deep link, or right after creating
  // one) doesn't throw "must be used within VendorProvider".
  if (!session || activeSessionId !== order.id) {
    return (
      <p className="bg-bg-app text-text-muted flex items-center justify-center p-4 md:p-6">
        Loading order pipe...
      </p>
    );
  }

  return (
    <VendorProvider>
      <VendorFormProvider initialVendorFormId={order.id}>
        <OrderDetailsProvider order={order}>
          <OrderPipeWizardLayout
            currentStep={currentStep}
            order={order}
            setCurrentStep={(step) => setCurrentStep(order.id, step)}
            onClose={onClose}
          />
        </OrderDetailsProvider>
      </VendorFormProvider>
    </VendorProvider>
  );
}

export function OrderPipeWizard({ order, onClose }: OrderPipeWizardProps) {
  const { remainedOrderedItems, isFetched: isPipeDropFetched } =
    usePipeDropPayload(order?.id ?? null, !!order?.id);

  const needsPipeDropForStep =
    Boolean(order?.vendor_id) && (order?.items?.length ?? 0) > 0;
  const isResolvingInitialStep = needsPipeDropForStep && !isPipeDropFetched;

  if (isResolvingInitialStep) {
    return (
      <p className="bg-bg-app text-text-muted flex items-center justify-center p-4 md:p-6">
        Loading order pipe...
      </p>
    );
  }

  return (
    <OrderPipeWizardContent
      order={order}
      remainedOrderedItems={remainedOrderedItems}
      onClose={onClose}
    />
  );
}
