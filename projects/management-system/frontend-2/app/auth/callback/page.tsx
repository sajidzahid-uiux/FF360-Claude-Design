"use client";

import { Suspense } from "react";

import { Loader } from "@fieldflow360/org-ui";

import { AuthCallbackContent } from "@/features/auth";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Loader text="Completing sign-in..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
