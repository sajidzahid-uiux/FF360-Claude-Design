"use client";

import { useCallback } from "react";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { CrewGroupDetail } from "@/api/types";
import { useDialogManager } from "@/hooks";
import { useCrewGroupMutations } from "@/hooks/mutations";
import { useRoutePermissions } from "@/hooks/permissions";
import { useAllCrewGroups } from "@/hooks/queries";
import { DialogManager } from "@/shared/ui/common";

import type { CrewGroupActionHandlers } from "../lib/buildCrewGroupTableActions";
import type { CrewGroupFormEditContext } from "../model/crewGroupForm";
import { CrewGroupGridCard } from "./CrewGroupGridCard";

export interface CrewGroupsViewProps {
  onEditGroup: (group: CrewGroupFormEditContext) => void;
}

export function CrewGroupsView({ onEditGroup }: CrewGroupsViewProps) {
  const { data: groups, isLoading, error } = useAllCrewGroups();
  const dialogManager = useDialogManager();
  const { deactivateCrewGroup, reactivateCrewGroup } = useCrewGroupMutations();
  const { write: canEditCrew, delete: canDeleteCrew } =
    useRoutePermissions() || {};

  const handleDeactivate = useCallback(
    async (groupId: number) => {
      try {
        await deactivateCrewGroup.mutateAsync(groupId);
        toast.success("Crew group deactivated successfully");
      } catch {
        toast.error("Failed to deactivate crew group");
        throw new Error("deactivate failed");
      }
    },
    [deactivateCrewGroup]
  );

  const openDeactivateConfirm = useCallback(
    (group: CrewGroupDetail) => {
      dialogManager.openConfirmationDialog({
        title: "Deactivate crew group?",
        description: `This will deactivate "${group.name}". You can reactivate it later.`,
        confirmButtonText: "Deactivate",
        cancelButtonText: "Cancel",
        variant: "destructive",
        onConfirm: () => handleDeactivate(group.id),
      });
    },
    [dialogManager, handleDeactivate]
  );

  const handlers: CrewGroupActionHandlers = {
    canEdit: !!canEditCrew,
    canDelete: !!canDeleteCrew,
    onEdit: onEditGroup,
    onDeactivate: openDeactivateConfirm,
    onReactivate: async (group) => {
      try {
        await reactivateCrewGroup.mutateAsync(group.id);
      } catch {
        // Hook surfaces toast
      }
    },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader size={ComponentSizeEnum.MD} text="Loading crew groups..." />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-feedback-error py-12 text-center text-sm">
        Error loading crew groups: {error.message}
      </p>
    );
  }

  if (!groups?.length) {
    return (
      <p className="text-text-muted py-12 text-center text-sm">
        No crew groups yet. Add a group to get started.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {groups.map((group) => (
          <CrewGroupGridCard key={group.id} group={group} handlers={handlers} />
        ))}
      </div>
      <DialogManager manager={dialogManager} />
    </>
  );
}
