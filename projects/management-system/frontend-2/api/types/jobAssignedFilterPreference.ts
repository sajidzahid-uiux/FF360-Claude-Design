export interface JobListAssignedFilterMember {
  id: number;
  name: string;
}

export interface JobListAssignedFilterPreferenceResponse {
  has_saved_preference: boolean;
  assigned_to: string;
  filter_member_id: number | null;
  filter_member: JobListAssignedFilterMember | null;
}
