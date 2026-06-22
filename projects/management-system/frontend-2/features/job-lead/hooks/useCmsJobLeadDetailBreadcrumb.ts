"use client";

import type { JobLeadEntityType } from "@/constants";
import { buildJobLeadDetailBreadcrumbPath } from "@/features/job-lead";
import { useRouteIds } from "@/hooks";
import { useCmsBreadcrumbLabel } from "@/shared/ui/layout/cmsBreadcrumbOverrides";

export function useCmsJobLeadDetailBreadcrumb(
  label: string | undefined,
  entity: JobLeadEntityType,
  detailSegment: string,
  recordId: string | number | undefined
) {
  const { orgId } = useRouteIds();

  const targetPath =
    orgId && recordId
      ? buildJobLeadDetailBreadcrumbPath(orgId, entity, detailSegment, recordId)
      : undefined;

  useCmsBreadcrumbLabel(label, targetPath ? { targetPath } : undefined);
}
