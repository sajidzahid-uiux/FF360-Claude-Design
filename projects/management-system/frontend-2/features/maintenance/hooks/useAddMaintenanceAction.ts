"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useCallback, useState } from "react";

import {
  useIsActiveMaintenance,
  useMaintenanceData,
  useMaintenanceItems,
  useRouteIds,
} from "@/hooks";
import { orgPath } from "@/shared/config/routes";
import { sanitizeText } from "@/utils/validation";

type AddMaintenanceState = {
  success: boolean;
  message: string;
} | null;

export function useAddMaintenanceAction({
  equipmentIdParam,
  equipmentType: equipmentTypeProp,
  onBack,
  onSuccess,
}: {
  equipmentIdParam: string | null;
  equipmentType?: string | null;
  onBack: () => void;
  onSuccess?: () => void;
}) {
  const [selectedEquipment, setSelectedEquipment] = useState(
    equipmentIdParam || ""
  );

  const { createMaintenanceItem } = useMaintenanceItems();
  const { addMaintenance } = useMaintenanceData();
  const router = useRouter();
  const { orgId } = useRouteIds();
  const searchParams = useSearchParams();
  const equipmentType = equipmentTypeProp ?? searchParams.get("equipment_type");

  const {
    data: activeMaintenance,
    isLoading: activeMaintenanceIsLoading,
    error: activeMaintenanceError,
  } = useIsActiveMaintenance({ equipment_id: selectedEquipment });

  const isNewMaintenance = activeMaintenance && !activeMaintenance.is_active;

  const [, formAction, isPending] = useActionState(
    async (
      _prevState: AddMaintenanceState,
      formData: FormData
    ): Promise<AddMaintenanceState> => {
      const equipment = formData.get("equipment") as string;
      const title = sanitizeText((formData.get("title") as string) || "");
      const description = sanitizeText(
        (formData.get("description") as string) || ""
      );
      const assignedto = formData.get("assignedto") as string;

      const finishAfterCreate = () => {
        if (onSuccess) {
          onSuccess();
          return;
        }
        onBack();
        if (orgId) router.push(orgPath(orgId, `/maintenance`));
      };

      const createIssue = (maintenanceId: string | number) => {
        createMaintenanceItem.mutate(
          {
            title,
            completed: false,
            maintenance: Number(maintenanceId),
          },
          { onSuccess: finishAfterCreate }
        );
      };

      try {
        if (isNewMaintenance) {
          const today = new Date(Date.now()).toISOString().split("T")[0];

          const newMaintenance = {
            equipment: Number.parseInt(equipment, 10),
            date: today,
            description,
            assigned_to: [Number.parseInt(assignedto, 10)].filter(
              (num) => !Number.isNaN(num)
            ),
            items: [],
          };

          addMaintenance.mutate(newMaintenance, {
            onSuccess: (data) => {
              createIssue(data.id);
            },
          });
        } else if (activeMaintenance?.maintenance?.[0]?.id) {
          createIssue(activeMaintenance.maintenance[0].id);
        }

        return { success: true, message: "Maintenance added successfully" };
      } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to add maintenance" };
      }
    },
    null
  );

  const handleEquipmentChange = useCallback((value: string) => {
    setSelectedEquipment(value);
  }, []);

  return {
    formAction,
    isPending,
    selectedEquipment,
    handleEquipmentChange,
    equipmentType,
    activeMaintenanceIsLoading,
    activeMaintenanceError,
    isNewMaintenance,
  };
}
