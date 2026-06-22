import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { EquipmentService } from "@/api/services";
import type {
  MachineCreatePayload,
  MachineUpdatePayload,
  MachineV2,
  TrailerCreatePayload,
  TrailerUpdatePayload,
  TrailerV2,
  VehicleCreatePayload,
  VehicleUpdatePayload,
  VehicleV2,
} from "@/api/types";
import type { IdOf, IdUpdatePayload } from "@/api/types/common";
import { QUERY_KEYS } from "@/constants";
import { EquipmentType } from "@/constants/enums";
import { getErrorMessage } from "@/utils/apiError";

import { invalidateEquipmentActivityLogs } from "../queries/invalidateActivityLogs";
import { invalidateEquipmentMaintenanceChecks } from "../queries/invalidateEquipmentMaintenanceCheck";
import { useRouteIds } from "../useRouteIds";

function invalidateMachineListCaches(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ["equipmentV2", "machines"] });
  void queryClient.invalidateQueries({ queryKey: ["equipmentV2", "all"] });
  void queryClient.invalidateQueries({ queryKey: ["equipment"] });
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAINTENANCE] });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.IS_ACTIVE_MAINTENANCE],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.RECORD_EQUIPMENT],
  });
  invalidateEquipmentMaintenanceChecks(queryClient);
}

function invalidateVehicleListCaches(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ["equipmentV2", "vehicles"] });
  void queryClient.invalidateQueries({ queryKey: ["equipmentV2", "all"] });
  void queryClient.invalidateQueries({ queryKey: ["equipment"] });
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAINTENANCE] });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.IS_ACTIVE_MAINTENANCE],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.RECORD_EQUIPMENT],
  });
  invalidateEquipmentMaintenanceChecks(queryClient);
}

function invalidateTrailerListCaches(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ["equipmentV2", "trailers"] });
  void queryClient.invalidateQueries({ queryKey: ["equipmentV2", "all"] });
  void queryClient.invalidateQueries({ queryKey: ["equipment"] });
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAINTENANCE] });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.IS_ACTIVE_MAINTENANCE],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.RECORD_EQUIPMENT],
  });
  invalidateEquipmentMaintenanceChecks(queryClient);
}

function invalidatePostTrashSideEffects(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ["unified-equipment"] });
  void queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB] });
}

export function useCreateMachine() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (data: MachineCreatePayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.createMachine(organizationId, data);
    },
    onSuccess: (data) => {
      invalidateMachineListCaches(queryClient);
      invalidateEquipmentActivityLogs(queryClient, organizationId, data.id);
      toast.success("Machine created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create machine"));
    },
  });
}

export function useUpdateMachine() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ id, data }: IdUpdatePayload<MachineUpdatePayload>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.updateMachine(organizationId, id, data);
    },
    onSuccess: (_, variables) => {
      invalidateMachineListCaches(queryClient);
      void queryClient.invalidateQueries({
        queryKey: ["equipmentV2", "machine"],
      });
      invalidateEquipmentActivityLogs(
        queryClient,
        organizationId,
        variables.id
      );
      toast.success("Machine updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update machine"));
    },
  });
}

export function useDeleteMachine() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (id: IdOf<MachineV2>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      await EquipmentService.deleteMachine(organizationId, id);
    },
    onSuccess: (_data, id) => {
      invalidateMachineListCaches(queryClient);
      void queryClient.invalidateQueries({
        queryKey: ["equipmentV2", "machine"],
      });
      invalidateEquipmentActivityLogs(queryClient, organizationId, id);
      toast.success("Machine deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete machine"));
    },
  });
}

