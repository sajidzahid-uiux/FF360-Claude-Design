import { useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ContactsService } from "@/api/services";
import type { FarmCreatePayload, FarmUpdatePayload } from "@/api/types";
import type { IdNumberUpdatePayload } from "@/api/types/common";
import { QUERY_KEYS } from "@/constants/enums";
import { ON_SITE_OPERATION_LABEL } from "@/features/contacts/model/constants";

import { useRouteIds } from "../useRouteIds";

export const useFarmMutations = (contactId: number) => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const invalidateFarmQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FARMS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FARM] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORD_FARMS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEADS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAD] });
  }, [queryClient]);

  const create = useMutation({
    mutationFn: (data: FarmCreatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.createFarm(organizationId, contactId, data);
    },
    onSuccess: () => {
      invalidateFarmQueries();
      toast.success(`${ON_SITE_OPERATION_LABEL} created successfully`);
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          `Failed to create ${ON_SITE_OPERATION_LABEL.toLowerCase()}`
      );
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: IdNumberUpdatePayload<FarmUpdatePayload>) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.updateFarm(organizationId, contactId, id, data);
    },
    onSuccess: () => {
      invalidateFarmQueries();
      toast.success(`${ON_SITE_OPERATION_LABEL} updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          `Failed to update ${ON_SITE_OPERATION_LABEL.toLowerCase()}`
      );
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.deleteFarm(organizationId, contactId, id);
    },
    onSuccess: () => {
      invalidateFarmQueries();
      toast.success(`${ON_SITE_OPERATION_LABEL} deleted successfully`);
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          `Failed to delete ${ON_SITE_OPERATION_LABEL.toLowerCase()}`
      );
    },
  });

  return {
    create,
    update,
    remove,
    createFarm: create,
    updateFarm: update,
    patchFarm: update,
    deleteFarm: remove,
  };
};
