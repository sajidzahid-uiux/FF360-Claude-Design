"use client";

import { useCallback } from "react";

import { Toggle } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { useSettings } from "@/hooks/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

export function EmailSummarySettings() {
  const { data: settings, isLoading, settingsPatchMutation } = useSettings();

  const monthlySummaryEnabled =
    settings?.monthly_summary_email_enabled ?? false;

  const handleToggle = useCallback(
    (checked: boolean) => {
      settingsPatchMutation.mutate(
        { newSettings: { monthly_summary_email_enabled: checked } },
        {
          onSuccess: () => {
            toast.success(
              checked ? "Summary emails enabled" : "Summary emails disabled"
            );
          },
          onError: () => {
            toast.error("Failed to update summary email setting");
          },
        }
      );
    },
    [settingsPatchMutation]
  );

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Email summary settings</CardTitle>
        <CardDescription>
          Configure organization-wide email summary notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start justify-between gap-4 pt-0 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-text-primary text-base font-medium">
            Enable summary emails
          </p>
          <p className="text-text-muted text-sm leading-relaxed">
            Admin-only email notifications for important updates and activities.
          </p>
        </div>
        <Toggle
          checked={monthlySummaryEnabled}
          className="shrink-0"
          disabled={isLoading || settingsPatchMutation.isPending}
          onChange={handleToggle}
        />
      </CardContent>
    </Card>
  );
}
