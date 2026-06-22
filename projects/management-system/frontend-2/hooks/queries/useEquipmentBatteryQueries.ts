import { useQuery } from "@tanstack/react-query";

import { EquipmentBatteryService } from "@/api/services";
import type {
  BatteryReplacementApiResponse,
  BatteryTypeApiResponse,
  BatteryTypeListApiResponse,
} from "@/api/types/equipmentBattery";
import { CACHE_TIME } from "@/constants";
import { EquipmentType } from "@/constants/enums";

import { useRouteIds } from "../useRouteIds";

export function useBatteryTypes() {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<BatteryTypeListApiResponse>({
    queryKey: ["battery-types", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return EquipmentBatteryService.listBatteryTypes(organizationId);
    },
    enabled: Boolean(organizationId),
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useBatteryTypeById(typeId: number | string | null | undefined) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<BatteryTypeApiResponse>({
    queryKey: ["battery-type", typeId, organizationId],
    queryFn: async () => {
      if (!organizationId || !typeId) {
        throw new Error("Organization ID and typeId are required");
      }
      return EquipmentBatteryService.getBatteryType(organizationId, typeId);
    },
    enabled: Boolean(organizationId && typeId),
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useMachineBattery(
  machineId: number | string | null | undefined,
  enabled = true
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<BatteryReplacementApiResponse>({
    queryKey: ["machine-battery", organizationId, machineId],
    queryFn: async () => {
      if (!organizationId || !machineId) {
        throw new Error("Organization ID and machineId are required");
      }
      return EquipmentBatteryService.getEquipmentBatteryReplacement(
        organizationId,
        EquipmentType.MACHINES,
        machineId
      );
    },
    enabled: Boolean(organizationId && machineId && enabled),
    staleTime: 2 * 60 * 1000,
    gcTime: CACHE_TIME.GC,
  });
}

export function useVehicleBattery(
  vehicleId: number | string | null | undefined,
  enabled = true
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<BatteryReplacementApiResponse>({
    queryKey: ["vehicle-battery", organizationId, vehicleId],
    queryFn: async () => {
      if (!organizationId || !vehicleId) {
        throw new Error("Organization ID and vehicleId are required");
      }
      return EquipmentBatteryService.getEquipmentBatteryReplacement(
        organizationId,
        EquipmentType.VEHICLES,
        vehicleId
      );
    },
    enabled: Boolean(organizationId && vehicleId && enabled),
    staleTime: 2 * 60 * 1000,
    gcTime: CACHE_TIME.GC,
  });
}
