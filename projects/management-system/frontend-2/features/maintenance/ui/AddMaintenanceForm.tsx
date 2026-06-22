"use client";

import type { RecordEquipment } from "@/api/types";
import { EquipmentType } from "@/constants";
import { useAddMaintenanceAction } from "@/features/maintenance/hooks/useAddMaintenanceAction";
import { useRecordEquipment } from "@/hooks/useRecordData";
import { SanitizedInput } from "@/shared/ui/primitives";

interface Option {
  value: string;
  label: string;
}

export interface AddMaintenanceFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  assignedToOptions: Option[];
  equipmentIdParam: string | null;
  equipmentType?: string | null;
}

export function AddMaintenanceForm({
  onBack,
  onSuccess,
  assignedToOptions,
  equipmentIdParam,
  equipmentType,
}: AddMaintenanceFormProps) {
  const {
    formAction,
    isPending,
    selectedEquipment,
    handleEquipmentChange,
    equipmentType: resolvedEquipmentType,
    activeMaintenanceIsLoading,
    activeMaintenanceError,
    isNewMaintenance,
  } = useAddMaintenanceAction({
    equipmentIdParam,
    equipmentType,
    onBack,
    onSuccess,
  });

  const { data: recordEquipmentData } = useRecordEquipment({
    equipmentType: resolvedEquipmentType as EquipmentType,
  });

  if (activeMaintenanceIsLoading) {
    return <div>Loading...</div>;
  }

  if (activeMaintenanceError) {
    return <div>Error loading maintenance data</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 backdrop-blur-sm">
      <form
        action={formAction}
        className="bg-bg-surface-elevated text-text-primary mx-auto my-8 max-h-[calc(100vh-4rem)] w-[900px] overflow-y-auto rounded-2xl p-0"
      >
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-left text-3xl font-bold">Add Maintenance</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 px-8">
          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              Equipment Name
            </label>
            <select
              required
              className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
              defaultValue={selectedEquipment}
              disabled={isPending}
              name="equipment"
              onChange={(e) => handleEquipmentChange(e.target.value)}
            >
              <option value="">Select equipment...</option>
              {Array.isArray(recordEquipmentData) &&
                recordEquipmentData?.map((option: RecordEquipment) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
            </select>
          </div>

          {isNewMaintenance && (
            <>
              <div className="flex flex-col">
                <label className="mb-2 block text-base font-semibold">
                  Description
                </label>
                <SanitizedInput
                  required
                  className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
                  disabled={isPending}
                  name="description"
                  type="text"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-2 block text-base font-semibold">
                  Assigned To
                </label>
                <select
                  required
                  className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
                  disabled={isPending}
                  name="assignedto"
                >
                  <option value="">Select assignee...</option>
                  {assignedToOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex flex-col">
            <label className="mb-2 block text-base font-semibold">
              Issue Title
            </label>
            <SanitizedInput
              required
              className="border-border-subtle focus:ring-accent bg-bg-app text-text-primary w-full rounded-lg border p-3 text-base focus:ring-2 focus:outline-none"
              disabled={isPending}
              name="title"
              type="text"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between px-8 pb-8">
          <button
            className="border-border-subtle bg-bg-app text-text-primary hover:bg-bg-hover cursor-pointer rounded-lg border-2 px-6 py-3"
            disabled={isPending}
            type="button"
            onClick={onBack}
          >
            Cancel
          </button>
          <button
            className="hover:bg-bg-hover cursor-pointer rounded-lg bg-black px-8 py-3 text-base text-white hover:text-black"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
