import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { NotificationSettingsService } from "@/api/services";
import type { PatchImportantNotificationPayload } from "@/api/types";
import { QUERY_KEYS } from "@/constants/enums";

import { useRouteIds } from "../useRouteIds";

/**
 * Mutation to toggle a single Important notification setting (event_key + is_enabled).
 * Invalidates important notification settings query on success.
 */
export function usePatchImportantNotificationSetting() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: (payload: PatchImportantNotificationPayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return NotificationSettingsService.patchImportantNotificationSettings(
        organizationId,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NOTIFICATION_SETTINGS_IMPORTANT, organizationId],
      });
      toast.success("Notification preference updated");
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to update notification preference";
      toast.error(message);
    },
  });
}

/**
 * Mutation to toggle one or more Important notification settings (e.g. Crew Assignment
 * toggles both JOB_ASSIGNED and JOB_ASSIGNED_CREW). Runs all patches then invalidates
 * once and shows a single toast.
 */
export function usePatchImportantNotificationSettings() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (payloads: PatchImportantNotificationPayload[]) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      await Promise.all(
        payloads.map((payload) =>
          NotificationSettingsService.patchImportantNotificationSettings(
            organizationId,
            payload
          )
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NOTIFICATION_SETTINGS_IMPORTANT, organizationId],
      });
      toast.success("Notification preference updated");
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to update notification preference";
      toast.error(message);
    },
  });
}
