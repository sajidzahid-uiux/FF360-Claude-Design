"use client";

import { useParams, usePathname } from "next/navigation";

import {
  buildEquipmentDetailBreadcrumbPath,
  getEquipmentTypeLabel,
} from "@/features/equipment";
import { useRouteIds } from "@/hooks";
import { orgPath } from "@/shared/config/routes";
import {
  useCmsBreadcrumbIntermediate,
  useCmsBreadcrumbLabel,
} from "@/shared/ui/layout/cmsBreadcrumbOverrides";

const EQUIPMENT_DETAIL_TYPE_SUFFIX = "/@type";

export function getEquipmentDetailTypeBreadcrumbKey(
  orgId: string | number,
  equipmentId: string | number
): string {
  return orgPath(
    orgId,
    `/equipment/${equipmentId}${EQUIPMENT_DETAIL_TYPE_SUFFIX}`
  );
}

export function useCmsEquipmentDetailBreadcrumb(
  equipmentName: string | undefined,
  equipmentTypeQuery: string | null | undefined
) {
  const pathname = usePathname();
  const params = useParams();
  const { orgId } = useRouteIds();
  const equipmentId = params.id as string | undefined;

  const nameTargetPath =
    orgId && equipmentId
      ? buildEquipmentDetailBreadcrumbPath(orgId, equipmentId)
      : pathname;

  useCmsBreadcrumbLabel(equipmentName, { targetPath: nameTargetPath });

  const typeKey =
    orgId && equipmentId
      ? getEquipmentDetailTypeBreadcrumbKey(orgId, equipmentId)
      : undefined;

  useCmsBreadcrumbIntermediate(
    typeKey,
    equipmentTypeQuery ? getEquipmentTypeLabel(equipmentTypeQuery) : undefined
  );
}
