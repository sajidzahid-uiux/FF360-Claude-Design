"use client";

import { useParams } from "next/navigation";
import { use } from "react";

import { getCookie } from "@/lib/cookies";

export interface RouteParams {
  orgId?: string;
  id?: string;
  type?: string;
  entityType?: string;
  jobLeadType?: string;
}

export interface RouteIds {
  orgId: string | null;
  id?: string | null;
  type?: string | null;
  entityType?: string | null;
  jobLeadType?: string | null;
}

export function useRouteIds(
  params?: Promise<RouteParams> | RouteParams
): RouteIds {
  const clientParams = useParams();
  const resolvedParams = params
    ? params instanceof Promise
      ? use(params)
      : params
    : clientParams;

  const extractString = (
    value: string | string[] | undefined | null
  ): string | null => {
    if (!value) return null;
    return Array.isArray(value) ? value[0] : value;
  };

  // Fallback for routes that are not org-scoped (e.g. /user/*):
  // keep org context using the last selected org cookie.
  const orgId = extractString(resolvedParams?.orgId) ?? getCookie("lastOrgId");
  const id = extractString(resolvedParams?.id);
  const type = extractString(resolvedParams?.type);
  const entityType = extractString(resolvedParams?.entityType);
  const jobLeadType = extractString(resolvedParams?.jobLeadType);

  return {
    orgId,
    id,
    type,
    entityType,
    jobLeadType,
  };
}
