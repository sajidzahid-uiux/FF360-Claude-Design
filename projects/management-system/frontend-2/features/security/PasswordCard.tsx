"use client";

import { Button } from "@fieldflow360/org-ui";

import { useChangePasswordMutation } from "@/hooks";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

interface PasswordCardProps {
  isSocial?: boolean;
}

export function PasswordCard({ isSocial = false }: PasswordCardProps) {
  const requestPasswordChange = useChangePasswordMutation();

  const handleRequestPasswordChange = () => {
    requestPasswordChange.mutate();
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Password</CardTitle>
        <CardDescription>
          {isSocial
            ? "Password changes are managed by your social login provider."
            : "Change your account password using a secure email verification link."}
        </CardDescription>
        {!isSocial ? (
          <CardAction className="max-sm:col-span-2 max-sm:row-start-3 max-sm:w-full max-sm:justify-self-stretch sm:justify-self-end">
            <Button
              disabled={requestPasswordChange.isPending}
              loading={requestPasswordChange.isPending}
              title={
                requestPasswordChange.isPending
                  ? "Sending..."
                  : "Change password"
              }
              onClick={handleRequestPasswordChange}
            />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {isSocial ? (
          <p className="text-text-muted text-sm leading-relaxed">
            You can&apos;t change your password here. Use your social provider
            to update your credentials.
          </p>
        ) : (
          <>
            <p className="text-text-secondary text-sm leading-relaxed">
              Click &quot;Change password&quot; to receive an email with a
              secure link. You can set a new password after verifying your
              identity. The link expires in 10 minutes.
            </p>
            <p className="text-text-muted text-sm leading-relaxed">
              We recommend changing your password every 90 days for security.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
