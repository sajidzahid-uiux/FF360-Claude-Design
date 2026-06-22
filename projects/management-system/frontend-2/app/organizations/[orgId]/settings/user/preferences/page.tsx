"use client";

import {
  GeneralSettingsSection,
  NotificationPreferencesTable,
} from "@/features/notification";

export default function PreferencesPage() {
  return (
    <div className="flex w-full max-w-full min-w-0 flex-col gap-6">
      <GeneralSettingsSection />
      <NotificationPreferencesTable />
    </div>
  );
}
