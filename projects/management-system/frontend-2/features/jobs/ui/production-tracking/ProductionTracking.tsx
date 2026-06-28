"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@fieldflow360/org-ui";
import { User, Users } from "lucide-react";
import { toast } from "sonner";

import { CrewAssignment, EquipmentAssignment, JobType } from "@/api/types";
import { jobTypeToRouteSegment } from "@/constants";
import {
  JobEquipmentAssignment,
  useAssignmentMembershipHelper,
} from "@/features/jobs";
import { useJobAssignedToFilter } from "@/features/jobs/hooks/useJobAssignedToFilter";
import { useJobCrewMutations } from "@/hooks/mutations";
import { useJobCrewPermissions } from "@/hooks/permissions";
import {
  useAllCrewGroups,
  useAvailableCrewGroups,
  useAvailableIndividuals,
  useJobById,
  useJobTeamList,
} from "@/hooks/queries";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useRouteIds } from "@/hooks/useRouteIds";
import { orgPath } from "@/shared/config/routes";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { parseEntityId } from "@/shared/lib/parseEntityId";
import { DetailFormSection } from "@/shared/ui/common";

import { AssignCrewDialog } from "./AssignCrewDialog";
import { CrewAssignmentCard } from "./CrewAssignmentCard";
import Scheduling from "./Scheduling";
import SchedulingTiling from "./SchedulingTiling";

interface ProductionTrackingProps {
  jobId: string | number;
  disabled?: boolean;
  /** When set, only Scheduling / SchedulingTiling use this; crew & equipment use `disabled`. */
  schedulingDisabled?: boolean;
  jobType: JobType;
  equipments?: EquipmentAssignment[];
  isTrashed?: boolean;
}

