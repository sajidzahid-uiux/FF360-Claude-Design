import type {
  AddMemberToGroupPayload,
  AddMemberToGroupResponse,
  AddMembersPayload,
  AssignCrewGroupPayload,
  AssignIndividualPayload,
  AvailableMembersResponse,
  CreateCrewGroupPayload,
  CrewAssignmentResponse,
  CrewDirectoryMember,
  CrewDirectoryResponse,
  CrewGroup,
  CrewGroupDetail,
  CrewGroupListItem,
  CrewGroupResponse,
  DeactivateAssignmentPayload,
  DeactivateMembersPayload,
  IndividualMember,
  JobTeamListResponse,
  ReactivateAssignmentPayload,
  ReactivateMembersPayload,
  UpdateCrewGroupPayload,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class CrewService {
  // ============================================
  // CREW GROUPS
  // ============================================

  static async getCrewGroups(
    organizationId: string
  ): Promise<CrewGroupDetail[]> {
    const endpoint = API_ENDPOINTS.organizations.crew.groups(organizationId);
    return apiClient.get<CrewGroupDetail[]>(endpoint);
  }

  static async getCrewGroupsList(
    organizationId: string
  ): Promise<CrewGroupListItem[]> {
    const endpoint =
      API_ENDPOINTS.organizations.crew.groupsList(organizationId);
    return apiClient.get<CrewGroupListItem[]>(endpoint);
  }

  static async getCrewGroup(
    organizationId: string,
    crewGroupId: number | string
  ): Promise<CrewGroupDetail> {
    const endpoint = API_ENDPOINTS.organizations.crew.groupDetail(
      organizationId,
      crewGroupId
    );
    return apiClient.get<CrewGroupDetail>(endpoint);
  }

  static async getActiveCrewGroups(
    organizationId: string
  ): Promise<CrewGroupDetail[]> {
    const endpoint = API_ENDPOINTS.organizations.crew.groups(organizationId);
    const queryString = apiClient.buildQueryString({ is_active: true });
    return apiClient.get<CrewGroupDetail[]>(`${endpoint}${queryString}`);
  }

  static async getAvailableMembers(
    organizationId: string,
    crewGroupId: number | string,
    search?: string
  ): Promise<AvailableMembersResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.groupAvailableMembers(
      organizationId,
      crewGroupId
    );
    const queryString = apiClient.buildQueryString({ search });
    return apiClient.get<AvailableMembersResponse>(`${endpoint}${queryString}`);
  }

  static async createCrewGroup(
    organizationId: string,
    data: CreateCrewGroupPayload
  ): Promise<CrewGroupDetail> {
    const endpoint = API_ENDPOINTS.organizations.crew.groups(organizationId);
    return apiClient.post<CrewGroupDetail>(endpoint, data);
  }

  static async updateCrewGroup(
    organizationId: string,
    crewGroupId: number | string,
    data: UpdateCrewGroupPayload
  ): Promise<CrewGroupDetail> {
    const endpoint = API_ENDPOINTS.organizations.crew.groupDetail(
      organizationId,
      crewGroupId
    );
    return apiClient.patch<CrewGroupDetail>(endpoint, data);
  }

  static async deactivateCrewGroup(
    organizationId: string,
    crewGroupId: number | string
  ): Promise<CrewGroupResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.groupDeactivate(
      organizationId,
      crewGroupId
    );
    return apiClient.post<CrewGroupResponse>(endpoint);
  }

  static async reactivateCrewGroup(
    organizationId: string,
    crewGroupId: number | string
  ): Promise<CrewGroupResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.groupReactivate(
      organizationId,
      crewGroupId
    );
    return apiClient.post<CrewGroupResponse>(endpoint);
  }

  static async addMembersToGroup(
    organizationId: string,
    crewGroupId: number | string,
    data: AddMembersPayload
  ): Promise<CrewGroupResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.groupAddMembers(
      organizationId,
      crewGroupId
    );
    return apiClient.post<CrewGroupResponse>(endpoint, data);
  }

  static async deactivateMembersFromGroup(
    organizationId: string,
    crewGroupId: number | string,
    data: DeactivateMembersPayload
  ): Promise<CrewGroupResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.groupDeactivateMembers(
      organizationId,
      crewGroupId
    );
    return apiClient.post<CrewGroupResponse>(endpoint, data);
  }

  static async reactivateMembersInGroup(
    organizationId: string,
    crewGroupId: number | string,
    data: ReactivateMembersPayload
  ): Promise<CrewGroupResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.groupReactivateMembers(
      organizationId,
      crewGroupId
    );
    return apiClient.post<CrewGroupResponse>(endpoint, data);
  }

  // ============================================
  // CREW DIRECTORY
  // ============================================

  static async getCrewDirectory(
    organizationId: string,
    search?: string,
    filter?: "assigned" | "unassigned"
  ): Promise<CrewDirectoryResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.directory(organizationId);
    const queryString = apiClient.buildQueryString({ search, filter });
    return apiClient.get<CrewDirectoryResponse>(`${endpoint}${queryString}`);
  }

  static async getCrewDirectoryMember(
    organizationId: string,
    memberId: number | string
  ): Promise<CrewDirectoryMember> {
    const endpoint = API_ENDPOINTS.organizations.crew.directoryMember(
      organizationId,
      memberId
    );
    return apiClient.get<CrewDirectoryMember>(endpoint);
  }

  static async addMemberToGroup(
    organizationId: string,
    memberId: number | string,
    data: AddMemberToGroupPayload
  ): Promise<AddMemberToGroupResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.directoryAddToGroup(
      organizationId,
      memberId
    );
    return apiClient.post<AddMemberToGroupResponse>(endpoint, data);
  }

  // ============================================
  // JOB CREW ASSIGNMENTS
  // ============================================

  static async getAvailableCrewGroupsForJob(
    organizationId: string,
    jobId: number | string
  ): Promise<CrewGroup[]> {
    const endpoint = API_ENDPOINTS.organizations.crew.jobAvailableCrewGroups(
      organizationId,
      jobId
    );
    return apiClient.get<CrewGroup[]>(endpoint);
  }

  static async getAvailableIndividualsForJob(
    organizationId: string,
    jobId: number | string
  ): Promise<IndividualMember[]> {
    const endpoint = API_ENDPOINTS.organizations.crew.jobAvailableIndividuals(
      organizationId,
      jobId
    );
    return apiClient.get<IndividualMember[]>(endpoint);
  }

  static async getJobTeamList(
    organizationId: string,
    jobId: number | string
  ): Promise<JobTeamListResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.jobTeamList(
      organizationId,
      jobId
    );
    return apiClient.get<JobTeamListResponse>(endpoint);
  }

  static async assignCrewGroupToJob(
    organizationId: string,
    jobId: number | string,
    data: AssignCrewGroupPayload
  ): Promise<CrewAssignmentResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.jobAssignCrewGroup(
      organizationId,
      jobId
    );
    return apiClient.post<CrewAssignmentResponse>(endpoint, data);
  }

  static async assignIndividualToJob(
    organizationId: string,
    jobId: number | string,
    data: AssignIndividualPayload
  ): Promise<CrewAssignmentResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.jobAssignIndividual(
      organizationId,
      jobId
    );
    return apiClient.post<CrewAssignmentResponse>(endpoint, data);
  }

  static async deactivateJobAssignment(
    organizationId: string,
    jobId: number | string,
    data: DeactivateAssignmentPayload
  ): Promise<CrewAssignmentResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.jobDeactivateAssignment(
      organizationId,
      jobId
    );
    return apiClient.post<CrewAssignmentResponse>(endpoint, data);
  }

  static async reactivateJobAssignment(
    organizationId: string,
    jobId: number | string,
    data: ReactivateAssignmentPayload
  ): Promise<CrewAssignmentResponse> {
    const endpoint = API_ENDPOINTS.organizations.crew.jobReactivateAssignment(
      organizationId,
      jobId
    );
    return apiClient.post<CrewAssignmentResponse>(endpoint, data);
  }
}
