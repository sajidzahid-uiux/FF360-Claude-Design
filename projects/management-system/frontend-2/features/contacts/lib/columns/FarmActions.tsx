"use client";

import { memo, useMemo } from "react";

import { Briefcase, FileText } from "lucide-react";

import { type Farm, JobType } from "@/api/types";
import {
  PERMISSION_RESOURCES,
  useJobPermissions,
  usePermissionsFromStorage,
} from "@/hooks/permissions";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { Dropdown, type DropdownItem } from "@/shared/ui/common";
import { buildRowActions } from "@/utils/actions";

interface FarmActionsProps {
  farm: Farm;
  handleEditFarm: (farm: Farm) => void;
  handleDeleteFarm: (farm: Farm) => void;
  contactId: number;
}

const FarmActions = memo(function FarmActions({
  farm,
  handleEditFarm,
  handleDeleteFarm,
}: FarmActionsProps) {
  const { openModal } = useModalStack();
  const { permissionCodes: permsForFarm } = usePermissionsFromStorage(
    PERMISSION_RESOURCES.CONTACT_FARM_TAB
  );
  const { permissionCodes: permsForLeads } = usePermissionsFromStorage(
    PERMISSION_RESOURCES.LEADS_PAGE
  );
  const hasDeletePermission = permsForFarm.includes("delete");
  const hasEditPermission = permsForFarm.includes("write");
  const hasReadPermission = permsForFarm.includes("read");

  const canAddExcavationJob = useJobPermissions(JobType.EXCAVATION).canAdd;
  const canAddTilingJob = useJobPermissions(JobType.TILING).canAdd;
  const canAddRepairJob = useJobPermissions(JobType.REPAIR).canAdd;

  const canViewFarmActionsMemu =
    hasReadPermission || hasEditPermission || hasDeletePermission;
  const canWriteLeads = permsForLeads?.includes("write") ?? false;

  const showsActions = useMemo(
    () =>
      canViewFarmActionsMemu &&
      [
        hasEditPermission,
        hasDeletePermission,
        canWriteLeads,
        canAddExcavationJob,
        canAddRepairJob,
        canAddTilingJob,
      ].some(Boolean),
    [
      canViewFarmActionsMemu,
      hasEditPermission,
      hasDeletePermission,
      canWriteLeads,
      canAddExcavationJob,
      canAddRepairJob,
      canAddTilingJob,
    ]
  );

  const customActions = useMemo(() => {
    const actions: DropdownItem[] = [];

    // The Add Lead / Add Job modals have their own type picker, so open them
    // directly instead of nesting a Tiling/Repair/Excavation submenu here.
    if (canWriteLeads) {
      actions.push({
        id: "create-lead",
        label: "Create Lead",
        icon: <FileText className="h-4 w-4" />,
        onSelect: () => openModal("add-lead"),
      });
    }

    if (canAddExcavationJob || canAddRepairJob || canAddTilingJob) {
      actions.push({
        id: "create-job",
        label: "Create Job",
        icon: <Briefcase className="h-4 w-4" />,
        onSelect: () => openModal("add-job"),
      });
    }

    return actions;
  }, [
    canWriteLeads,
    canAddExcavationJob,
    canAddRepairJob,
    canAddTilingJob,
    openModal,
  ]);

  const items = useMemo(
    () =>
      buildRowActions({
        canView: false,
        canEdit: hasEditPermission,
        canDelete: hasDeletePermission,
        canArchive: false,
        canTrack: false,
        isArchived: false,
        onView: () => {},
        onEdit: () => handleEditFarm(farm),
        onDelete: () => handleDeleteFarm(farm),
        customActions,
      }),
    [
      hasEditPermission,
      hasDeletePermission,
      handleEditFarm,
      handleDeleteFarm,
      farm,
      customActions,
    ]
  );

  if (!showsActions) return null;

  return <Dropdown items={items} />;
});

FarmActions.displayName = "FarmActions";

export default FarmActions;
