export interface OrganizationSettings {
  near_maintenance_warning_threshold: number | null;
  not_completed_maintenance_warning_threshold: number | null;
  archiving_threshold: number | null;
  monthly_summary_email_enabled: boolean;
}

// Used for PATCH /ms/organizations/{orgId}/settings/
// Callers should send only the fields they intend to update.
export type PatchOrganizationSettingsPayload = Partial<OrganizationSettings>;

export interface PatchOrganizationSettingsArgs {
  newSettings: PatchOrganizationSettingsPayload;
}
