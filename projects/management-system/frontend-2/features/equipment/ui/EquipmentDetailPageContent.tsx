"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";

import type { MachineV2, TrailerV2, VehicleV2 } from "@/api/types";
import {
  VehicleDetailView,
  getEquipmentDisplayName,
  mapEquipmentTypeToApiCollection,
  useCmsEquipmentDetailBreadcrumb,
} from "@/features/equipment";
import type { VehicleDetailRecord } from "@/features/equipment";
import { useRouteIds } from "@/hooks";
import { useEquipmentPermissions } from "@/hooks/permissions";
import {
  useMachineById,
  useTrailerById,
  useVehicleById,
} from "@/hooks/queries";
import { getHttpErrorStatus } from "@/lib/utils";
import { orgPath } from "@/shared/config/routes";
import { ResourceErrorView } from "@/shared/ui/common";

import ShowMoreMachineCard, {
  type MachineDetailRecord,
} from "./machine/ShowMoreMachineCard";
import ShowMoreTrailerCard, {
  type TrailerDetailRecord,
} from "./trailer/ShowMoreTrailerCard";

function toVehicleDetailRecord(equipment: VehicleV2): VehicleDetailRecord {
  return {
    ...equipment,
    id: String(equipment.id),
    assigned_team_member:
      equipment.assigned_team_member != null
        ? String(equipment.assigned_team_member)
        : null,
  };
}

function toMachineDetailRecord(equipment: MachineV2): MachineDetailRecord {
  return {
    ...equipment,
    id: String(equipment.id),
    assigned_team_member:
      equipment.assigned_team_member != null
        ? String(equipment.assigned_team_member)
        : null,
  };
}

function toTrailerDetailRecord(equipment: TrailerV2): TrailerDetailRecord {
  return {
    ...equipment,
    id: String(equipment.id),
    assigned_team_member:
      equipment.assigned_team_member != null
        ? String(equipment.assigned_team_member)
        : null,
  };
}

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orgId } = useRouteIds();
  const equipmentId = params.id as string;
  const equipmentTypeParam = searchParams.get("equipment_type");

  const {
    canRead: canViewEquipment,
    canWrite: canWriteEquipment,
    canDelete: canDeleteEquipment,
  } = useEquipmentPermissions();

  const equipmentType = mapEquipmentTypeToApiCollection(equipmentTypeParam);

  const machineQuery = useMachineById(
    equipmentId,
    equipmentType === "machines"
  );
  const vehicleQuery = useVehicleById(
    equipmentId,
    equipmentType === "vehicles"
  );
  const trailerQuery = useTrailerById(
    equipmentId,
    equipmentType === "trailers"
  );

  const equipmentQuery =
    equipmentType === "machines"
      ? machineQuery
      : equipmentType === "vehicles"
        ? vehicleQuery
        : trailerQuery;

  const { data: equipment, isLoading, isError, error } = equipmentQuery;

  const breadcrumbLabel = equipment
    ? getEquipmentDisplayName({ ...equipment, id: equipment.id })
    : undefined;

  useCmsEquipmentDetailBreadcrumb(breadcrumbLabel, equipmentTypeParam);

  const handleBack = () => {
    if (orgId) router.push(orgPath(orgId, `/equipment`));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center text-lg">
          Loading equipment details...
        </div>
      </div>
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

  const isVehicle = equipmentType === "vehicles";
  const isTrailer = equipmentType === "trailers";

  return (
    <>
      {isVehicle ? (
        <VehicleDetailView
          canDelete={canDeleteEquipment}
          canRead={canViewEquipment}
          canWrite={canWriteEquipment}
          equipment={toVehicleDetailRecord(equipment as VehicleV2)}
          onBack={handleBack}
        />
      ) : isTrailer ? (
        <ShowMoreTrailerCard
          canDelete={canDeleteEquipment}
          canRead={canViewEquipment}
          canWrite={canWriteEquipment}
          equipment={toTrailerDetailRecord(equipment as TrailerV2)}
          onClose={handleBack}
        />
      ) : (
        <ShowMoreMachineCard
          canDelete={canDeleteEquipment}
          canRead={canViewEquipment}
          canWrite={canWriteEquipment}
          equipment={toMachineDetailRecord(equipment as MachineV2)}
          onClose={handleBack}
        />
      )}
    </>
  );
}
