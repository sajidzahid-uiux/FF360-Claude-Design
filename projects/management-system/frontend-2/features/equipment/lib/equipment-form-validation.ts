import { z } from "zod";

import { FILE_SIZE_LIMITS } from "@/constants";
import { ALL_AVAILABLE_FILTERS } from "@/features/equipment/model/maintenance-filters";

/** Backend: Equipment.make max_length=100 */
export const EQUIPMENT_FIELD_LIMITS = {
  make: 100,
  model: 100,
  color: 50,
  serial_number: 50,
  license_plate: 40,
  vehicle_serial_number: 40,
} as const;

export const nullableImageField = z
  .union([z.instanceof(File), z.string()])
  .nullable();

export const equipmentYearField = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine(
    (val) => {
      if (!val || !val.trim()) return true;
      const num = parseInt(val, 10);
      if (Number.isNaN(num)) return false;
      if (num < 1900) return false;
      if (num > new Date().getFullYear() + 1) return false;
      return true;
    },
    { message: "Year must be between 1900 and current year + 1" }
  );

export const filterStateSchema = z.object({
  last_changed: z.union([z.number(), z.literal("")]),
  threshold: z.union([z.number(), z.literal("")]),
  filter_number: z.union([z.string(), z.literal("")]),
  automatic: z.boolean(),
});

export const filterStatePairRefine = {
  message:
    "For each filter, Last changed and Threshold must both be filled or both be left empty.",
  path: ["filterState"] as const,
  check: (filterState: Record<string, z.infer<typeof filterStateSchema>>) =>
    Object.values(filterState).every((f) => {
      const hasLastChanged =
        f.last_changed !== "" && f.last_changed !== undefined;
      const hasThreshold = f.threshold !== "" && f.threshold !== undefined;
      return hasLastChanged === hasThreshold;
    }),
};

export const serialNumberImageField = z
  .instanceof(File)
  .nullable()
  .refine(
    (file) => !file || file.size <= FILE_SIZE_LIMITS.IMAGE_MAX_SIZE_BYTES,
    "Image must be less than 5 MB"
  )
  .refine(
    (file) =>
      !file || ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
    "Only JPG, JPEG, and PNG formats are supported"
  );

export interface FilterStateItem {
  last_changed: number | "";
  threshold: number | "";
  filter_number: string | "";
  automatic: boolean;
}

export interface MachineFormData {
  make: string;
  year: string;
  model: string;
  color: string;
  assigned_team_member: string;
  current_hours: string;
  hour_rate: string;
  tracker_status: string;
  serial_number: string;
  equipment_image: File | null;
  serial_number_image: File | null;
  filterState: Record<string, FilterStateItem>;
}

export interface TrailerFormData {
  make: string;
  year: string;
  model: string;
  color: string;
  assigned_team_member: string;
  tracker_status: string;
  license_plate: string;
  serial_number: string;
  equipment_image: File | null;
  insurance_image: File | null;
  registration_image: File | null;
  serial_number_image: File | null;
}

export interface VehicleFormData {
  make: string;
  year: string;
  model: string;
  color: string;
  assigned_team_member: string;
  current_miles: string;
  tracker_status: string;
  license_plate: string;
  serial_number: string;
  equipment_image: File | null;
  registration_image: File | null;
  insurance_image: File | null;
  serial_number_image: File | null;
  filterState: Record<string, FilterStateItem>;
}

const defaultFilterState: Record<string, FilterStateItem> = Object.fromEntries(
  ALL_AVAILABLE_FILTERS.map((f) => [
    f.name,
    {
      last_changed: "",
      threshold: "",
      filter_number: "",
      automatic: true,
    },
  ])
);

export const defaultMachineFormData: MachineFormData = {
  make: "",
  year: "",
  model: "",
  color: "",
  assigned_team_member: "",
  current_hours: "",
  hour_rate: "",
  tracker_status: "Y",
  serial_number: "",
  equipment_image: null,
  serial_number_image: null,
  filterState: defaultFilterState,
};

export const defaultTrailerFormData: TrailerFormData = {
  make: "",
  year: "",
  model: "",
  color: "",
  assigned_team_member: "",
  tracker_status: "Y",
  license_plate: "",
  serial_number: "",
  equipment_image: null,
  insurance_image: null,
  registration_image: null,
  serial_number_image: null,
};

