"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { toast } from "sonner";

import { useRouteIds } from "@/hooks";
import axiosInstance from "@/lib/axios";
import { orgPath } from "@/shared/config/routes";

export interface DesignNavigationTarget {
  href?: string | null;
  designId?: number | null;
  /** Stable id for loading UI (e.g. API map key `job_123` or stringified `designId`). */
  navigationKey?: string | null;
}

export function useDesignsTableNavigation() {
  const router = useRouter();
  const { orgId } = useRouteIds();
  const [navigatingKey, setNavigatingKey] = useState<string | null>(null);

  const pushWithOrg = useCallback(
    (href: string) => {
      const normalizedHref =
        orgId && href.startsWith("/") && !href.startsWith(orgPath(orgId, `/`))
          ? `/organizations/${orgId}${href}`
          : href;
      router.push(normalizedHref);
    },
    [orgId, router]
  );

  const resolveDesignDestination = useCallback(
    async (designId: number): Promise<string | null> => {
      if (!orgId) return null;
      const leadEndpoint = `ms/organizations/${orgId}/leads/drainage_tiling/${designId}/`;
      const jobEndpoint = `ms/organizations/${orgId}/jobs/drainage_tiling/${designId}/`;

      const [leadResult, jobResult] = await Promise.allSettled([
        axiosInstance.get(leadEndpoint),
        axiosInstance.get(jobEndpoint),
      ]);

      if (leadResult.status === "fulfilled") {
        return orgPath(orgId, `/leads/drainage-tiling/${designId}`);
      }
      if (jobResult.status === "fulfilled") {
        return orgPath(orgId, `/jobs/drainage-tiling/${designId}`);
      }
      return null;
    },
    [orgId]
  );

  const handleNavigate = useCallback(
    async (target: DesignNavigationTarget) => {
      const rowKey =
        target.navigationKey ??
        (target.designId != null
          ? String(target.designId)
          : (target.href ?? null));

      if (target.href) {
        if (rowKey) setNavigatingKey(rowKey);
        try {
          pushWithOrg(target.href);
        } catch {
          toast.error("Unable to open this record.");
          setNavigatingKey(null);
          return;
        }
        if (rowKey) {
          window.setTimeout(() => setNavigatingKey(null), 500);
        }
        return;
      }

      if (target.designId == null) return;

      try {
        if (rowKey) setNavigatingKey(rowKey);
        const destination = await resolveDesignDestination(target.designId);
        if (!destination) {
          toast.error("Unable to open this record.");
          return;
        }
        router.push(destination);
      } catch {
        toast.error("Unable to open this record.");
      } finally {
        setNavigatingKey(null);
      }
    },
    [pushWithOrg, resolveDesignDestination, router]
  );

  return {
    navigatingKey,
    handleNavigate,
  };
}
