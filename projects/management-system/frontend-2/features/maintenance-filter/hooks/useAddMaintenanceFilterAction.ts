"use client";

import { useActionState } from "react";

import type { AddMaintenanceFilterFormData } from "../model/types";

export type AddMaintenanceFilterFormState = { error?: string } | null;

const initialState: AddMaintenanceFilterFormState = null;

export function useAddMaintenanceFilterAction(
  onAdd: (data: AddMaintenanceFilterFormData) => void | Promise<void>
) {
  return useActionState(
    async (
      _prevState: AddMaintenanceFilterFormState,
      formData: FormData
    ): Promise<AddMaintenanceFilterFormState> => {
      const lastChanged = (formData.get("lastChanged") as string)?.trim() ?? "";
      const threshold = (formData.get("threshold") as string)?.trim() ?? "";
      const filterNumber =
        (formData.get("filterNumber") as string)?.trim() ?? "";

      const hasLastChanged = lastChanged !== "";
      const hasThreshold = threshold !== "";

      if (hasLastChanged !== hasThreshold) {
        return {
          error:
            "Last changed and threshold must both be filled or both be left empty.",
        };
      }
      if (!hasLastChanged && !hasThreshold) {
        return {
          error:
            "At least one value (Last Changed or Threshold) must be provided.",
        };
      }

      try {
        await onAdd({ lastChanged, threshold, filterNumber });
        return null;
      } catch {
        return { error: "Failed to add filter." };
      }
    },
    initialState
  );
}
