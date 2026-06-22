import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { TeamService } from "@/api/services";
import type { InvitationPayload, MemberRoleUpdateArgs } from "@/api/types";
import { QUERY_KEYS } from "@/constants/enums";
import type { ApiErrorResponse } from "@/utils/apiError";

import { useRouteIds } from "../useRouteIds";

/**
 * Mutations hook for team member operations
 * Follows SRP - each mutation has a single responsibility
 * Uses TeamService and apiClient for all API calls (DRY principle)
 */
export const useTeamMemberMutations = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const updateMemberRole = useMutation({
    mutationFn: async ({
      memberId,
      roleId,
      is_designer,
      is_operator,
    }: MemberRoleUpdateArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      const body = Object.fromEntries(
        Object.entries({
          role_id: roleId,
          is_designer,
          is_operator,
        }).filter(([, v]) => v !== undefined)
      );

      if (!Object.keys(body).length) {
        throw new Error(
          "At least one of role_id, is_designer, is_operator is required"
        );
      }
      return apiClient.patch(
        `${API_ENDPOINTS.organizations.detail(organizationId)}update_member_role/?id=${memberId}`,
        body
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TEAM_MEMBERS, organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TEAM, organizationId],
      });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: number | string) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return apiClient.delete(
        `${API_ENDPOINTS.organizations.detail(organizationId)}remove_member/?id=${memberId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TEAM_MEMBERS, organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TEAM, organizationId],
      });
    },
  });

  const sendInvitation = useMutation({
    mutationFn: async (data: InvitationPayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return TeamService.sendInvitation(organizationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitedMembers"] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TEAM_MEMBERS, organizationId],
      });
    },
    onError: (error: unknown) => {
      const errorMessage = isAxiosError<ApiErrorResponse>(error)
        ? error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message
        : error instanceof Error
          ? error.message
          : "Failed to send invitation";
      toast.error(errorMessage);
    },
  });

  return {
    updateMemberRole,
    removeMember,
    sendInvitation,
  };
};