export const defaultVehicleFormData: VehicleFormData = {
  make: "",
  year: "",
  model: "",
  color: "",
  assigned_team_member: "",
  current_miles: "",
  tracker_status: "Y",
  license_plate: "",
  serial_number: "",
  equipment_image: null,
  registration_image: null,
  insurance_image: null,
  serial_number_image: null,
  filterState: defaultFilterState,
};

export const machineFormValidation = z
  .object({
    make: z
      .string()
      .min(1, "Make is required")
      .max(EQUIPMENT_FIELD_LIMITS.make),
    year: equipmentYearField,
    model: z
      .string()
      .max(EQUIPMENT_FIELD_LIMITS.model)
      .optional()
      .or(z.literal("")),
    color: z
      .string()
      .max(EQUIPMENT_FIELD_LIMITS.color)
      .optional()
      .or(z.literal("")),
    assigned_team_member: z.string().min(1, "User Assigned is required"),
    current_hours: z.string().min(1, "Current hours is required"),
    hour_rate: z.string().min(1, "Hourly rate is required"),
    tracker_status: z.enum(["Y", "N"]),
    serial_number: z
      .string()
      .max(EQUIPMENT_FIELD_LIMITS.serial_number)
      .optional()
      .or(z.literal("")),
    equipment_image: nullableImageField,
    serial_number_image: serialNumberImageField,
    filterState: z.record(z.string(), filterStateSchema),
  })
  .refine((data) => filterStatePairRefine.check(data.filterState), {
    message: filterStatePairRefine.message,
    path: [...filterStatePairRefine.path],
  });

export const trailerFormValidation = z.object({
  make: z.string().min(1, "Make is required").max(EQUIPMENT_FIELD_LIMITS.make),
  year: equipmentYearField,
  model: z
    .string()
    .max(EQUIPMENT_FIELD_LIMITS.model)
    .optional()
    .or(z.literal("")),
  color: z
    .string()
    .max(EQUIPMENT_FIELD_LIMITS.color)
    .optional()
    .or(z.literal("")),
  assigned_team_member: z.string().min(1, "User Assigned is required"),
  tracker_status: z.enum(["Y", "N"]),
  license_plate: z
    .string()
    .max(EQUIPMENT_FIELD_LIMITS.license_plate)
    .optional()
    .or(z.literal("")),
  serial_number: z
    .string()
    .max(EQUIPMENT_FIELD_LIMITS.serial_number)
    .optional()
    .or(z.literal("")),
  equipment_image: nullableImageField,
  insurance_image: nullableImageField,
  registration_image: nullableImageField,
  serial_number_image: nullableImageField,
});

export const vehicleFormValidation = z
  .object({
    make: z
      .string()
      .min(1, "Make is required")
      .max(EQUIPMENT_FIELD_LIMITS.make),
    year: equipmentYearField,
    model: z
      .string()
      .max(EQUIPMENT_FIELD_LIMITS.model)
      .optional()
      .or(z.literal("")),
    color: z
      .string()
      .max(EQUIPMENT_FIELD_LIMITS.color)
      .optional()
      .or(z.literal("")),
    assigned_team_member: z.string().min(1, "User Assigned is required"),
    current_miles: z.string().min(1, "Current miles is required"),
    tracker_status: z.enum(["Y", "N"]),
    license_plate: z
      .string()
      .max(EQUIPMENT_FIELD_LIMITS.license_plate)
      .optional()
      .or(z.literal("")),
    serial_number: z
      .string()
      .max(EQUIPMENT_FIELD_LIMITS.vehicle_serial_number)
      .optional()
      .or(z.literal("")),
    equipment_image: nullableImageField,
    registration_image: nullableImageField,
    insurance_image: nullableImageField,
    serial_number_image: serialNumberImageField,
    filterState: z.record(z.string(), filterStateSchema),
  })
  .refine((data) => filterStatePairRefine.check(data.filterState), {
    message: filterStatePairRefine.message,
    path: [...filterStatePairRefine.path],
  });

export function isMachineFormSubmittable(data: MachineFormData): boolean {
  return machineFormValidation.safeParse(data).success;
}

export function isTrailerFormSubmittable(data: TrailerFormData): boolean {
  return trailerFormValidation.safeParse(data).success;
}

export function isVehicleFormSubmittable(data: VehicleFormData): boolean {
  return vehicleFormValidation.safeParse(data).success;
}
