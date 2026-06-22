"use client";

import { Toggle } from "@fieldflow360/org-ui";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

export function TwoFactorCard() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Two-factor authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-text-primary text-base font-medium">
            Two-factor authentication is{" "}
            <span className="text-text-secondary font-normal">disabled</span>
          </p>
          <p className="text-text-muted text-sm leading-relaxed">
            Enable 2FA to require a second verification step when signing in.
          </p>
        </div>
        <Toggle
          disabled
          aria-label="Enable two-factor authentication"
          checked={false}
          className="shrink-0"
          onChange={() => undefined}
        />
      </CardContent>
    </Card>
  );
}
