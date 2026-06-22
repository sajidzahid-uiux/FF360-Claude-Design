"use client";

import { useCallback } from "react";

import type { CrewAssignment, CrewGroupDetail } from "@/api/types";
import axiosInstance from "@/lib/axios";

type MemberLike = number | { id?: number | null } | null | undefined;

function extractMemberId(member: MemberLike): number | null {
  if (typeof member === "number") return member;
  if (member && typeof member.id === "number") return member.id;
  return null;
}

function isMemberInCrewGroup(
  crewGroup: Pick<CrewGroupDetail, "members"> | undefined,
  memberId: number | null
): boolean {
  if (memberId == null || !crewGroup) return false;
  return (crewGroup.members ?? []).some(
    (member) => extractMemberId(member as MemberLike) === memberId
  );
}

function isMemberAssignedAsDesigner(
  designers: Array<number | { id?: number | null }> | undefined,
  memberId: number | null
): boolean {
  if (memberId == null || !Array.isArray(designers)) return false;
  return designers.some((designer) => extractMemberId(designer) === memberId);
}

function isMemberAssignedViaIndividual(
  assignments: CrewAssignment[],
  memberId: number | null
): boolean {
  if (memberId == null) return false;
  return assignments.some(
    (assignment) =>
      assignment.assignment_type === "individual" &&
      assignment.member_id === memberId
  );
}

function isMemberAssignedViaGroupMembership(
  groupIds: number[],
  crewGroups: CrewGroupDetail[],
  memberId: number | null
): boolean {
  if (memberId == null || groupIds.length === 0) return false;
  return groupIds.some((groupId) => {
    const group = crewGroups.find((crewGroup) => crewGroup.id === groupId);
    return isMemberInCrewGroup(group, memberId);
  });
}

function matchesRemovedAssignmentForMember(params: {
  assignment: CrewAssignment;
  filteredMemberId: number | null;
  crewGroups: CrewGroupDetail[];
}): boolean {
  const { assignment, filteredMemberId, crewGroups } = params;
  if (filteredMemberId == null) return false;

  if (assignment.assignment_type === "individual") {
    return assignment.member_id === filteredMemberId;
  }

  if (assignment.assignment_type === "crew_group") {
    if (assignment.crew_group_id == null) return false;
    const removedGroup = crewGroups.find(
      (crewGroup) => crewGroup.id === assignment.crew_group_id
    );
    return isMemberInCrewGroup(removedGroup, filteredMemberId);
  }

  return false;
}

function resolveFilteredMemberId(
  assignedTo: string | null,
  currentMemberId: string | number | null | undefined
): number | null {
  if (assignedTo == null || assignedTo === "all") return null;
  if (assignedTo === "me") {
    if (typeof currentMemberId === "string") {
      const parsed = parseInt(currentMemberId, 10);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return typeof currentMemberId === "number" ? currentMemberId : null;
  }
  const parsed = Number(assignedTo);
  return Number.isNaN(parsed) ? null : parsed;
}

type EvaluateAfterRemovalParams = {
  removedAssignment: CrewAssignment;
  activeAssignmentsAfterRemoval: CrewAssignment[];
  crewGroups: CrewGroupDetail[];
  designers?: Array<number | { id?: number | null }>;
  filteredMemberId: number | null;
  canEvaluateGroupMembership: boolean;
};

export function useAssignmentMembershipHelper() {
  const evaluateAssignmentStateAfterRemoval = useCallback(
    ({
      removedAssignment,
      activeAssignmentsAfterRemoval,
      crewGroups,
      designers,
      filteredMemberId,
      canEvaluateGroupMembership,
    }: EvaluateAfterRemovalParams) => {
      const removedAssignmentMatchesFilter = matchesRemovedAssignmentForMember({
        assignment: removedAssignment,
        filteredMemberId,
        crewGroups,
      });

      const activeGroupIdsAfterRemoval = activeAssignmentsAfterRemoval
        .filter((assignment) => assignment.assignment_type === "crew_group")
        .map((assignment) => assignment.crew_group_id)
        .filter((groupId): groupId is number => groupId != null);

      const stillAssignedViaIndividual = isMemberAssignedViaIndividual(
        activeAssignmentsAfterRemoval,
        filteredMemberId
      );

      const stillAssignedViaGroupMembership =
        isMemberAssignedViaGroupMembership(
          activeGroupIdsAfterRemoval,
          crewGroups,
          filteredMemberId
        );

      const stillAssignedViaCrew =
        stillAssignedViaIndividual || stillAssignedViaGroupMembership;

      const stillAssignedAsDesigner = isMemberAssignedAsDesigner(
        designers,
        filteredMemberId
      );

      const shouldRedirect =
        removedAssignmentMatchesFilter &&
        canEvaluateGroupMembership &&
        !stillAssignedViaCrew &&
        !stillAssignedAsDesigner;

      return {
        removedAssignmentMatchesFilter,
        activeGroupIdsAfterRemoval,
        stillAssignedViaIndividual,
        stillAssignedViaGroupMembership,
        stillAssignedViaCrew,
        stillAssignedAsDesigner,
        shouldRedirect,
      };
    },
    []
  );

  const evaluateJobAssignmentState = useCallback(
    async ({
      orgId,
      jobId,
      memberId,
      designers,
    }: {
      orgId: string;
      jobId: number | string;
      memberId: number | null;
      designers?: Array<number | { id?: number | null }>;
    }) => {
      const stillAssignedAsDesigner = isMemberAssignedAsDesigner(
        designers,
        memberId
      );

      const teamListResponse = await axiosInstance.get(
        `ms/organizations/${orgId}/jobs/all/${jobId}/crew-assignments/job_team_list/`
      );
      const assignments = Array.isArray(teamListResponse.data?.assignments)
        ? (teamListResponse.data.assignments as CrewAssignment[])
        : [];
      const activeAssignments = assignments.filter(
        (a) => a?.is_active === true
      );

      const stillAssignedViaIndividual = isMemberAssignedViaIndividual(
        activeAssignments,
        memberId
      );

      const activeGroupIds = activeAssignments
        .filter((a) => a.assignment_type === "crew_group")
        .map((a) => a.crew_group_id)
        .filter((groupId): groupId is number => groupId != null);

      let stillAssignedViaGroupMembership = false;
      if (memberId != null && activeGroupIds.length > 0) {
        const crewGroupsResponse = await axiosInstance.get(
          `ms/organizations/${orgId}/crew-groups/`
        );
        const allCrewGroups = Array.isArray(crewGroupsResponse.data)
          ? (crewGroupsResponse.data as CrewGroupDetail[])
          : [];
        stillAssignedViaGroupMembership = isMemberAssignedViaGroupMembership(
          activeGroupIds,
          allCrewGroups,
          memberId
        );
      }

      return {
        stillAssignedAsDesigner,
        stillAssignedViaIndividual,
        stillAssignedViaGroupMembership,
      };
    },
    []
  );

  return {
    resolveFilteredMemberId,
    evaluateAssignmentStateAfterRemoval,
    evaluateJobAssignmentState,
  };
}
