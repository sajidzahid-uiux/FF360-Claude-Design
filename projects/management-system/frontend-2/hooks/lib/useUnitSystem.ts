"use client";

import { DISTANCE_UNITS, UnitSystem as UnitSystemEnum } from "@/constants";
import { useRouteIds } from "@/hooks/lib/useRouteIds";
import { useOrganizationById } from "@/hooks/org/useOrganizationData";

export type UnitSystem = UnitSystemEnum;
export function useUnitSystem(): UnitSystem {
  const { orgId } = useRouteIds();
  const { data: org } = useOrganizationById(orgId);
  return org?.unit_system === UnitSystemEnum.METRIC
    ? UnitSystemEnum.METRIC
    : UnitSystemEnum.IMPERIAL;
}

export function getDistanceLabel(unitSystem: UnitSystem): string {
  return DISTANCE_UNITS.SHORT[unitSystem];
}

export function getDistanceUnit(unitSystem: UnitSystem): string {
  return DISTANCE_UNITS.FULL[unitSystem];
}
