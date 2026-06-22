"use client";

import { useRef } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError, isAxiosError } from "axios";
import { toast } from "sonner";

import type { TeamMember } from "@/api/types";
import { QUERY_KEYS } from "@/constants/enums";
import { useRouteIds } from "@/hooks/lib/useRouteIds";
import { useTeamMemberMutations } from "@/hooks/mutations/useTeamMemberMutations";
import { useOrgAuthenticatedQueryEnabled } from "@/hooks/org/useOrgAuthenticatedQueryEnabled";
import axiosInstance from "@/lib/axios";
import { parseEntityId } from "@/shared/lib/parseEntityId";
import type { ApiErrorResponse } from "@/utils/apiError";

export function useInvitedMembersWithPermission(hasPermission?: boolean) {
  const { orgId: organization } = useRouteIds();
  const canQuery = useOrgAuthenticatedQueryEnabled(organization);
  return useQuery({
    queryKey: ["invitedMembers"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `ms/organizations/${organization}/invitation/`
      );
      return response.data;
    },
    enabled: canQuery && hasPermission,
  });
}

function useTeamData() {
  const queryClient = useQueryClient();
  const { orgId: organization } = useRouteIds();
  const canQueryTeam = useOrgAuthenticatedQueryEnabled(organization);
  const lastErrorTimeRef = useRef<number>(0);
  const { updateMemberRole } = useTeamMemberMutations();

  const teamQuery = useQuery<TeamMember[]>({
    // Scope by org so member PKs always match the current organization (tasks API validates Member.id per org).
    queryKey: ["team", organization],
    enabled: canQueryTeam,
    retry: 5,
    queryFn: async () => {
      const response = await axiosInstance.get(
        `ms/organizations/${organization}/team_members/`
      );
      return response.data;
    },
  });

  const getMember = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await axiosInstance.get(
        `ms/organizations/${organization}/team_members/${id}/`
      );
      return response.data;
    },
  });

  const acceptInvitation = useMutation({
    mutationFn: async (inviteToken: string) => {
      const response = await axiosInstance.post(`ms/accept_invitation/`, {
        token: inviteToken,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM_MEMBERS] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: unknown) => {
      // Check if enough time has passed since the last error toast (1 minute cooldown)
      const now = Date.now();
      const timeSinceLastError = now - lastErrorTimeRef.current;
      const COOLDOWN_TIME = 60000; // 1 minute in milliseconds

      if (timeSinceLastError < COOLDOWN_TIME) {
        return;
      }

      // Update the last error time
      lastErrorTimeRef.current = now;

      // Extract error message from response data
      let errorMessage = "Failed to accept invitation";

      if (isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
        const errorData = error.response.data;

        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData.error === "string") {
          errorMessage = errorData.error;
        } else if (
          errorData.non_field_errors &&
          errorData.non_field_errors[0]
        ) {
          errorMessage = errorData.non_field_errors[0];
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });

  const inviteMember = useMutation({
    mutationFn: async (newMember: { email: string; role_id: number }) => {
      try {
        const response = await axiosInstance.post(
          `ms/organizations/${organization}/invitation/`,
          newMember
        );
        return response.data;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;

        // Handle different error response formats
        let errorMessage =
          "Failed to send invitation. Please check your input.";

        if (errorData) {
          if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData.error === "string") {
            errorMessage = errorData.error;
          } else if (
            errorData.non_field_errors &&
            errorData.non_field_errors[0]
          ) {
            errorMessage = errorData.non_field_errors[0];
          } else if (errorData.email && Array.isArray(errorData.email)) {
            errorMessage = errorData.email[0];
          } else if (errorData.role_id && Array.isArray(errorData.role_id)) {
            errorMessage = errorData.role_id[0];
          }
        }

        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM_MEMBERS] });
      queryClient.invalidateQueries({ queryKey: ["invitedMembers"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SEAT_USAGE] });
    },
  });

  // const getInvitedMembers = useQuery({
  //   queryKey: ["invitedMembers"],
  //   queryFn: async () => {
  //     const response = await axiosInstance.get(
  //       `ms/organizations/${organization}/invitation/`
  //     );
  //     return response.data;
  //   },
  //   enabled: !!organization,
  // });

  const removeInvitedMember = useMutation({
    mutationFn: async (id: string) => {
      if (!organization) {
        throw new Error("No organization ID found");
      }
      const response = await axiosInstance.delete(
        `ms/organizations/${organization}/invitation/${id}/`
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invitedMembers"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SEAT_USAGE] });
    },
  });

  const addMember = useMutation({
    mutationFn: async (newMember: { email: string; role: string }) => {
      try {
        const response = await axiosInstance.post(
          `ms/organizations/${organization}/members/`,
          newMember
        );
        return response.data;
      } catch (error: unknown) {
        const errorResponse = isAxiosError<ApiErrorResponse>(error)
          ? error.response?.data
          : undefined;
        if (errorResponse?.detail === "No User matches the given query.") {
          throw new Error("No user with this username.");
        }
        throw new Error(
          errorResponse?.detail ||
            "Failed to add member. Please check your input."
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM_MEMBERS] });
    },
  });

  const updateMember = useMutation({
    mutationFn: async ({
      id,
      updatedMember,
    }: {
      id: string;
      updatedMember: { role?: string; role_id: number | string };
    }) => {
      if (!organization) {
        throw new Error("Organization ID is required");
      }
      // Backend requires role_id (new RBAC system) - role string is no longer supported
      if (!updatedMember.role_id) {
        throw new Error(
          "role_id is required. The update_member_role endpoint only supports the new RBAC system."
        );
      }
      return await updateMemberRole.mutateAsync({
        memberId: parseEntityId(id, "memberId"),
        roleId: parseEntityId(updatedMember.role_id, "roleId"),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM_MEMBERS] });
    },
  });

  const patchMemberFlags = useMutation({
    mutationFn: async ({
      id,
      is_designer,
      is_operator,
    }: {
      id: string;
      is_designer?: boolean;
      is_operator?: boolean;
    }) => {
      if (is_designer === undefined && is_operator === undefined) {
        throw new Error("is_designer and/or is_operator is required");
      }
      return await updateMemberRole.mutateAsync({
        memberId: parseEntityId(id, "memberId"),
        is_designer,
        is_operator,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM_MEMBERS] });
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(
        `ms/organizations/${organization}/remove_member/?id=${id}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM_MEMBERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SEAT_USAGE] });
    },
  });

  return {
    ...teamQuery, // Return the query-related properties
    addMember, // Return the mutation for adding member
    updateMember, // Return the mutation for updating member
    patchMemberFlags,
    deleteMember, // Return the mutation for deleting member
    getMember, // Return the mutation for getting a member
    inviteMember,
    acceptInvitation,
    // getInvitedMembers,
    removeInvitedMember,
  };
}

export default useTeamData;
