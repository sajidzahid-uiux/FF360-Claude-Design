import { FC, useMemo } from "react";

import type { MaintenanceAttribute } from "@/api/types";
import type { MachinePageData, MachineSubmitData } from "@/features/equipment";
import { ALL_AVAILABLE_FILTERS } from "@/features/equipment/model/maintenance-filters";
import { GenericForm } from "@/features/forms/ui";

import {
  type MachineFormData,
  buildMachineFormSchema,
  defaultMachineFormData,
} from "./machineFormSchema";

interface EquipmentFormProps {
  onSubmit: (data: MachineSubmitData) => void;
  onCancel?: () => void;
  initialData?: MachinePageData | null;
  isEditMode?: boolean;
}

const MachineForm: FC<EquipmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditMode = false,
}) => {
  const formSchema = useMemo(
    () => buildMachineFormSchema(!!isEditMode || !!initialData),
    [isEditMode, initialData]
  );

  const initialValues = useMemo(() => {
    if (!initialData) {
      return { machineForm: defaultMachineFormData };
    }
    const filterState = { ...defaultMachineFormData.filterState };
    if (
      initialData.maintenance_attributes &&
      Array.isArray(initialData.maintenance_attributes)
    ) {
      (initialData.maintenance_attributes as MaintenanceAttribute[]).forEach(
        (attr) => {
          if (filterState[attr.title]) {
            filterState[attr.title] = {
              last_changed:
                attr.last_changed === undefined ? "" : attr.last_changed,
              threshold: attr.threshold === undefined ? "" : attr.threshold,
              filter_number:
                attr.filter_number === undefined || attr.filter_number === null
                  ? ""
                  : attr.filter_number,
              automatic: true,
            };
          }
        }
      );
    }
    const data: MachineFormData = {
      make: initialData.make || "",
      year: initialData.year?.toString() || "",
      model: initialData.model || "",
      color: initialData.color || "",
      assigned_team_member: String(initialData.assigned_team_member ?? ""),
      current_hours: initialData.current_hours?.toString() || "",
      hour_rate: initialData.hour_rate?.toString() || "",
      tracker_status: initialData.tracker_status || "Y",
      serial_number: initialData.serial_number || "",
      equipment_image: null,
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
    return { machineForm: data };
  }, [initialData]);

  const handleSubmit = (values: Record<string, unknown>) => {
    const formData = values.machineForm as MachineFormData;
    const maintenance_attributes = ALL_AVAILABLE_FILTERS.map((f) => {
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
    }).filter(
      (attr) => attr.last_changed !== undefined || attr.threshold !== undefined
    );
    onSubmit({
      make: formData.make.trim(),
      year: formData.year ? parseInt(formData.year, 10) : undefined,
      model: formData.model?.trim() || undefined,
      color: formData.color?.trim() || undefined,
      assigned_team_member: formData.assigned_team_member.trim(),
      current_hours: formData.current_hours
        ? parseFloat(formData.current_hours)
        : undefined,
      tracker_status: formData.tracker_status,
      hour_rate: formData.hour_rate
        ? parseFloat(formData.hour_rate)
        : undefined,
      serial_number: formData.serial_number?.trim() || undefined,
      equipment_image: formData.equipment_image,
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
              ? `Edit ${initialData?.machine_name || "Equipment"}`
              : "Add New Machine"}
          </h2>
        </div>
        <div className="px-8 pb-8">
          <GenericForm
            disableSubmitWhen={(values) => {
              const m = values.machineForm as MachineFormData | undefined;
              if (!m) return true;
              const make = String(m.make ?? "").trim();
              const currentHours = String(m.current_hours ?? "").trim();
              const hourRate = String(m.hour_rate ?? "").trim();
              const assignedTeamMember = String(
                m.assigned_team_member ?? ""
              ).trim();
              if (!make || !currentHours || !hourRate || !assignedTeamMember)
                return true;
              const filterState = m.filterState ?? {};
              const hasFilterError = ALL_AVAILABLE_FILTERS.some((f) => {
                const v = filterState[f.name];
                if (!v) return false;
                const hasLast =
                  v.last_changed !== "" && v.last_changed !== undefined;
                const hasThresh =
                  v.threshold !== "" && v.threshold !== undefined;
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

export default MachineForm;
