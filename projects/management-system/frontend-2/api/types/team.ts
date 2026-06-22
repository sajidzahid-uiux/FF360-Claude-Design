import { UserRole } from "@/constants/enums";

import type { IdOf, UserInfo } from "./common";
import type { ProjectType } from "./projectTypes";
import type { Role } from "./roles";

// Re-export enum for convenience
export { UserRole };

// ============================================
// TEAM MEMBER
// ============================================

export interface TeamMember {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_image?: string | null;
    /** Present on some list/detail payloads (mirrors nested user serializer). */
    phone_number?: string | null;
  };
  role?: UserRole; // Legacy field - deprecated, use role_fk instead
  role_fk?: {
    id: number;
    name: string;
    organization: number;
    is_default: boolean;
    is_admin: boolean;
    members_count: number;
    created_at: string;
    updated_at: string;
  };
  is_active: boolean;
  is_removed?: boolean;
  owner?: boolean;
  /** Suggested when assigning designers on leads/jobs */
  is_designer?: boolean;
  /** Suggested when assigning operators on excavation leads/jobs */
  is_operator?: boolean;
  phone_number?: string;
  avatar?: string;
  created_at: string;
  last_updated: string;
}

export interface MemberUpdatePayload {
  role?: UserRole; // Legacy - deprecated, use role_id instead
  role_id?: number | string; // New RBAC system - required for update_member_role endpoint
  is_active?: boolean;
  phone_number?: string;
  is_designer?: boolean;
  is_operator?: boolean;
}

export interface MemberRoleUpdateArgs {
  memberId: IdOf<TeamMember>;
  roleId?: IdOf<Role>;
  is_designer?: boolean;
  is_operator?: boolean;
}

// ============================================
// INVITATION
// ============================================

export interface InvitationPayload {
  email: string;
  role_id: number; // Required: ID of Role (RBAC) to assign when invitation is accepted
  message?: string;
}

export interface InvitationResponse {
  success: boolean;
  message: string;
}

// ============================================
// ONLINE MEMBERS
// ============================================

export interface OnlineMember {
  id: number;
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  last_seen: string;
  is_online: boolean;
}

// ============================================
// CREW MEMBER
// ============================================

export interface CrewMember {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  role?: string;
  is_active: boolean;
  avatar?: string;
  created_at: string;
  last_updated: string;
}

export interface CrewCreatePayload {
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  role?: string;
  is_active?: boolean;
}

export type CrewUpdatePayload = Partial<CrewCreatePayload>;

// ============================================
// CREW GROUP
// ============================================

export interface CrewGroup {
  id: number;
  name: string;
  description?: string;
  members: number[];
  leader?: number;
  color?: string;
  is_default?: boolean;
  is_active?: boolean;
  member_count?: number;
  created_at: string;
  last_updated?: string;
  updated_at?: string;
  project_types?: ProjectType[];
}

export interface CrewGroupCreatePayload {
  name: string;
  description?: string;
  members?: number[];
  leader?: number;
  color?: string;
  project_type_ids?: number[];
}

export type CrewGroupUpdatePayload = Partial<
  Omit<CrewGroupCreatePayload, "name"> & { name?: string }
>;

// Backward compatibility aliases
export type CreateCrewGroupPayload = CrewGroupCreatePayload;
export type UpdateCrewGroupPayload = CrewGroupUpdatePayload;

// ============================================
// INDIVIDUAL MEMBER (for crew assignments)
// ============================================

export interface IndividualMember {
  id: number;
  name: string;
  email: string;
  role: string;
  role_display: string;
}

// ============================================
// CREW GROUP DETAIL
// ============================================

export interface CrewGroupMember {
  id: number;
  user: UserInfo;
  role: string;
  role_display: string;
  is_active: boolean;
  added_at: string;
}

export interface CrewGroupDetail extends Omit<CrewGroup, "members"> {
  members: CrewGroupMember[];
  members_detail?: CrewGroupMember[];
}

/** Lightweight crew group row from `crew-groups-list/` (Installed Footage filter). */
export interface CrewGroupListItem {
  id: number;
  name: string;
  is_default?: boolean;
  is_active?: boolean;
}

export interface CrewGroupResponse {
  message: string;
  data: CrewGroupDetail;
}

// ============================================
// CREW ASSIGNMENT
// ============================================

export interface CrewAssignment {
  id: number;
  assignment_type: "crew_group" | "individual";
  crew_group_id: number | null;
  crew_group_name: string | null;
  member_id: number | null;
  member_name: string | null;
  member_email: string | null;
  member_role: string | null;
  member_role_display: string | null;
  is_active: boolean;
  assigned_at: string;
  deactivated_at: string | null;
  assigned_by_username: string;
  deactivated_by_username: string | null;
  status_display: string;
}

export interface JobTeamListResponse {
  assignments: CrewAssignment[];
  total_crew_groups: number;
  total_individuals: number;
  active_crew_groups: number;
  active_individuals: number;
}

export interface AssignCrewGroupPayload {
  crew_group_id: number;
}

export interface AssignIndividualPayload {
  member_id: number;
}

export interface DeactivateAssignmentPayload {
  assignment_id: number;
  assignment_type: "crew_group" | "individual";
}

export interface ReactivateAssignmentPayload {
  assignment_id: number;
  assignment_type: "crew_group" | "individual";
}

export interface CrewAssignmentResponse {
  message: string;
  assignment: CrewAssignment;
}

// ============================================
// CREW DIRECTORY
// ============================================

export interface CrewDirectoryGroup {
  id: number;
  name: string;
  is_default: boolean;
  added_at: string;
}

export interface CrewDirectoryMember {
  id: number;
  name: string;
  role: string;
  role_display: string;
  email: string;
  assignment_status: "assigned" | "unassigned";
  groups: CrewDirectoryGroup[];
  group_count: number;
}

export interface CrewDirectoryStats {
  total_crew: number;
  total_groups: number;
  assigned_count: number;
  unassigned_count: number;
}

export interface CrewDirectoryResponse {
  stats: CrewDirectoryStats;
  members: CrewDirectoryMember[];
}

export interface AddMemberToGroupPayload {
  group_id: number;
}

export interface MemberIdGroupUpdateArgs {
  memberId: IdOf<TeamMember>;
  data: AddMemberToGroupPayload;
}

export interface AddMemberToGroupResponse {
  message: string;
  member_id: number;
  group_id: number;
  group_name: string;
}

// ============================================
// AVAILABLE MEMBERS
// ============================================

export interface AvailableMember {
  id: number;
  user: UserInfo;
  role: string;
  role_display: string;
}

export interface AvailableMembersResponse {
  data: AvailableMember[];
  message: string;
}

// ============================================
// GROUP MEMBERSHIP
// ============================================

export interface AddMembersPayload {
  members: number[];
}

export interface DeactivateMembersPayload {
  members: number[];
}

export interface ReactivateMembersPayload {
  members: number[];
}
