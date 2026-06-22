"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

import { formatOrderPipeOrderStatusForDisplay } from "@/features/order-pipe/utils/formatOrderPipeOrderStatus";
import { useOrderPipeActivityLogs, useRouteIds } from "@/hooks";
import { useOrderPipePermissions } from "@/hooks/permissions";
import { useVendorForm } from "@/hooks/queries";
import { getHttpErrorStatus } from "@/lib/utils";
import { orgPath } from "@/shared/config/routes";
import { ResourceErrorView } from "@/shared/ui/common";
import { useCmsBreadcrumbLabel } from "@/shared/ui/layout/cmsBreadcrumbOverrides";
import { AccessDeniedView } from "@/shared/ui/permissions";

import { mapActivityLogsToLeadRows } from "../utils/mapActivityLogsToLeadRows";
import { ActivityLogSubpageLayout } from "./ActivityLogSubpageLayout";
import { ActivityLogTable } from "./ActivityLogTable";

export function OrderPipeActivityLogPage() {
  const params = useParams();
  const { orgId } = useRouteIds();
  const { canRead } = useOrderPipePermissions();

  const orderPipeId = params.id as string;
  const detailPath = orgId ? orgPath(orgId, `/order-pipe/${orderPipeId}`) : "";

  const {
    data: orderPipe,
    isLoading: orderLoading,
    isError: orderError,
    error: orderErrorObj,
  } = useVendorForm(orderPipeId, true, { refetchOnMount: "always" });

  const orderTitle =
    orderPipe?.job_name?.trim() ||
    (orderPipe?.po_number ? `PO ${orderPipe.po_number}` : null) ||
    `Order #${orderPipeId}`;

  useCmsBreadcrumbLabel(
    orderTitle,
    detailPath ? { targetPath: detailPath } : undefined
  );

  const {
    data: activityPage,
    isLoading: logsLoading,
    isError: logsError,
    error: logsErrorObj,
  } = useOrderPipeActivityLogs(orderPipeId);

  const rows = useMemo(
    () => mapActivityLogsToLeadRows(activityPage?.results ?? []),
    [activityPage?.results]
  );

  const orderStatusLabel = useMemo(
    () => formatOrderPipeOrderStatusForDisplay(orderPipe?.order_status),
    [orderPipe?.order_status]
  );

  if (!canRead) {
    return (
      <AccessDeniedView message="You do not have permission to view logs." />
    );
  }

  if (orderLoading) {
    return (
      <Loader
        className="min-h-[40vh]"
        size={ComponentSizeEnum.SM}
        text="Loading..."
      />
    );
  }

  if (orderError || !orderPipe) {
    return (
      <ResourceErrorView
        orgId={orgId}
        resourceLabel="order pipe"
        status={getHttpErrorStatus(orderErrorObj)}
      />
    );
  }

  const meta = orderStatusLabel ? (
    <p className="text-text-muted text-sm">{orderStatusLabel}</p>
  ) : null;

  return (
    <ActivityLogSubpageLayout
      backLabel="Back to order"
      badge="Order pipe logs"
      detailButtonLabel="View order pipe details"
      detailHref={detailPath || `/order-pipe/${orderPipeId}`}
      meta={meta}
      subtitle={orderTitle}
    >
      {logsError ? (
        <ResourceErrorView
          orgId={orgId}
          resourceLabel="activity logs"
          status={getHttpErrorStatus(logsErrorObj)}
        />
      ) : (
        <ActivityLogTable
          isLoading={logsLoading}
          rows={rows}
          storageKey={
            orgId
              ? `order-pipe-activity-log:${orgId}:${orderPipeId}`
              : undefined
          }
        />
      )}
    </ActivityLogSubpageLayout>
  );
}

export default OrderPipeActivityLogPage;
