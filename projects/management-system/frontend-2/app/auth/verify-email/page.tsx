"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useInvitation } from "@/hooks";
import { AUTH_ROUTES } from "@/lib/auth-routes";

function VerifyEmailContent() {
  const { user } = useAuth0();
  const { logout } = useAuth();
  const router = useRouter();
  const { hasInvitation } = useInvitation();

  // If user is not authenticated, redirect to sign in
  useEffect(() => {
    if (!user) {
      router.push(AUTH_ROUTES.signIn);
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
  };

  return (
    <main className="bg-bg-app flex h-screen">
      <div className="flex w-full items-center justify-center px-6 py-24">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Verify your email</h1>
            <p className="text-text-muted">
              We&apos;ve sent a verification email to{" "}
              <span className="font-semibold">{user?.email}</span>. Please check
              your inbox and click the verification link to continue.
            </p>
            {hasInvitation && (
              <p className="text-text-muted mt-2 text-sm">
                After verifying your email, you&apos;ll be able to accept your
                organization invitation.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Button
              fullWidth
              aria-label="Sign out"
              title="Sign out"
              variant={ButtonVariantEnum.GHOST}
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
