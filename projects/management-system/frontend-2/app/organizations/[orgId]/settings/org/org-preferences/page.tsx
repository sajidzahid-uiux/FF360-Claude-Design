"use client";

import {
  EmailSummarySettings,
  FYINotificationsTable,
} from "@/features/org-preferences";
import { useIsAdmin } from "@/hooks/queries";

export default function OrgPreferencesPage() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return (
      <p className="text-text-muted py-12 text-center">
        You need admin permissions to access this page.
      </p>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <EmailSummarySettings />
      <FYINotificationsTable />
    </div>
  );
}
