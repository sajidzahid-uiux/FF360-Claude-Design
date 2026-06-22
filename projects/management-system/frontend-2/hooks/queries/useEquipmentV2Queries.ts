import { useMemo } from "react";

import { type QueryClient, useQuery } from "@tanstack/react-query";

import { EquipmentService } from "@/api/services";
import type {
  EquipmentListParams,
  MachineV2,
  PaginatedEquipmentResponse,
  TrailerV2,
  VehicleV2,
} from "@/api/types";
import { CACHE_TIME } from "@/constants";

import { useRouteIds } from "../useRouteIds";

const DEFAULT_EQUIPMENT_LIST_PARAMS: EquipmentListParams = {
  page: 1,
  page_size: 100,
};

export function prefetchAllEquipment(
  queryClient: QueryClient,
  organizationId: string,
  params: EquipmentListParams = DEFAULT_EQUIPMENT_LIST_PARAMS
) {
  return queryClient.prefetchQuery({
    queryKey: ["equipmentV2", "all", organizationId, params],
    queryFn: () => EquipmentService.getAllEquipment(organizationId, params),
    staleTime: CACHE_TIME.STALE,
  });
}

export function useMachines(params: EquipmentListParams = {}) {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => ["equipmentV2", "machines", organizationId, params],
    [organizationId, params]
  );

  return useQuery<PaginatedEquipmentResponse<MachineV2> | MachineV2[]>({
    queryKey,
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.getMachines(organizationId, params);
    },
    enabled: Boolean(organizationId),
    placeholderData: (previousData) => previousData,
    staleTime: params.sort_by ? 0 : CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useMachineById(
  machineId: string | number,
  enabled: boolean = true
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<MachineV2>({
    queryKey: ["equipmentV2", "machine", organizationId, machineId],
    queryFn: async () => {
      if (!organizationId || !machineId) {
        throw new Error("Organization ID and Machine ID are required");
      }
      return EquipmentService.getMachine(organizationId, machineId);
    },
    enabled: enabled && Boolean(organizationId && machineId),
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useVehicles(params: EquipmentListParams = {}) {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => ["equipmentV2", "vehicles", organizationId, params],
    [organizationId, params]
  );

  return useQuery<PaginatedEquipmentResponse<VehicleV2> | VehicleV2[]>({
    queryKey,
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.getVehicles(organizationId, params);
    },
    enabled: Boolean(organizationId),
    placeholderData: (previousData) => previousData,
    staleTime: params.sort_by ? 0 : CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useVehicleById(
  vehicleId: string | number,
  enabled: boolean = true
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<VehicleV2>({
    queryKey: ["equipmentV2", "vehicle", organizationId, vehicleId],
    queryFn: async () => {
      if (!organizationId || !vehicleId) {
        throw new Error("Organization ID and Vehicle ID are required");
      }
      return EquipmentService.getVehicle(organizationId, vehicleId);
    },
    enabled: enabled && Boolean(organizationId && vehicleId),
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useTrailers(params: EquipmentListParams = {}) {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => ["equipmentV2", "trailers", organizationId, params],
    [organizationId, params]
  );

  return useQuery<PaginatedEquipmentResponse<TrailerV2> | TrailerV2[]>({
    queryKey,
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.getTrailers(organizationId, params);
    },
    enabled: Boolean(organizationId),
    placeholderData: (previousData) => previousData,
    staleTime: params.sort_by ? 0 : CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useTrailerById(
  trailerId: string | number,
  enabled: boolean = true
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<TrailerV2>({
    queryKey: ["equipmentV2", "trailer", organizationId, trailerId],
    queryFn: async () => {
      if (!organizationId || !trailerId) {
        throw new Error("Organization ID and Trailer ID are required");
      }
      return EquipmentService.getTrailer(organizationId, trailerId);
    },
    enabled: enabled && Boolean(organizationId && trailerId),
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useAllEquipment(params: EquipmentListParams = {}) {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => ["equipmentV2", "all", organizationId, params],
    [organizationId, params]
  );

  return useQuery<
    | PaginatedEquipmentResponse<MachineV2 | VehicleV2 | TrailerV2>
    | (MachineV2 | VehicleV2 | TrailerV2)[]
  >({
    queryKey,
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.getAllEquipment(organizationId, params);
    },
    enabled: Boolean(organizationId),
    placeholderData: (previousData) => previousData,
    staleTime: params.sort_order ? 0 : CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
