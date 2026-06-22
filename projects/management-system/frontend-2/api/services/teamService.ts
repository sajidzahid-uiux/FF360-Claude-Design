import type {
  CrewCreatePayload,
  CrewGroup,
  CrewGroupCreatePayload,
  CrewMember,
  InvitationPayload,
  MemberUpdatePayload,
  OnlineMember,
  TeamMember,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class TeamService {
  // ============================================
  // TEAM MEMBERS
  // ============================================

  static async getMembers(organizationId: string): Promise<TeamMember[]> {
    const endpoint = API_ENDPOINTS.organizations.team.members(organizationId);
    return apiClient.get<TeamMember[]>(endpoint);
  }

  static async getMember(
    organizationId: string,
    memberId: number | string
  ): Promise<TeamMember> {
    const endpoint = API_ENDPOINTS.organizations.team.memberDetail(
      organizationId,
      memberId
    );
    return apiClient.get<TeamMember>(endpoint);
  }

  static async updateMember(
    organizationId: string,
    memberId: number | string,
    data: MemberUpdatePayload
  ): Promise<TeamMember> {
    const endpoint = API_ENDPOINTS.organizations.team.memberDetail(
      organizationId,
      memberId
    );
    return apiClient.patch<TeamMember>(endpoint, data);
  }

  static async removeMember(
    organizationId: string,
    memberId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.team.memberDetail(
      organizationId,
      memberId
    );
    return apiClient.delete<void>(endpoint);
  }

  static async sendInvitation(
    organizationId: string,
    data: InvitationPayload
  ): Promise<{ success: boolean; message: string }> {
    const endpoint =
      API_ENDPOINTS.organizations.team.sendInvitation(organizationId);
    return apiClient.post(endpoint, data);
  }

  static async getOnlineMembers(
    organizationId: string
  ): Promise<OnlineMember[]> {
    const endpoint =
      API_ENDPOINTS.organizations.team.onlineMembers(organizationId);
    return apiClient.get<OnlineMember[]>(endpoint);
  }

  // ============================================
  // CREW
  // ============================================

  static async getCrew(organizationId: string): Promise<CrewMember[]> {
    const endpoint = API_ENDPOINTS.organizations.crew.list(organizationId);
    return apiClient.get<CrewMember[]>(endpoint);
  }

  static async getCrewMember(
    organizationId: string,
    crewId: number | string
  ): Promise<CrewMember> {
    const endpoint = API_ENDPOINTS.organizations.crew.detail(
      organizationId,
      crewId
    );
    return apiClient.get<CrewMember>(endpoint);
  }

  static async createCrewMember(
    organizationId: string,
    data: CrewCreatePayload
  ): Promise<CrewMember> {
    const endpoint = API_ENDPOINTS.organizations.crew.create(organizationId);
    return apiClient.post<CrewMember>(endpoint, data);
  }

  static async updateCrewMember(
    organizationId: string,
    crewId: number | string,
    data: Partial<CrewCreatePayload>
  ): Promise<CrewMember> {
    const endpoint = API_ENDPOINTS.organizations.crew.detail(
      organizationId,
      crewId
    );
    return apiClient.patch<CrewMember>(endpoint, data);
  }

  static async deleteCrewMember(
    organizationId: string,
    crewId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.crew.detail(
      organizationId,
      crewId
    );
    return apiClient.delete<void>(endpoint);
  }

  // ============================================
  // CREW GROUPS
  // ============================================

  static async getCrewGroups(organizationId: string): Promise<CrewGroup[]> {
    const endpoint = API_ENDPOINTS.organizations.crew.groups(organizationId);
    return apiClient.get<CrewGroup[]>(endpoint);
  }

  static async getCrewGroup(
    organizationId: string,
    groupId: number | string
  ): Promise<CrewGroup> {
    const endpoint = API_ENDPOINTS.organizations.crew.groupDetail(
      organizationId,
      groupId
    );
    return apiClient.get<CrewGroup>(endpoint);
  }

  static async createCrewGroup(
    organizationId: string,
    data: CrewGroupCreatePayload
  ): Promise<CrewGroup> {
    const endpoint = API_ENDPOINTS.organizations.crew.groups(organizationId);
    return apiClient.post<CrewGroup>(endpoint, data);
  }

  static async updateCrewGroup(
    organizationId: string,
    groupId: number | string,
    data: Partial<CrewGroupCreatePayload>
  ): Promise<CrewGroup> {
    const endpoint = API_ENDPOINTS.organizations.crew.groupDetail(
      organizationId,
      groupId
    );
    return apiClient.patch<CrewGroup>(endpoint, data);
  }

  static async deleteCrewGroup(
    organizationId: string,
    groupId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.crew.groupDetail(
      organizationId,
      groupId
    );
    return apiClient.delete<void>(endpoint);
  }
}
