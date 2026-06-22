"use client";

import { ReactNode } from "react";

import { useJobAssignedToFilterSync } from "@/features/jobs/hooks/useJobAssignedToFilter";

export function JobAssignedToFilterSync({ children }: { children: ReactNode }) {
  useJobAssignedToFilterSync();
  return <>{children}</>;
}