export default function ProductionTracking({
  jobId,
  disabled = false,
  schedulingDisabled,
  jobType,
  isTrashed = false,
}: ProductionTrackingProps) {
  const router = useRouter();
  const { orgId } = useRouteIds();
  const { assignedTo } = useJobAssignedToFilter();
  const memberId = useDataFromStorageByKey(StorageKey.MEMBER_ID);
  const { resolveFilteredMemberId, evaluateAssignmentStateAfterRemoval } =
    useAssignmentMembershipHelper();

  const {
    assignCrewGroup,
    assignIndividual,
    deactivateAssignment,
    reactivateAssignment,
  } = useJobCrewMutations(parseEntityId(jobId));

  const { data: teamList, isLoading } = useJobTeamList(jobId);
  const { data: allCrewGroups = [], isFetched: areCrewGroupsFetched } =
    useAllCrewGroups();
  const { data: jobData } = useJobById(jobId, jobType, false, isTrashed);

  // Use job type from job data if available, otherwise use determined type
  const finalJobType = jobType || jobData?.object_type || jobType;

  // Check crew management permissions
  const { canManageCrew, isLoading: isCrewPermissionLoading } =
    useJobCrewPermissions(finalJobType as JobType);
  const { data: availableGroups } = useAvailableCrewGroups(jobId);
  const { data: availableIndividuals } = useAvailableIndividuals(jobId);

  const { stack, openModal, closeModalKey } = useModalStack();
  const showAssignGroupDialog = stack.some((f) => f.key === "assign-crew-group");
  const showAssignIndividualDialog = stack.some(
    (f) => f.key === "assign-crew-individual"
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  // Get all assignments (both active and inactive)
  const allAssignments = useMemo(() => teamList?.assignments || [], [teamList]);

  // Get active assignments only for filtering available options
  const activeAssignments = useMemo(() => {
    return allAssignments.filter((assignment) => assignment.is_active);
  }, [allAssignments]);

  // Separate groups and individuals (both active and inactive for display)
  const groupAssignments = allAssignments.filter(
    (assignment) => assignment.assignment_type === "crew_group"
  );
  const individualAssignments = allAssignments.filter(
    (assignment) => assignment.assignment_type === "individual"
  );

  // Get assigned IDs to filter out from available options (only active ones)
  const assignedGroupIds = useMemo(
    () =>
      new Set(
        activeAssignments
          .filter((a) => a.assignment_type === "crew_group")
          .map((a) => a.crew_group_id)
          .filter(Boolean) as number[]
      ),
    [activeAssignments]
  );

  const assignedMemberIds = useMemo(
    () =>
      new Set(
        activeAssignments
          .filter((a) => a.assignment_type === "individual")
          .map((a) => a.member_id)
          .filter(Boolean) as number[]
      ),
    [activeAssignments]
  );

  const availableGroupsFiltered = useMemo(
    () =>
      availableGroups?.filter((group) => !assignedGroupIds.has(group.id)) || [],
    [availableGroups, assignedGroupIds]
  );

  const availableIndividualsFiltered = useMemo(
    () =>
      availableIndividuals?.filter(
        (member) => !assignedMemberIds.has(member.id)
      ) || [],
    [availableIndividuals, assignedMemberIds]
  );

  const handleAssignGroup = async () => {
    if (!selectedGroupId) {
      toast.error("Please select a group");
      return;
    }

    try {
      await assignCrewGroup.mutateAsync({
        crew_group_id: parseInt(selectedGroupId),
      });
      closeModalKey("assign-crew-group");
      setSelectedGroupId("");
    } catch (error) {
      console.error("Error assigning group:", error);
      // Error handling is done in the mutation
    }
  };

  const handleAssignIndividual = async () => {
    if (!selectedMemberId) {
      toast.error("Please select an individual");
      return;
    }

    try {
      await assignIndividual.mutateAsync({
        member_id: parseInt(selectedMemberId),
      });
      closeModalKey("assign-crew-individual");
      setSelectedMemberId("");
    } catch (error) {
      console.error("Error assigning individual:", error);
      // Error handling is done in the mutation
    }
  };

  const handleRemoveAssignment = async (assignment: CrewAssignment) => {
    try {
      await deactivateAssignment.mutateAsync({
        assignment_id: assignment.id,
        assignment_type: assignment.assignment_type,
      });

      // If the list is filtered to a specific assignee and we just removed that
      // assignee from this job, navigate back to the list to avoid a "stuck" detail view.
      const currentMemberId =
        typeof memberId === "string" ? parseInt(memberId, 10) : memberId;
      const filteredMemberId = resolveFilteredMemberId(
        assignedTo,
        currentMemberId
      );

      const activeAssignmentsAfterRemoval = activeAssignments.filter(
        (activeAssignment) => activeAssignment.id !== assignment.id
      );
      const activeGroupIdsAfterRemoval = activeAssignmentsAfterRemoval
        .filter(
          (activeAssignment) =>
            activeAssignment.assignment_type === "crew_group"
        )
        .map((activeAssignment) => activeAssignment.crew_group_id)
        .filter((groupId): groupId is number => groupId != null);
      const canEvaluateGroupMembership =
        activeGroupIdsAfterRemoval.length === 0 || areCrewGroupsFetched;

      const { shouldRedirect } = evaluateAssignmentStateAfterRemoval({
        removedAssignment: assignment,
        activeAssignmentsAfterRemoval,
        crewGroups: allCrewGroups,
        designers: jobData?.designers as
          | Array<number | { id?: number | null }>
          | undefined,
        filteredMemberId,
        canEvaluateGroupMembership,
      });

      if (shouldRedirect && orgId) {
        router.push(
          orgPath(orgId, `/jobs/${jobTypeToRouteSegment(finalJobType)}`)
        );
      }
    } catch (error) {
      console.error("Error removing assignment:", error);
      // Error handling is done in the mutation
    }
  };

  const handleReactivateAssignment = async (assignment: CrewAssignment) => {
    try {
      await reactivateAssignment.mutateAsync({
        assignment_id: assignment.id,
        assignment_type: assignment.assignment_type,
      });
    } catch (error) {
      console.error("Error reactivating assignment:", error);
      // Error handling is done in the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-lg">
        Loading project team...
      </div>
    );
  }

  const schedulingLocked = schedulingDisabled ?? disabled;

  const assignActions = canManageCrew ? (
    <>
      <Button
        disabled={isCrewPermissionLoading || disabled || isTrashed}
        leftIcon={<Users className="h-4 w-4" />}
        title="Assign group"
        onClick={() => openModal("assign-crew-group")}
      />
      <Button
        disabled={isCrewPermissionLoading || disabled || isTrashed}
        leftIcon={<User className="h-4 w-4" />}
        title="Assign individual"
        onClick={() => openModal("assign-crew-individual")}
      />
    </>
  ) : null;

  return (
    <div className="flex flex-col gap-5">
      {finalJobType === JobType.TILING ? (
        <SchedulingTiling
          disabled={disabled}
          isTrashed={isTrashed}
          jobId={jobId}
          timelineDisabled={schedulingLocked}
        />
      ) : (
        <Scheduling
          disabled={schedulingLocked}
          isTrashed={isTrashed}
          jobId={jobId}
          jobType={finalJobType}
        />
      )}
      <DetailFormSection
        actions={assignActions}
        description="Assign crew groups and individuals to this job."
        title="Project team"
      >
        <div className="space-y-4">
          {/* Groups Section */}
          {groupAssignments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Assigned Groups</h3>
              <div className="space-y-2">
                {groupAssignments.map((assignment) => (
                  <CrewAssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    canManageCrew={canManageCrew}
                    disabled={disabled || isTrashed}
                    onDeactivate={handleRemoveAssignment}
                    onReactivate={handleReactivateAssignment}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Individuals Section */}
          {individualAssignments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Assigned Individuals</h3>
              <div className="space-y-2">
                {individualAssignments.map((assignment) => (
                  <CrewAssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    canManageCrew={canManageCrew}
                    disabled={disabled || isTrashed}
                    onDeactivate={handleRemoveAssignment}
                    onReactivate={handleReactivateAssignment}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {allAssignments.length === 0 && (
            <div className="text-text-muted py-8 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No crew assigned to this job yet.</p>
              <p className="text-sm">
                Use the buttons above to assign groups or individuals.
              </p>
            </div>
          )}
        </div>
      </DetailFormSection>

      {jobData?.equipments &&
        jobData.equipments.length >= 0 &&
        finalJobType && (
          <JobEquipmentAssignment
            assignments={jobData.equipments}
            disabled={disabled || isTrashed}
            jobId={typeof jobId === "string" ? parseInt(jobId, 10) : jobId}
            jobType={finalJobType}
            mode="manage"
          />
        )}

      {/* Assign Group Dialog */}
      <AssignCrewDialog
        availableOptions={availableGroupsFiltered.map((group) => ({
          id: group.id,
          name: group.name,
        }))}
        canManageCrew={canManageCrew}
        isCrewPermissionLoading={isCrewPermissionLoading}
        isOpen={showAssignGroupDialog}
        isPending={assignCrewGroup.isPending}
        selectedId={selectedGroupId}
        type="group"
        onClose={() => {
          closeModalKey("assign-crew-group");
          setSelectedGroupId("");
        }}
        onSelectedIdChange={setSelectedGroupId}
        onSubmit={handleAssignGroup}
      />

      {/* Assign Individual Dialog */}
      <AssignCrewDialog
        availableOptions={availableIndividualsFiltered.map((member) => ({
          id: member.id,
          name: member.name,
          email: member.email,
        }))}
        canManageCrew={canManageCrew}
        isCrewPermissionLoading={isCrewPermissionLoading}
        isOpen={showAssignIndividualDialog}
        isPending={assignIndividual.isPending}
        selectedId={selectedMemberId}
        type="individual"
        onClose={() => {
          closeModalKey("assign-crew-individual");
          setSelectedMemberId("");
        }}
        onSelectedIdChange={setSelectedMemberId}
        onSubmit={handleAssignIndividual}
      />
    </div>
  );
}
