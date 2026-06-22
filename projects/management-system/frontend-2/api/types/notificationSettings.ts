/**
 * Important notification setting (per user).
 * GET /notification-settings/important/ returns an array of these.
 */
export interface ImportantNotificationSetting {
  event_key: string;
  title: string;
  description: string;
  category: string;
  sub_category: string;
  is_enabled: boolean;
}

/**
 * Body for PATCH /notification-settings/important/ (single event toggle).
 */
export interface PatchImportantNotificationPayload {
  event_key: string;
  is_enabled: boolean;
}

/**
 * FYI notification setting (per organization).
 * GET /notification-settings/fyi/ returns an array of these.
 * assigned_users[].id is the team member id (org membership id), not the auth user id.
 */
export interface FyiAssignedUser {
  id: number;
  name: string;
  role: string;
}

export interface FyiNotificationSetting {
  event_key: string;
  title: string;
  description: string;
  category: string;
  sub_category: string;
  assigned_users: FyiAssignedUser[];
}

/**
 * Body for PATCH /notification-settings/fyi/ (set assigned users for one event).
 * assigned_user_ids are team member ids (org membership ids), not auth user ids.
 */
export interface PatchFyiNotificationPayload {
  event_key: string;
  assigned_user_ids: number[];
}
