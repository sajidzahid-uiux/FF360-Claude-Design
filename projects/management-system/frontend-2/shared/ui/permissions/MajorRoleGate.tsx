"use client";

import type { ReactNode } from "react";

import { useMajorRoleAccess } from "@/hooks/permissions";

import { AccessDeniedView } from "./AccessDeniedView";

interface MajorRoleGateProps {
  children: ReactNode;
  message?: string;
}

export function MajorRoleGate({
  children,
  message = "You do not have permission to view this page.",
}: MajorRoleGateProps) {
  const hasMajorRoleAccess = useMajorRoleAccess();

  if (!hasMajorRoleAccess) {
    return <AccessDeniedView message={message} />;
  }

  return children;
}
