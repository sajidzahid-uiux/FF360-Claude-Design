import { useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ContactsService } from "@/api/services";
import type { CategoryCreatePayload, CategoryUpdatePayload } from "@/api/types";
import type { IdNumberUpdatePayload } from "@/api/types/common";
import { QUERY_KEYS } from "@/constants/enums";

import { useRouteIds } from "../useRouteIds";

export const useCategoryMutations = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const invalidateCategoryQueries = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.CONTACT_CATEGORIES],
    });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONTACTS] });
  }, [queryClient]);

  const create = useMutation({
    mutationFn: (data: CategoryCreatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.createCategory(organizationId, data);
    },
    onSuccess: () => {
      invalidateCategoryQueries();
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: IdNumberUpdatePayload<CategoryUpdatePayload>) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.updateCategory(organizationId, id, data);
    },
    onSuccess: () => {
      invalidateCategoryQueries();
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.deleteCategory(organizationId, id);
    },
    onSuccess: () => {
      invalidateCategoryQueries();
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });

  return {
    create,
    update,
    remove,
    createCategory: create,
    updateCategory: update,
    patchCategory: update,
    deleteCategory: remove,
  };
};
