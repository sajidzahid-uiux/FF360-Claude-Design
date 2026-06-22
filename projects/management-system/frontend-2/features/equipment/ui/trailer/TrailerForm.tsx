import { FC, useMemo } from "react";

import type { TrailerPageData, TrailerSubmitData } from "@/features/equipment";
import { GenericForm } from "@/features/forms/ui";

import {
  type TrailerFormData,
  buildTrailerFormSchema,
  defaultTrailerFormData,
} from "./trailerFormSchema";

interface TrailerFormProps {
  onSubmit: (data: TrailerSubmitData) => void;
  onCancel?: () => void;
  initialData?: TrailerPageData | null;
  isEditMode?: boolean;
}

const TrailerForm: FC<TrailerFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditMode = false,
}) => {
  const formSchema = useMemo(
    () => buildTrailerFormSchema(!!isEditMode || !!initialData),
    [isEditMode, initialData]
  );

  const initialValues = useMemo(() => {
    if (!initialData) {
      return { trailerForm: defaultTrailerFormData };
    }
    const data: TrailerFormData = {
      make: initialData.make || "",
      year: initialData.year?.toString() || "",
      model: initialData.model || "",
      color: initialData.color || "",
      assigned_team_member: String(initialData.assigned_team_member ?? ""),
      tracker_status: initialData.tracker_status || "Y",
      license_plate: initialData.license_plate || "",
      serial_number: initialData.serial_number || "",
      equipment_image: null,
      insurance_image: null,
      registration_image: null,
      serial_number_image: null,
    };
    return { trailerForm: data };
  }, [initialData]);

  const handleSubmit = (values: Record<string, unknown>) => {
    const formData = values.trailerForm as TrailerFormData;
    onSubmit({
      make: formData.make.trim(),
      year: formData.year ? parseInt(formData.year, 10) : undefined,
      model: formData.model?.trim() || undefined,
      color: formData.color?.trim() || undefined,
      assigned_team_member: formData.assigned_team_member.trim(),
      tracker_status: formData.tracker_status,
      license_plate: formData.license_plate?.trim() || undefined,
      serial_number: formData.serial_number?.trim() || undefined,
      equipment_image: formData.equipment_image,
      insurance_image: formData.insurance_image,
      registration_image: formData.registration_image,
      serial_number_image: formData.serial_number_image,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 backdrop-blur-sm">
      <div className="bg-bg-surface-elevated text-text-primary mx-auto my-8 max-h-[calc(100vh-4rem)] w-[900px] overflow-y-auto rounded-2xl p-0">
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-left text-3xl font-bold">
            {isEditMode || initialData
              ? `Edit ${initialData?.machine_name || "Trailer"}`
              : "Add New Trailer"}
          </h2>
        </div>
        <div className="px-8 pb-8">
          <GenericForm
            disableSubmitWhen={(values) => {
              const t = values.trailerForm as TrailerFormData | undefined;
              if (!t) return true;
              const make = String(t.make ?? "").trim();
              const assignedTeamMember = String(
                t.assigned_team_member ?? ""
              ).trim();
              return !make || !assignedTeamMember;
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

export default TrailerForm;
