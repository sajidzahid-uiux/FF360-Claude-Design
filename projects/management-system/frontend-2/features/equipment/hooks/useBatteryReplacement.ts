"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { toast } from "sonner";

import type {
  BatteryReplacementData,
  BatteryReplacementFiles,
  BatteryReplacementRecord,
  BatteryType,
  BatteryTypeApiResponse,
} from "@/api/types/equipmentBattery";
import { isPdfUrl } from "@/features/equipment/lib/equipment-detail-helpers";
import type {
  BatteryImageKind,
  BatteryReplacementProps,
} from "@/features/equipment/model/battery-replacement-ui";
import {
  useCreateBatteryType,
  useCreateMachineBatteryReplacement,
  useCreateVehicleBatteryReplacement,
  useUpdateMachineBatteryReplacement,
  useUpdateVehicleBatteryReplacement,
} from "@/hooks/mutations";
import {
  useBatteryTypes,
  useMachineBattery,
  useVehicleBattery,
} from "@/hooks/queries";
import { parseEntityId } from "@/shared/lib/parseEntityId";
import { getErrorMessage } from "@/utils/apiError";

export function useBatteryReplacement({
  equipmentId,
  disabled = false,
}: Pick<BatteryReplacementProps, "equipmentId" | "disabled">) {
  const resolvedEquipmentId = parseEntityId(equipmentId);
  const searchParams = useSearchParams();
  const equipmentType = (
    searchParams.get("equipment_type") || "machine"
  ).toLowerCase();

  const { data: typesResp, refetch: refetchTypes } = useBatteryTypes();
  const createBatteryType = useCreateBatteryType();
  const createMachineBatteryReplacement = useCreateMachineBatteryReplacement();
  const updateMachineBatteryReplacement = useUpdateMachineBatteryReplacement();
  const createVehicleBatteryReplacement = useCreateVehicleBatteryReplacement();
  const updateVehicleBatteryReplacement = useUpdateVehicleBatteryReplacement();
  const machineBatteryQuery = useMachineBattery(
    equipmentId,
    equipmentType !== "vehicle"
  );
  const vehicleBatteryQuery = useVehicleBattery(
    equipmentId,
    equipmentType === "vehicle"
  );

  const recordResp =
    equipmentType === "vehicle"
      ? vehicleBatteryQuery.data
      : machineBatteryQuery.data;
  const refetch =
    equipmentType === "vehicle"
      ? vehicleBatteryQuery.refetch
      : machineBatteryQuery.refetch;

  const existing: BatteryReplacementRecord | null = recordResp?.data ?? null;

  const [isEditing, setIsEditing] = useState(false);
  const [batteryTypeId, setBatteryTypeId] = useState<string>("");
  const [replacementDate, setReplacementDate] = useState<string>("");
  const [lifetime, setLifetime] = useState<string>("");
  const [warranty, setWarranty] = useState<string>("");
  const [batteryImage, setBatteryImage] = useState<File | null>(null);
  const [warrantyImage, setWarrantyImage] = useState<File | null>(null);
  const batteryInputRef = useRef<HTMLInputElement>(null);
  const warrantyInputRef = useRef<HTMLInputElement>(null);
  const [newTypeName, setNewTypeName] = useState<string>("");

  const batteryImagePreview = useMemo(() => {
    if (batteryImage && batteryImage.type.startsWith("image/")) {
      return URL.createObjectURL(batteryImage);
    }
    const url = existing?.battery_image_url || existing?.battery_image;
    if (url && !isPdfUrl(url)) return url as string;
    return null;
  }, [batteryImage, existing]);

  const warrantyImagePreview = useMemo(() => {
    if (warrantyImage && warrantyImage.type.startsWith("image/")) {
      return URL.createObjectURL(warrantyImage);
    }
    const url =
      existing?.battery_warranty_image_url || existing?.battery_warranty_image;
    if (url && !isPdfUrl(url)) return url as string;
    return null;
  }, [warrantyImage, existing]);

  useEffect(() => {
    return () => {
      if (batteryImagePreview && batteryImage instanceof File) {
        URL.revokeObjectURL(batteryImagePreview);
      }
      if (warrantyImagePreview && warrantyImage instanceof File) {
        URL.revokeObjectURL(warrantyImagePreview);
      }
    };
  }, [batteryImagePreview, warrantyImagePreview, batteryImage, warrantyImage]);

  const persistBatteryMutation = useCallback(
    async (data: BatteryReplacementData, files?: BatteryReplacementFiles) => {
      if (equipmentType === "vehicle") {
        if (existing?.id) {
          await updateVehicleBatteryReplacement.mutateAsync({
            vehicleId: resolvedEquipmentId,
            id: existing.id,
            data,
            files,
          });
          return;
        }
        await createVehicleBatteryReplacement.mutateAsync({
          vehicleId: resolvedEquipmentId,
          data,
          files,
        });
        return;
      }

      if (existing?.id) {
        await updateMachineBatteryReplacement.mutateAsync({
          machineId: resolvedEquipmentId,
          id: existing.id,
          data,
          files,
        });
        return;
      }
      await createMachineBatteryReplacement.mutateAsync({
        machineId: resolvedEquipmentId,
        data,
        files,
      });
    },
    [
      createMachineBatteryReplacement,
      createVehicleBatteryReplacement,
      equipmentType,
      existing?.id,
      resolvedEquipmentId,
      updateMachineBatteryReplacement,
      updateVehicleBatteryReplacement,
    ]
  );

  const quickUpload = useCallback(
    async (file: File, kind: BatteryImageKind) => {
      if (disabled) return;
      try {
        const files =
          kind === "battery"
            ? { battery_image: file }
            : { battery_warranty_image: file };
        await persistBatteryMutation({}, files);
        await refetch();
        toast.success("Image updated");
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to upload image"));
      }
    },
    [disabled, persistBatteryMutation, refetch]
  );

  useEffect(() => {
    if (existing) {
      setBatteryTypeId(
        existing.battery_type ? String(existing.battery_type) : ""
      );
      setReplacementDate(existing.replacement_date || "");
      const lt = existing.battery_lifetime_years;
      setLifetime(lt == null ? "" : String(lt));
      setWarranty(existing.warranty_details || "");
    }
  }, [existing]);

  useEffect(() => {
    if (disabled && isEditing) {
      setIsEditing(false);
    }
  }, [disabled, isEditing]);

  const typeOptions = useMemo((): BatteryType[] => {
    return typesResp?.data ?? [];
  }, [typesResp]);

  const isSaving =
    createMachineBatteryReplacement.isPending ||
    updateMachineBatteryReplacement.isPending ||
    createVehicleBatteryReplacement.isPending ||
    updateVehicleBatteryReplacement.isPending;

  const addBatteryType = useCallback(async () => {
    const name = newTypeName.trim();
    if (!name) return;
    try {
      const res: BatteryTypeApiResponse = await createBatteryType.mutateAsync({
        name,
      });
      await refetchTypes();
      setNewTypeName("");
      if (res.data?.id) setBatteryTypeId(String(res.data.id));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to add type"));
    }
  }, [createBatteryType, newTypeName, refetchTypes]);

  const handleSave = useCallback(async () => {
    try {
      const payload: BatteryReplacementData = {
        battery_type: batteryTypeId ? Number(batteryTypeId) : undefined,
        replacement_date: replacementDate || undefined,
        battery_lifetime_years: lifetime
          ? (Number(
              lifetime
            ) as BatteryReplacementData["battery_lifetime_years"])
          : undefined,
        warranty_details: warranty || undefined,
      };
      const files: BatteryReplacementFiles = {
        battery_image: batteryImage || undefined,
        battery_warranty_image: warrantyImage || undefined,
      };
      await persistBatteryMutation(payload, files);
      setIsEditing(false);
      setBatteryImage(null);
      setWarrantyImage(null);
      await refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save battery replacement"));
    }
  }, [
    batteryImage,
    batteryTypeId,
    lifetime,
    persistBatteryMutation,
    refetch,
    replacementDate,
    warranty,
    warrantyImage,
  ]);

  return {
    existing,
    isEditing,
    setIsEditing,
    batteryTypeId,
    setBatteryTypeId,
    replacementDate,
    setReplacementDate,
    lifetime,
    setLifetime,
    warranty,
    setWarranty,
    batteryImagePreview,
    warrantyImagePreview,
    batteryInputRef,
    warrantyInputRef,
    newTypeName,
    setNewTypeName,
    typeOptions,
    isSaving,
    disabled,
    createBatteryTypePending: createBatteryType.isPending,
    addBatteryType,
    handleSave,
    quickUpload,
    setBatteryImage,
    setWarrantyImage,
    nextReplacementDate: existing?.next_replacement_date || "",
  };
}
