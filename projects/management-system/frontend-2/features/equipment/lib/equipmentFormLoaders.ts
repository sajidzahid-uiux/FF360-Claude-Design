import type { ComponentType } from "react";

import type {
  MachinePageData,
  MachineSubmitData,
  TrailerPageData,
  TrailerSubmitData,
  VehiclePageData,
  VehicleSubmitData,
} from "@/features/equipment";

type MachineFormProps = {
  onSubmit: (data: MachineSubmitData) => void;
  onCancel?: () => void;
  initialData?: MachinePageData | null;
  isEditMode?: boolean;
};

type VehicleFormProps = {
  onSubmit: (data: VehicleSubmitData) => void;
  onCancel?: () => void;
  initialData?: VehiclePageData | null;
};

type TrailerFormProps = {
  onSubmit: (data: TrailerSubmitData) => void;
  onCancel?: () => void;
  initialData?: TrailerPageData | null;
  isEditMode?: boolean;
};

export async function loadMachineForm(): Promise<
  ComponentType<MachineFormProps>
> {
  const formModule = await import("../ui/machine/MachineForm");
  return formModule.default as ComponentType<MachineFormProps>;
}

export async function loadVehicleForm(): Promise<
  ComponentType<VehicleFormProps>
> {
  const formModule = await import("../ui/vehicle/VehicleForm");
  return formModule.default as ComponentType<VehicleFormProps>;
}

export async function loadTrailerForm(): Promise<
  ComponentType<TrailerFormProps>
> {
  const formModule = await import("../ui/trailer/TrailerForm");
  return formModule.default as ComponentType<TrailerFormProps>;
}
