import { useQuery } from "@tanstack/react-query";

import { RolesService } from "@/api/services";
import { useRouteIds } from "@/hooks/lib/useRouteIds";
import { useIsAdmin } from "@/hooks/queries/useIsAdmin";
import axiosInstance from "@/lib/axios";

export type MappingType =
  //--------for pipe orders-----------
  | "vendor_statuses"
  | "pipe_types"
  | "corragated_types"
  | "single_wall_sizes"
  | "dual_wall_sizes"
  | "internal_couplers_sizes"
  | "split_couplers_sizes"
  | "snap_couplers_sizes"
  | "external_end_caps_sizes"
  | "internal_end_plugs_sizes"
  | "clay_adapters_sizes"
  | "straight_tees_sizes"
  | "blind_tees_sizes"
  | "wyes_sizes"
  | "elbow_90_sizes"
  | "step_down_reducing_tees_sizes"
  | "reducers_sizes"
  | "tap_tee_short_sizes"
  | "bar_guards_sizes"
  | "hickenbottom_sect_1_2_sizes"
  | "hickenbottom_tee_sizes"
  | "precision_sect_1_2_sizes"
  | "precision_tee_sizes"
  | "rat_guards_sizes"
  | "accessory_items"
  //----------------------------------
  | "member_roles"
  | "equipment_types"
  | "equipment_tracker_statuses"
  | "job_customer_statuses"
  | "job_stateses"
  | "leadItem_types"
  | "equipment_tracker_status"
  | "equipment_service_status"
  | "leadItem_lead_statuses"
  | "lead_types"
  | "vendor_statuses"
  | "status_job_types"
  | "content_types"
  | "main_pipe_sizes";

const localEquipmentMapping: [string, string][] = [
  ["M", "Machine"],
  ["V", "Vehicle"],
  ["T", "Trailer"],
  ["machines", "machines"],
  ["vehicles", "vehicles"],
  ["trailers", "trailers"],
];

const localServiceStatus: [string, string][] = [
  ["A", "Available"],
  ["U", "Unavailable"],
];

export const useMapping = (mappingType: MappingType) => {
  const { orgId: organizationId } = useRouteIds();
  const isAdmin = useIsAdmin();
  const queryKey = ["memberRoleData", mappingType, organizationId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (mappingType === "equipment_types") return localEquipmentMapping;
      if (mappingType === "equipment_service_status") return localServiceStatus;

      // Use new RBAC roles endpoint for member_roles
      if (mappingType === "member_roles") {
        if (!organizationId) {
          throw new Error("Organization ID is required for member_roles");
        }
        const roles = await RolesService.getRoles(organizationId);
        // Transform Role[] to [string, string][] format: [role.id, role.name]
        return roles.map(
          (role) => [role.id.toString(), role.name] as [string, string]
        );
      }

      const response = await axiosInstance.get(`ms/dropdowns/${mappingType}/`);
      return response.data;
    },
    enabled: mappingType !== "member_roles" || (!!organizationId && isAdmin),
  });
};
