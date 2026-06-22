import { useMutation, useQueryClient } from "@tanstack/react-query";

import { OrganizationSettingsService } from "@/api/services/organizationSettingsService";
import { PatchOrganizationSettingsArgs } from "@/api/types";

import { useRouteIds } from "../useRouteIds";

/**
 * Mutation to PATCH organization settings (e.g. monthly_summary_email_enabled).
 * Invalidates settings and OrganizationsSettings queries on settle.
 */
export function usePatchSettingsMutation() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ newSettings }: PatchOrganizationSettingsArgs) => {
      if (!organizationId) throw new Error("No organization");
      return OrganizationSettingsService.patchOrganizationSettings(
        organizationId,
        newSettings
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["OrganizationsSettings"] });
    },
  });
}
