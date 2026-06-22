"use client";

import { Toggle } from "@fieldflow360/org-ui";

import useUserData from "@/hooks/useUserData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

export function GeneralSettingsSection() {
  const { data: user, isLoading, updateUser } = useUserData();
  const suppressPushWhenWebActive =
    user?.suppress_push_when_web_active ?? false;

  const handleToggle = (checked: boolean) => {
    updateUser.mutate({
      updatedUser: { suppress_push_when_web_active: checked },
    });
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">General settings</CardTitle>
        <CardDescription>
          Control how notifications behave across devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start justify-between gap-4 pt-0 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-text-primary text-base font-medium">
            Don&apos;t send mobile notifications when I&apos;m active on browser
          </p>
          <p className="text-text-muted text-sm leading-relaxed">
            Active is defined as having any app windows or browser tabs with
            cursor activity in the last 5 minutes.
          </p>
        </div>
        <Toggle
          aria-label="Don't send mobile notifications when I'm active on browser"
          checked={suppressPushWhenWebActive}
          className="mt-0.5 shrink-0"
          disabled={isLoading || updateUser.isPending}
          onChange={handleToggle}
        />
      </CardContent>
    </Card>
  );
}
