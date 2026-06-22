"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useRouteIds, useTeamData } from "@/hooks";
import type { useDialogManager } from "@/hooks/useDialogManager";
import { orgPath } from "@/shared/config/routes";
import { filterActiveTeamMembers } from "@/utils/team/assignmentOrder";

import { AddMaintenanceForm } from "../ui/AddMaintenanceForm";

export interface OpenAddMaintenanceDialogParams {
  equipmentId: string;
  /** `vehicle` | `machine` | `trailer` — loads the correct equipment list in the form. */
  equipmentType?: string | null;
  /** Navigates to the maintenance list after a successful submit (not on cancel). */
  navigateOnSuccess?: boolean;
}

type DialogManagerApi = Pick<
  ReturnType<typeof useDialogManager>,
  "openDialog" | "closeDialog"
>;

export function useOpenAddMaintenanceDialog(dialogManager: DialogManagerApi) {
  const { data: team } = useTeamData();
  const router = useRouter();
  const { orgId } = useRouteIds();

  return useCallback(
    ({
      equipmentId,
      equipmentType = null,
      navigateOnSuccess = false,
    }: OpenAddMaintenanceDialogParams) => {
      const closeDialog = () => dialogManager.closeDialog();

      dialogManager.openDialog({
        type: "addMaintenance",
        component: AddMaintenanceForm,
        props: {
          assignedToOptions:
            filterActiveTeamMembers(team).map((t) => ({
              value: t.id.toString(),
              label: t?.user?.username ?? "",
            })) ?? [],
          equipmentIdParam: equipmentId,
          equipmentType,
          onBack: closeDialog,
          onSuccess: navigateOnSuccess
            ? () => {
                closeDialog();
                if (orgId) {
                  router.push(orgPath(orgId, "/maintenance"));
                }
              }
            : undefined,
        },
      });
    },
    [dialogManager, orgId, router, team]
  );
}
