import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { NewNotificationsService } from "@/api/services";
import type { MarkNewNotificationReadArgs } from "@/api/types/newNotifications";
import { QUERY_KEYS } from "@/constants/enums";
import { getCookie } from "@/lib/cookies";

import { useRouteIds } from "../useRouteIds";

function useOrgId() {
  const { orgId } = useRouteIds();
  return orgId || getCookie("lastOrgId") || null;
}

/**
 * Mark a single notification as read.
 */
export function useMarkNewNotificationRead() {
  const queryClient = useQueryClient();
  const organizationId = useOrgId();

  return useMutation({
    mutationFn: ({ id, read }: MarkNewNotificationReadArgs) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return NewNotificationsService.patch(organizationId, id, { read });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NEW_NOTIFICATIONS, organizationId],
      });
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to update notification";
      toast.error(message);
    },
  });
}

/**
 * Mark all unread notifications as read. Invalidates list and unread count.
 */
export function useMarkAllNewNotificationsRead() {
  const queryClient = useQueryClient();
  const organizationId = useOrgId();

  return useMutation({
    mutationFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return NewNotificationsService.markAllRead(organizationId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NEW_NOTIFICATIONS, organizationId],
      });
      toast.success(
        data.marked_count === 0
          ? "No unread notifications"
          : `${data.marked_count} notification${data.marked_count !== 1 ? "s" : ""} marked as read`
      );
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to mark all as read";
      toast.error(message);
    },
  });
}

/**
 * Delete a single notification.
 */
export function useDeleteNewNotification() {
  const queryClient = useQueryClient();
  const organizationId = useOrgId();

  return useMutation({
    mutationFn: (id: number | string) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return NewNotificationsService.delete(organizationId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NEW_NOTIFICATIONS, organizationId],
      });
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to delete notification";
      toast.error(message);
    },
  });
}

/**
 * Delete all notifications for the current user. Call only after user confirmation.
 */
export function useDeleteAllNewNotifications() {
  const queryClient = useQueryClient();
  const organizationId = useOrgId();

  return useMutation({
    mutationFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return NewNotificationsService.deleteAll(organizationId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NEW_NOTIFICATIONS, organizationId],
      });
      toast.success(
        `${data.deleted_count} notification${data.deleted_count !== 1 ? "s" : ""} deleted`
      );
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to delete all notifications";
      toast.error(message);
    },
  });
}
