"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const OrgTeamPageContent = createLazyRoutePage(
  () => import("@/features/team-management/ui/OrgTeamPageContent")
);

export default function OrgTeamPage() {
  return <OrgTeamPageContent />;
}
