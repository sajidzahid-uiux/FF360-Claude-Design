"use client";

import { useCallback } from "react";

import type { useDialogManager } from "@/hooks/useDialogManager";
import { useModalStack } from "@/shared/model/use-modal-stack";

export const ADD_MAINTENANCE_MODAL_KEY = "add-maintenance";

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

/**
 * Returns a trigger that opens the URL-driven Add Maintenance modal.
 *
 * The modal itself is mounted by `<AddMaintenanceModalMount />` (Pattern B),
 * which reads the same modal stack and reconstructs the form props (team
 * options, navigation) from hooks + the scalar params pushed here.
 *
 * The `dialogManager` argument is kept for backwards-compatible call sites but
 * is no longer used to open this dialog.
 */
export function useOpenAddMaintenanceDialog(_dialogManager?: DialogManagerApi) {
  const { openModal } = useModalStack();

  return useCallback(
    ({
      equipmentId,
      equipmentType = null,
      navigateOnSuccess = false,
    }: OpenAddMaintenanceDialogParams) => {
      openModal(ADD_MAINTENANCE_MODAL_KEY, {
        id: equipmentId,
        type: equipmentType ?? "",
        nav: navigateOnSuccess ? "1" : "0",
      });
    },
    [openModal]
  );
}
