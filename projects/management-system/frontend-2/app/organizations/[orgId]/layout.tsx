"use client";

import { ReactNode, useEffect } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { JobAssignedToFilterSync } from "@/features/jobs/ui/JobAssignedToFilterSync";
import { useRouteIds } from "@/hooks";

interface OrgLayoutProps {
  children: ReactNode;
}
export default function OrgLayout({ children }: OrgLayoutProps) {
  const { syncOrgFromUrl } = useAuth();
  const { orgId } = useRouteIds();

  useEffect(() => {
    if (orgId) {
      syncOrgFromUrl(orgId);
    }
  }, [orgId, syncOrgFromUrl]);

  return <JobAssignedToFilterSync>{children}</JobAssignedToFilterSync>;
}
