"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { useRouteIds, useTeamData } from "@/hooks";
import { orgPath } from "@/shared/config/routes";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { filterActiveTeamMembers } from "@/utils/team/assignmentOrder";

import { ADD_MAINTENANCE_MODAL_KEY } from "../hooks/useOpenAddMaintenanceDialog";

import { AddMaintenanceForm } from "./AddMaintenanceForm";

/**
 * Mounts the Add Maintenance form when an `add-maintenance` frame is present in
 * the URL modal stack. Reconstructs the form props (team options, navigation)
 * from hooks + the scalar params (`id`, `type`, `nav`) pushed by
 * `useOpenAddMaintenanceDialog`.
 */
export function AddMaintenanceModalMount() {
  const { stack, closeModalKey } = useModalStack();
  const { data: team } = useTeamData();
  const router = useRouter();
  const { orgId } = useRouteIds();

  const frame = stack.find((f) => f.key === ADD_MAINTENANCE_MODAL_KEY);

  const assignedToOptions = useMemo(
    () =>
      filterActiveTeamMembers(team).map((t) => ({
        value: t.id.toString(),
        label: t?.user?.username ?? "",
      })),
    [team]
  );

  const close = useCallback(
    () => closeModalKey(ADD_MAINTENANCE_MODAL_KEY),
    [closeModalKey]
  );

  const navigateOnSuccess = frame?.params.nav === "1";

  const handleSuccess = useCallback(() => {
    close();
    if (navigateOnSuccess && orgId) {
      router.push(orgPath(orgId, "/maintenance"));
    }
  }, [close, navigateOnSuccess, orgId, router]);

  if (!frame) {
    return null;
  }

  const equipmentType = frame.params.type ? frame.params.type : null;

  return (
    <AddMaintenanceForm
      assignedToOptions={assignedToOptions}
      equipmentIdParam={frame.params.id ?? null}
      equipmentType={equipmentType}
      onBack={close}
      onSuccess={navigateOnSuccess ? handleSuccess : undefined}
    />
  );
}
