import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { NotificationSettingsService } from "@/api/services";
import type { PatchFyiNotificationPayload } from "@/api/types";
import { QUERY_KEYS } from "@/constants/enums";

import { useRouteIds } from "../useRouteIds";

/**
 * Mutation to update assigned users for one FYI event.
 * Invalidates FYI notification settings query on success.
 */
export function usePatchFyiNotificationSetting() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: (payload: PatchFyiNotificationPayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return NotificationSettingsService.patchFyiNotificationSettings(
        organizationId,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NOTIFICATION_SETTINGS_FYI, organizationId],
      });
      toast.success("Updates notification recipients updated.");
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to update FYI recipients";
      toast.error(message);
    },
  });
}
