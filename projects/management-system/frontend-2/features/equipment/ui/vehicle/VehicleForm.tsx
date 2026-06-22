import { FC, useMemo } from "react";

import type { VehiclePageData, VehicleSubmitData } from "@/features/equipment";
import { GenericForm } from "@/features/forms/ui";

import {
  type VehicleFormData,
  buildVehicleFormSchema,
  defaultVehicleFormData,
} from "./vehicleFormSchema";

const filterList = [
  { name: "fuel_filter" },
  { name: "air_filter" },
  { name: "oil_filter" },
  { name: "hydraulic_filter" },
];

interface VehicleFormProps {
  onSubmit: (data: VehicleSubmitData) => void;
  onCancel?: () => void;
  initialData?: VehiclePageData | null;
  isEditMode?: boolean;
}

const VehicleForm: FC<VehicleFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditMode = false,
}) => {
  const formSchema = useMemo(
    () => buildVehicleFormSchema(!!isEditMode || !!initialData),
    [isEditMode, initialData]
  );

  const initialValues = useMemo(() => {
    if (!initialData) {
      return { vehicleForm: defaultVehicleFormData };
    }
    const filterState = { ...defaultVehicleFormData.filterState };
    const data: VehicleFormData = {
      make: initialData.make || "",
      year: initialData.year?.toString() || "",
      model: initialData.model || "",
      color: initialData.color || "",
      assigned_team_member: String(initialData.assigned_team_member ?? ""),
      current_miles: initialData.current_miles?.toString() || "",
      tracker_status: "Y",
      license_plate: initialData.license_plate || "",
      serial_number: initialData.serial_number || "",
      equipment_image: null,
      registration_image: null,
      insurance_image: null,
      serial_number_image: null,
      filterState,
    };
    if (!initialData.make && initialData.machine_name) {
      const parts = initialData.machine_name.split("-");
      if (parts.length >= 4) {
        data.make = parts[0] || "";
        data.year = parts[1] || "";
        data.model = parts[2] || "";
        data.color = parts[3] || "";
      }
    }
    return { vehicleForm: data };
  }, [initialData]);

  const handleSubmit = (values: Record<string, unknown>) => {
    const formData = values.vehicleForm as VehicleFormData;
    const maintenance_attributes = filterList
      .map((f) => {
        const item = formData.filterState[f.name];
        const lc = item.last_changed;
        const thr = item.threshold;
        const fn = item.filter_number;
        return {
          title: f.name,
          last_changed: lc === "" ? undefined : lc,
          threshold: thr === "" ? undefined : thr,
          filter_number: fn === "" ? undefined : fn,
          automatic: true,
        };
      })
      .filter(
        (attr) =>
          attr.last_changed !== undefined || attr.threshold !== undefined
      );
    onSubmit({
      make: formData.make.trim(),
      year: formData.year ? parseInt(formData.year, 10) : undefined,
      model: formData.model?.trim() || undefined,
      color: formData.color?.trim() || undefined,
      assigned_team_member: formData.assigned_team_member.trim(),
      current_miles: formData.current_miles
        ? parseFloat(formData.current_miles)
        : undefined,
      tracker_status: formData.tracker_status,
      license_plate: formData.license_plate?.trim() || undefined,
      serial_number: formData.serial_number?.trim() || undefined,
      equipment_image: formData.equipment_image,
      registration_image: formData.registration_image,
      insurance_image: formData.insurance_image,
      serial_number_image: formData.serial_number_image,
      maintenance_attributes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 backdrop-blur-sm">
      <div className="bg-bg-surface-elevated text-text-primary mx-auto my-8 max-h-[calc(100vh-4rem)] w-[900px] overflow-y-auto rounded-2xl p-0">
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-left text-3xl font-bold">
            {isEditMode || initialData
              ? `Edit ${initialData?.machine_name || "Vehicle"}`
              : "Add New Vehicle"}
          </h2>
        </div>
        <div className="px-8 pb-8">
          <GenericForm
            disableSubmitWhen={(values) => {
              const v = values.vehicleForm as VehicleFormData | undefined;
              if (!v) return true;
              const make = String(v.make ?? "").trim();
              const currentMiles = String(v.current_miles ?? "").trim();
              const assignedTeamMember = String(
                v.assigned_team_member ?? ""
              ).trim();
              if (!make || !currentMiles || !assignedTeamMember) return true;
              const filterState = v.filterState ?? {};
              const hasFilterError = filterList.some((f) => {
                const state = filterState[f.name];
                if (!state) return false;
                const hasLast =
                  state.last_changed !== "" && state.last_changed !== undefined;
                const hasThresh =
                  state.threshold !== "" && state.threshold !== undefined;
                return hasLast !== hasThresh;
              });
              return hasFilterError;
            }}
            initialValues={initialValues}
            schema={formSchema}
            showModal={false}
            onCancel={onCancel}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;
