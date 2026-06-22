import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { EquipmentBatteryService } from "@/api/services";
import type {
  BatteryTypeCreatePayload,
  BatteryTypeDeletePayload,
  BatteryTypeUpdatePayload,
  MachineBatteryReplacementCreateArgs,
  MachineBatteryReplacementDeleteArgs,
  MachineBatteryReplacementUpdateArgs,
  VehicleBatteryReplacementCreateArgs,
  VehicleBatteryReplacementDeleteArgs,
  VehicleBatteryReplacementUpdateArgs,
} from "@/api/types/equipmentBattery";
import { EquipmentType } from "@/constants/enums";
import { getErrorMessage } from "@/utils/apiError";

import { useRouteIds } from "../useRouteIds";

export function useCreateBatteryType() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (payload: BatteryTypeCreatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return EquipmentBatteryService.createBatteryType(
        organizationId,
        payload.name
      );
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["battery-types"] });
      toast.success(data.message || "Battery type created successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create battery type"));
    },
  });
}

export function useUpdateBatteryType() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (payload: BatteryTypeUpdatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return EquipmentBatteryService.updateBatteryType(
        organizationId,
        payload.typeId,
        payload.name
      );
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["battery-types"] });
      void queryClient.invalidateQueries({ queryKey: ["battery-type"] });
      toast.success(data.message || "Battery type updated successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update battery type"));
    },
  });
}

export function useDeleteBatteryType() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (payload: BatteryTypeDeletePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return EquipmentBatteryService.deleteBatteryType(
        organizationId,
        payload.typeId
      );
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["battery-types"] });
      toast.success(data.message || "Battery type deleted successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete battery type"));
    },
  });
}

export function useCreateMachineBatteryReplacement() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      machineId,
      data,
      files,
    }: MachineBatteryReplacementCreateArgs) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return EquipmentBatteryService.createEquipmentBatteryReplacement(
        organizationId,
        EquipmentType.MACHINES,
        machineId,
        data,
        files
      );
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["machine-battery", organizationId, variables.machineId],
      });
      toast.success(
        data.message || "Battery replacement created successfully."
      );
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to create battery replacement")
      );
    },
  });
}

export function useUpdateMachineBatteryReplacement() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      machineId,
      id,
      data,
      files,
    }: MachineBatteryReplacementUpdateArgs) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return EquipmentBatteryService.updateEquipmentBatteryReplacement(
        organizationId,
        EquipmentType.MACHINES,
        machineId,
        id,
        data,
        files
      );
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["machine-battery", organizationId, variables.machineId],
      });
      toast.success(
        data.message || "Battery replacement updated successfully."
      );
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to update battery replacement")
      );
    },
  });
}

export function useDeleteMachineBatteryReplacement() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      machineId,
      id,
    }: MachineBatteryReplacementDeleteArgs) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return EquipmentBatteryService.deleteEquipmentBatteryReplacement(
        organizationId,
        EquipmentType.MACHINES,
        machineId,
        id
      );
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["machine-battery", organizationId, variables.machineId],
      });
      toast.success(
        data.message || "Battery replacement deleted successfully."
      );
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to delete battery replacement")
      );
    },
  });
}

export function useCreateVehicleBatteryReplacement() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      data,
      files,
    }: VehicleBatteryReplacementCreateArgs) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return EquipmentBatteryService.createEquipmentBatteryReplacement(
        organizationId,
        EquipmentType.VEHICLES,
        vehicleId,
        data,
        files
      );
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["vehicle-battery", organizationId, variables.vehicleId],
      });
      toast.success(
        data.message || "Battery replacement created successfully."
      );
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to create battery replacement")
      );
    },
  });
}

export function useUpdateVehicleBatteryReplacement() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      id,
      data,
      files,
    }: VehicleBatteryReplacementUpdateArgs) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return EquipmentBatteryService.updateEquipmentBatteryReplacement(
        organizationId,
        EquipmentType.VEHICLES,
        vehicleId,
        id,
        data,
        files
      );
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["vehicle-battery", organizationId, variables.vehicleId],
      });
      toast.success(
        data.message || "Battery replacement updated successfully."
      );
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to update battery replacement")
      );
    },
  });
}

export function useDeleteVehicleBatteryReplacement() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      id,
    }: VehicleBatteryReplacementDeleteArgs) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return EquipmentBatteryService.deleteEquipmentBatteryReplacement(
        organizationId,
        EquipmentType.VEHICLES,
        vehicleId,
        id
      );
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["vehicle-battery", organizationId, variables.vehicleId],
      });
      toast.success(
        data.message || "Battery replacement deleted successfully."
      );
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to delete battery replacement")
      );
    },
  });
}
