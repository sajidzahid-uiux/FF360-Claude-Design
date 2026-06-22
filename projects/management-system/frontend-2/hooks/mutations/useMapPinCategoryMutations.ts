import { useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MapService } from "@/api/services/mapService";
import type { IdNumberUpdatePayload } from "@/api/types/common";
import type {
  MapPinCategoryCreatePayload,
  MapPinCategoryUpdatePayload,
} from "@/api/types/mapPinCategory";
import { getErrorMessage } from "@/utils/apiError";

import {
  MAP_PINS_QUERY_KEY,
  MAP_PIN_CATEGORIES_QUERY_KEY,
} from "../queries/mapQueryKeys";
import { useRouteIds } from "../useRouteIds";

export interface UseMapPinCategoryMutationsOptions {
  useSettingsPrefix?: boolean;
}

export const useMapPinCategoryMutations = ({
  useSettingsPrefix = false,
}: UseMapPinCategoryMutationsOptions = {}) => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const invalidateCategoryQueries = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: [MAP_PIN_CATEGORIES_QUERY_KEY],
    });
    void queryClient.invalidateQueries({
      queryKey: [MAP_PINS_QUERY_KEY],
    });
  }, [queryClient]);

  const create = useMutation({
    mutationFn: (data: MapPinCategoryCreatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return MapService.createPinCategory(
        organizationId,
        data,
        useSettingsPrefix
      );
    },
    onSuccess: () => {
      invalidateCategoryQueries();
      toast.success("Category created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create category"));
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: IdNumberUpdatePayload<MapPinCategoryUpdatePayload>) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return MapService.updatePinCategory(
        organizationId,
        id,
        data,
        useSettingsPrefix
      );
    },
    onSuccess: () => {
      invalidateCategoryQueries();
      toast.success("Category updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update category"));
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return MapService.deletePinCategory(
        organizationId,
        id,
        useSettingsPrefix
      );
    },
    onSuccess: () => {
      invalidateCategoryQueries();
      toast.success("Category deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete category"));
    },
  });

  return {
    create,
    update,
    remove,
    createCategory: create,
    updateCategory: update,
    deleteCategory: remove,
  };
};