export function useTrashMachine() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (id: IdOf<MachineV2>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.putToTrash(
        organizationId,
        EquipmentType.MACHINES,
        id
      );
    },
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({
        queryKey: ["equipmentV2", "machines"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["equipmentV2", "machine"],
      });
      void queryClient.invalidateQueries({ queryKey: ["equipmentV2", "all"] });
      void queryClient.invalidateQueries({ queryKey: ["equipment"] });
      invalidatePostTrashSideEffects(queryClient);
      invalidateEquipmentActivityLogs(queryClient, organizationId, id);
      toast.success("Machine trashed successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to trash machine"));
    },
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (data: VehicleCreatePayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.createVehicle(organizationId, data);
    },
    onSuccess: (data) => {
      invalidateVehicleListCaches(queryClient);
      invalidateEquipmentActivityLogs(queryClient, organizationId, data.id);
      toast.success("Vehicle created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create vehicle"));
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ id, data }: IdUpdatePayload<VehicleUpdatePayload>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.updateVehicle(organizationId, id, data);
    },
    onSuccess: (_, variables) => {
      invalidateVehicleListCaches(queryClient);
      void queryClient.invalidateQueries({
        queryKey: ["equipmentV2", "vehicle"],
      });
      invalidateEquipmentActivityLogs(
        queryClient,
        organizationId,
        variables.id
      );
      toast.success("Vehicle updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update vehicle"));
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (id: IdOf<VehicleV2>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      await EquipmentService.deleteVehicle(organizationId, id);
    },
    onSuccess: (_data, id) => {
      invalidateVehicleListCaches(queryClient);
      void queryClient.invalidateQueries({
        queryKey: ["equipmentV2", "vehicle"],
      });
      invalidateEquipmentActivityLogs(queryClient, organizationId, id);
      toast.success("Vehicle deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete vehicle"));
    },
  });
}

export function useTrashVehicle() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (id: IdOf<VehicleV2>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.putToTrash(
        organizationId,
        EquipmentType.VEHICLES,
        id
      );
    },
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({
        queryKey: ["equipmentV2", "vehicles"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["equipmentV2", "vehicle"],
      });
      void queryClient.invalidateQueries({ queryKey: ["equipmentV2", "all"] });
      void queryClient.invalidateQueries({ queryKey: ["equipment"] });
      invalidatePostTrashSideEffects(queryClient);
      invalidateEquipmentActivityLogs(queryClient, organizationId, id);
      toast.success("Vehicle trashed successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to trash vehicle"));
    },
  });
}

export function useCreateTrailer() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (data: TrailerCreatePayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.createTrailer(organizationId, data);
    },
    onSuccess: (data) => {
      invalidateTrailerListCaches(queryClient);
      invalidateEquipmentActivityLogs(queryClient, organizationId, data.id);
      toast.success("Trailer created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create trailer"));
    },
  });
}

export function useUpdateTrailer() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ id, data }: IdUpdatePayload<TrailerUpdatePayload>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.updateTrailer(organizationId, id, data);
    },
    onSuccess: (_, variables) => {
      invalidateTrailerListCaches(queryClient);
      void queryClient.invalidateQueries({
        queryKey: ["equipmentV2", "trailer"],
      });
      invalidateEquipmentActivityLogs(
        queryClient,
        organizationId,
        variables.id
      );
      toast.success("Trailer updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update trailer"));
    },
  });
}

export function useDeleteTrailer() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (id: IdOf<TrailerV2>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      await EquipmentService.deleteTrailer(organizationId, id);
    },
    onSuccess: (_data, id) => {
      invalidateTrailerListCaches(queryClient);
      void queryClient.invalidateQueries({
        queryKey: ["equipmentV2", "trailer"],
      });
      invalidateEquipmentActivityLogs(queryClient, organizationId, id);
      toast.success("Trailer deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete trailer"));
    },
  });
}

export function useTrashTrailer() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (id: IdOf<TrailerV2>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return EquipmentService.putToTrash(
        organizationId,
        EquipmentType.TRAILERS,
        id
      );
    },
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({
        queryKey: ["equipmentV2", "trailers"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["equipmentV2", "trailer"],
      });
      void queryClient.invalidateQueries({ queryKey: ["equipmentV2", "all"] });
      void queryClient.invalidateQueries({ queryKey: ["equipment"] });
      invalidatePostTrashSideEffects(queryClient);
      invalidateEquipmentActivityLogs(queryClient, organizationId, id);
      toast.success("Trailer trashed successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to trash trailer"));
    },
  });
}
