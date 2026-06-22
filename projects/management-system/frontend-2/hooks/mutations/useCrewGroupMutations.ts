import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CrewService } from "@/api/services";
import type {
  AddMembersPayload,
  CreateCrewGroupPayload,
  CrewGroup,
  DeactivateMembersPayload,
  ReactivateMembersPayload,
  UpdateCrewGroupPayload,
} from "@/api/types";
import type { CrewGroupIdUpdatePayload, IdOf } from "@/api/types/common";
import { getErrorMessage } from "@/utils/apiError";

import { useRouteIds } from "../useRouteIds";

export const useCrewGroupMutations = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const createCrewGroup = useMutation({
    mutationFn: async (data: CreateCrewGroupPayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return CrewService.createCrewGroup(organizationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-groups"] });
      queryClient.invalidateQueries({ queryKey: ["crew-group"] });
      toast.success("Crew group created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create crew group"));
    },
  });

  const updateCrewGroup = useMutation({
    mutationFn: async ({
      crewGroupId,
      data,
    }: CrewGroupIdUpdatePayload<UpdateCrewGroupPayload, CrewGroup>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return CrewService.updateCrewGroup(organizationId, crewGroupId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-groups"] });
      queryClient.invalidateQueries({ queryKey: ["crew-group"] });
      toast.success("Crew group updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update crew group"));
    },
  });

  const deactivateCrewGroup = useMutation({
    mutationFn: async (crewGroupId: IdOf<CrewGroup>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return CrewService.deactivateCrewGroup(organizationId, crewGroupId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew-groups"] });
      queryClient.invalidateQueries({ queryKey: ["crew-group"] });
      toast.success(data.message || "Crew group deactivated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to deactivate crew group"));
    },
  });

  const reactivateCrewGroup = useMutation({
    mutationFn: async (crewGroupId: IdOf<CrewGroup>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return CrewService.reactivateCrewGroup(organizationId, crewGroupId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew-groups"] });
      queryClient.invalidateQueries({ queryKey: ["crew-group"] });
      toast.success(data.message || "Crew group reactivated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to reactivate crew group"));
    },
  });

  const addMembersToGroup = useMutation({
    mutationFn: async ({
      crewGroupId,
      data,
    }: CrewGroupIdUpdatePayload<AddMembersPayload>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return CrewService.addMembersToGroup(organizationId, crewGroupId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew-groups"] });
      queryClient.invalidateQueries({ queryKey: ["crew-group"] });
      queryClient.invalidateQueries({ queryKey: ["crew-directory"] });
      queryClient.invalidateQueries({
        queryKey: ["crew-group", "available_members"],
      });
      toast.success(data.message || "Members added successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to add members"));
    },
  });

  const deactivateMembersFromGroup = useMutation({
    mutationFn: async ({
      crewGroupId,
      data,
    }: CrewGroupIdUpdatePayload<DeactivateMembersPayload>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return CrewService.deactivateMembersFromGroup(
        organizationId,
        crewGroupId,
        data
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew-groups"] });
      queryClient.invalidateQueries({ queryKey: ["crew-group"] });
      queryClient.invalidateQueries({ queryKey: ["crew-directory"] });
      queryClient.invalidateQueries({
        queryKey: ["crew-group", "available_members"],
      });
      toast.success(data.message || "Members deactivated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to deactivate members"));
    },
  });

  const reactivateMembersInGroup = useMutation({
    mutationFn: async ({
      crewGroupId,
      data,
    }: CrewGroupIdUpdatePayload<ReactivateMembersPayload>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return CrewService.reactivateMembersInGroup(
        organizationId,
        crewGroupId,
        data
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew-groups"] });
      queryClient.invalidateQueries({ queryKey: ["crew-group"] });
      queryClient.invalidateQueries({ queryKey: ["crew-directory"] });
      queryClient.invalidateQueries({
        queryKey: ["crew-group", "available_members"],
      });
      toast.success(data.message || "Members reactivated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to reactivate members"));
    },
  });

  return {
    createCrewGroup,
    updateCrewGroup,
    deactivateCrewGroup,
    reactivateCrewGroup,
    addMembersToGroup,
    deactivateMembersFromGroup,
    reactivateMembersInGroup,
  };
};
