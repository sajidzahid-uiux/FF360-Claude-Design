"use client";

import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  EquipmentTypeEnum,
  type MachineCreatePayload,
  type MachineUpdatePayload,
  type TrailerCreatePayload,
  type TrailerUpdatePayload,
  type VehicleCreatePayload,
  type VehicleUpdatePayload,
} from "@/api/types";
import {
  AddEquipmentModal,
  type AddEquipmentSubmitPayload,
  type MachineSubmitData,
  type TrailerSubmitData,
  type VehicleSubmitData,
} from "@/features/equipment";
import {
  useCreateMachine,
  useCreateTrailer,
  useCreateVehicle,
  useUpdateMachine,
  useUpdateTrailer,
  useUpdateVehicle,
} from "@/hooks/mutations";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { getErrorMessage } from "@/utils/apiError";

const MODAL_KEY = "add-equipment";

type EquipmentImageField =
  | "equipment_image"
  | "insurance_image"
  | "registration_image"
  | "serial_number_image";

function appendImageFields(
  formData: FormData,
  values: Partial<Record<EquipmentImageField, File | null | undefined>>,
  fields: EquipmentImageField[]
): boolean {
  let hasImages = false;
  for (const field of fields) {
    const value = values[field];
    if (value instanceof File) {
      formData.append(field, value);
      hasImages = true;
    }
  }
  return hasImages;
}

/**
 * Self-contained "Add Equipment" modal driven by the URL stack
 * (`?modal=add-equipment;type=machine`). Rendered globally so the global "+"
 * button can open it over ANY module without navigating to the equipment page.
 * The frame param `type` selects machine | vehicle | trailer.
 */
export function AddEquipmentModalConnected() {
  const { stack, closeModalKey } = useModalStack();
  const queryClient = useQueryClient();
  const frame = stack.find((f) => f.key === MODAL_KEY);
  const equipmentType = frame?.params.type as EquipmentTypeEnum | undefined;

  const createMachine = useCreateMachine();
  const updateMachine = useUpdateMachine();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const createTrailer = useCreateTrailer();
  const updateTrailer = useUpdateTrailer();

  const invalidateEquipment = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["equipmentV2", "all"] });
  }, [queryClient]);

  const isSubmitting =
    createMachine.isPending ||
    createVehicle.isPending ||
    createTrailer.isPending;

  const addMachine = useCallback(
    async (formData: MachineSubmitData): Promise<boolean> => {
      try {
        const { equipment_image, serial_number_image, ...restData } = formData;
        const created = await createMachine.mutateAsync(
          restData as MachineCreatePayload
        );
        const equipmentId = created.id || created.equipment_ptr_id;
        const imageFormData = new FormData();
        if (
          appendImageFields(
            imageFormData,
            { equipment_image, serial_number_image },
            ["equipment_image", "serial_number_image"]
          )
        ) {
          await updateMachine.mutateAsync({
            id: equipmentId,
            data: imageFormData as unknown as MachineUpdatePayload,
          });
        }
        invalidateEquipment();
        return true;
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to add machine."));
        return false;
      }
    },
    [createMachine, invalidateEquipment, updateMachine]
  );

  const addTrailer = useCallback(
    async (formData: TrailerSubmitData): Promise<boolean> => {
      try {
        const {
          equipment_image,
          insurance_image,
          registration_image,
          serial_number_image,
          ...restData
        } = formData;
        const created = await createTrailer.mutateAsync(
          restData as TrailerCreatePayload
        );
        const equipmentId = created.id || created.equipment_ptr_id;
        const imageFormData = new FormData();
        if (
          appendImageFields(
            imageFormData,
            {
              equipment_image,
              insurance_image,
              registration_image,
              serial_number_image,
            },
            [
              "equipment_image",
              "insurance_image",
              "registration_image",
              "serial_number_image",
            ]
          )
        ) {
          await updateTrailer.mutateAsync({
            id: equipmentId,
            data: imageFormData as unknown as TrailerUpdatePayload,
          });
        }
        invalidateEquipment();
        return true;
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to add trailer."));
        return false;
      }
    },
    [createTrailer, invalidateEquipment, updateTrailer]
  );

  const addVehicle = useCallback(
    async (formData: VehicleSubmitData): Promise<boolean> => {
      try {
        const {
          equipment_image,
          insurance_image,
          registration_image,
          serial_number_image,
          ...restData
        } = formData;
        const created = await createVehicle.mutateAsync(
          restData as VehicleCreatePayload
        );
        const equipmentId = created.id || created.equipment_ptr_id;
        const imageFormData = new FormData();
        if (
          appendImageFields(
            imageFormData,
            {
              equipment_image,
              insurance_image,
              registration_image,
              serial_number_image,
            },
            [
              "equipment_image",
              "insurance_image",
              "registration_image",
              "serial_number_image",
            ]
          )
        ) {
          await updateVehicle.mutateAsync({
            id: equipmentId,
            data: imageFormData as unknown as VehicleUpdatePayload,
          });
        }
        invalidateEquipment();
        return true;
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to create vehicle"));
        return false;
      }
    },
    [createVehicle, invalidateEquipment, updateVehicle]
  );

  const handleSubmit = useCallback(
    async (payload: AddEquipmentSubmitPayload) => {
      let succeeded = false;
      if (payload.type === EquipmentTypeEnum.MACHINE) {
        succeeded = await addMachine(payload.data);
      } else if (payload.type === EquipmentTypeEnum.VEHICLE) {
        succeeded = await addVehicle(payload.data);
      } else {
        succeeded = await addTrailer(payload.data);
      }
      if (succeeded) {
        closeModalKey(MODAL_KEY);
      }
    },
    [addMachine, addTrailer, addVehicle, closeModalKey]
  );

  if (!equipmentType) return null;

  return (
    <AddEquipmentModal
      equipmentType={equipmentType}
      isSubmitting={isSubmitting}
      open
      onOpenChange={(next) => {
        if (!next) closeModalKey(MODAL_KEY);
      }}
      onSubmit={handleSubmit}
    />
  );
}
