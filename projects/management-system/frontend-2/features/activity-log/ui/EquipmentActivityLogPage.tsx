"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

import {
  buildEquipmentDetailHref,
  getEquipmentDisplayName,
  mapEquipmentTypeToApiCollection,
  toEquipmentTypeQueryParam,
  useCmsEquipmentDetailBreadcrumb,
} from "@/features/equipment";
import { useEquipmentActivityLogs, useRouteIds } from "@/hooks";
import { useRoutePermissions } from "@/hooks/permissions";
import {
  useMachineById,
  useTrailerById,
  useVehicleById,
} from "@/hooks/queries";
import { getHttpErrorStatus } from "@/lib/utils";
import { ResourceErrorView } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";

import { mapActivityLogsToLeadRows } from "../utils/mapActivityLogsToLeadRows";
import { ActivityLogSubpageLayout } from "./ActivityLogSubpageLayout";
import { ActivityLogTable } from "./ActivityLogTable";

export function EquipmentActivityLogPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { orgId } = useRouteIds();

  const routePerms = useRoutePermissions();
  const canReadEquipment = Boolean(routePerms?.read);

  const equipmentId = params.id as string;
  const equipmentTypeParam = searchParams.get("equipment_type");
  const equipmentNameFromQuery = searchParams.get("name") || "";

  const equipmentTypeMapped =
    mapEquipmentTypeToApiCollection(equipmentTypeParam);

  const machineQuery = useMachineById(
    equipmentId,
    equipmentTypeMapped === "machines"
  );
  const vehicleQuery = useVehicleById(
    equipmentId,
    equipmentTypeMapped === "vehicles"
  );
  const trailerQuery = useTrailerById(
    equipmentId,
    equipmentTypeMapped === "trailers"
  );

  const equipmentQuery =
    equipmentTypeMapped === "machines"
      ? machineQuery
      : equipmentTypeMapped === "vehicles"
        ? vehicleQuery
        : trailerQuery;

  const { data: equipment, isLoading, isError, error } = equipmentQuery;

  const equipmentTitle =
    equipmentNameFromQuery ||
    (equipment
      ? getEquipmentDisplayName({ ...equipment, id: equipment.id })
      : "");

  useCmsEquipmentDetailBreadcrumb(
    equipmentTitle || undefined,
    equipmentTypeParam
  );

  const {
    data: activityPage,
    isLoading: logsLoading,
    isError: logsError,
    error: logsErrorObj,
  } = useEquipmentActivityLogs(equipmentId);

  const rows = useMemo(
    () => mapActivityLogsToLeadRows(activityPage?.results ?? []),
    [activityPage?.results]
  );

  const detailHref = useMemo(() => {
    if (!orgId || !equipment) return "";
    const typeQuery =
      equipmentTypeParam ??
      (equipmentTypeMapped === "vehicles"
        ? "vehicle"
        : equipmentTypeMapped === "trailers"
          ? "trailer"
          : "machine");
    return buildEquipmentDetailHref(orgId, {
      id: equipment.id,
      equipment_ptr_id:
        "equipment_ptr_id" in equipment && equipment.equipment_ptr_id != null
          ? equipment.equipment_ptr_id
          : equipment.id,
      equipment_type: toEquipmentTypeQueryParam(typeQuery),
    });
  }, [equipment, equipmentTypeMapped, equipmentTypeParam, orgId]);

  if (!canReadEquipment) {
    return (
      <AccessDeniedView message="You do not have permission to view logs." />
    );
  }

  if (isLoading) {
    return (
      <Loader
        className="min-h-[40vh]"
        size={ComponentSizeEnum.SM}
        text="Loading..."
      />
    );
  }

  if (isError || !equipment) {
    const status = getHttpErrorStatus(error);
    return (
      <ResourceErrorView
        orgId={orgId}
        resourceLabel="equipment"
        status={status}
      />
    );
  }

  const title = equipmentTitle || `Equipment #${equipmentId}`;

  return (
    <ActivityLogSubpageLayout
      backLabel="Back to equipment"
      badge="Equipment logs"
      detailButtonLabel="View equipment details"
      detailHref={detailHref}
      subtitle={title}
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
            orgId ? `equipment-activity-log:${orgId}:${equipmentId}` : undefined
          }
        />
      )}
    </ActivityLogSubpageLayout>
  );
}
