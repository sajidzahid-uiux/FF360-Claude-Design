"use client";

import { Suspense } from "react";

import { Loader } from "@fieldflow360/org-ui";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const OrganizationsPageContent = createLazyRoutePage(
  () => import("@/features/organizations/ui/OrganizationsPageContent")
);

export default function OrganizationsPage() {
  return (
    <Suspense fallback={<Loader text="Loading organizations..." />}>
      <OrganizationsPageContent />
    </Suspense>
  );
}
