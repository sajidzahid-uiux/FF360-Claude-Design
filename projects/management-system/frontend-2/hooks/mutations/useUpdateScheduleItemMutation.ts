import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { SchedulingService } from "@/api/services";
import type { SchedulingItemUpdateArgs } from "@/api/types";
import { QUERY_KEYS, ResourceType } from "@/constants";

import { useRouteIds } from "../useRouteIds";

export function useUpdateScheduleItemMutation() {
  const { orgId: organizationId } = useRouteIds();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: SchedulingItemUpdateArgs) => {
      const { itemId, entityType, payload } = args;
      if (!organizationId) throw new Error("Organization ID is required");
      return SchedulingService.updateItemSchedule(
        organizationId,
        itemId,
        entityType,
        payload
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CALENDAR_ITEMS, organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CALENDAR_STATISTICS, organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CALENDAR_UNSCHEDULED, organizationId],
      });
      // Job/lead detail and list views read start_date/end_date too — refresh
      // them so a user navigating from the calendar to the entity page sees
      // the dates they just saved.
      if (variables.entityType === ResourceType.JOB) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_JOBS] });
      } else {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAD] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEADS] });
      }
      toast.success("Schedule updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update schedule");
    },
  });
}
