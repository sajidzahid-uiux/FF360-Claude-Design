"use client";

import { useParams, useRouter } from "next/navigation";

import { useRouteIds } from "@/hooks";
import {
  PERMISSION_RESOURCES,
  usePermissionsFromStorage,
} from "@/hooks/permissions";
import { useVendorFormForOrderPipeView } from "@/hooks/queries";
import { getHttpErrorStatus } from "@/lib/utils";
import { orgPath } from "@/shared/config/routes";
import { ResourceErrorView } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";

import { OrderPipeDetailView } from "./OrderPipeDetailView";

export default function OrderPipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orgId } = useRouteIds();
  const orderId = params.id as string;

  const { permissionCodes: orderPipesPermissions } = usePermissionsFromStorage(
    PERMISSION_RESOURCES.ORDER_PIPES_LIST
  );
  const canViewOrderPipes = orderPipesPermissions.includes("read");

  const {
    data: vendorForm,
    isLoading,
    isError: orderIsError,
    error: orderError,
  } = useVendorFormForOrderPipeView(orderId);

  // Only block the UI until the first successful fetch. Waiting on `isRefetching`
  // unmounts the wizard during background refetches (stale data, window focus),
  // which resets local step state and jumps the user to `getInitialStep()`.
  const isInitialLoad = isLoading && vendorForm == null;

  if (!canViewOrderPipes) {
    return (
      <AccessDeniedView message="You do not have permission to view Order Pipes." />
    );
  }

  if (isInitialLoad) {
    return (
      <p className="flex items-center justify-center p-4 md:p-6">
        Loading order...
      </p>
    );
  }

  if (orderIsError || !vendorForm) {
    const status = getHttpErrorStatus(orderError);
    return (
      <ResourceErrorView orgId={orgId} resourceLabel="order" status={status} />
    );
  }

  return (
    <OrderPipeDetailView
      order={vendorForm}
      onClose={() => orgId && router.push(orgPath(orgId, `/order-pipe`))}
    />
  );
}
