import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { VendorsService } from "@/api/services";
import type { Vendor, VendorFavorite } from "@/api/types";

import {
  MAX_FAVORITE_VENDORS,
  normalizeFavoriteVendors,
} from "../queries/useVendorsQueries";
import { useRouteIds } from "../useRouteIds";

export const useFavoriteVendorMutations = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const addFavorite = useMutation({
    mutationFn: async (vendorId: number) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return VendorsService.addFavoriteVendor(organizationId, {
        vendor_id: vendorId,
      });
    },
    onSuccess: () => {
      const oldData = queryClient.getQueryData<VendorFavorite[] | Vendor[]>([
        "vendors",
        "favorites",
        organizationId,
      ]);
      const { vendors: currentVendors } = normalizeFavoriteVendors(oldData);
      const willBeAtMax = currentVendors.length + 1 >= MAX_FAVORITE_VENDORS;

      queryClient.invalidateQueries({
        queryKey: ["vendors", "favorites", organizationId],
      });
      toast.success("Vendor added to favorites");
      if (willBeAtMax) {
        toast.warning(
          `Maximum number of favorite vendors reached (${MAX_FAVORITE_VENDORS}). Remove one to add another.`
        );
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { vendor_id?: string[] } } };
      const msg =
        err.response?.data?.vendor_id?.[0] ||
        (error as Error).message ||
        "Failed to add vendor to favorites";
      toast.error(msg);
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (favoriteId: number | string) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return VendorsService.removeFavoriteVendor(organizationId, favoriteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vendors", "favorites", organizationId],
      });
      toast.success("Vendor removed from favorites");
    },
    onError: (error: unknown) => {
      const msg = (error as Error).message || "Failed to remove from favorites";
      toast.error(msg);
    },
  });

  return {
    addFavorite,
    removeFavorite,
  };
};
