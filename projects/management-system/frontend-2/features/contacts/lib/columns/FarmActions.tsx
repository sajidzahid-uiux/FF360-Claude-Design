"use client";

import { memo, useCallback, useMemo } from "react";

import { Briefcase, FileText, Grid3X3, Shovel, Wrench } from "lucide-react";

import { type Farm, JobType, LeadType } from "@/api/types";
import { JobLeadTypeRouteSegment } from "@/constants";
import { useRouteIds } from "@/hooks";
import {
  PERMISSION_RESOURCES,
  useJobPermissions,
  usePermissionsFromStorage,
} from "@/hooks/permissions";
import { orgPath, orgUrl } from "@/shared/config/routes";
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
  contactId,
}: FarmActionsProps) {
  const { orgId } = useRouteIds();
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

  const handleCreateLead = useCallback(
    (leadType: LeadType) => {
      const params = new URLSearchParams({
        action: "add",
        contactId: contactId.toString(),
        farmId: farm.id.toString(),
      });
      if (leadType === LeadType.TILING) {
        window.open(
          orgPath(
            orgId,
            `/leads/${JobLeadTypeRouteSegment.DRAINAGE_TILING}?${params.toString()}`
          ),
          "_blank"
        );
      } else {
        window.open(
          `${orgUrl(orgId, `/leads/${leadType}`, `${params.toString()}`)}`,
          "_blank"
        );
      }
    },
    [contactId, farm.id, orgId]
  );

  const handleCreateJob = useCallback(
    (jobType: JobType) => {
      const params = new URLSearchParams({
        action: "add",
        contactId: contactId.toString(),
        farmId: farm.id.toString(),
      });
      if (jobType === JobType.TILING) {
        window.open(
          orgPath(
            orgId,
            `/jobs/${JobLeadTypeRouteSegment.DRAINAGE_TILING}?${params.toString()}`
          ),
          "_blank"
        );
      } else {
        window.open(
          `${orgUrl(orgId, `/jobs/${jobType}`, `${params.toString()}`)}`,
          "_blank"
        );
      }
    },
    [contactId, farm.id, orgId]
  );

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

    if (canWriteLeads) {
      actions.push({
        id: "create-lead",
        label: "Create Lead",
        icon: <FileText className="h-4 w-4" />,
        submenu: [
          {
            id: "lead-tiling",
            label: "Tiling",
            icon: <Grid3X3 className="h-4 w-4" />,
            onSelect: () => handleCreateLead(LeadType.TILING),
          },
          {
            id: "lead-repair",
            label: "Repair",
            icon: <Wrench className="h-4 w-4" />,
            onSelect: () => handleCreateLead(LeadType.REPAIR),
          },
          {
            id: "lead-excavation",
            label: "Excavation",
            icon: <Shovel className="h-4 w-4" />,
            onSelect: () => handleCreateLead(LeadType.EXCAVATION),
          },
        ],
        submenuSide: "left",
      });
    }

    if (canAddExcavationJob || canAddRepairJob || canAddTilingJob) {
      const jobSubmenu: DropdownItem[] = [];

      if (canAddTilingJob) {
        jobSubmenu.push({
          id: "job-tiling",
          label: "Tiling",
          icon: <Grid3X3 className="h-4 w-4" />,
          onSelect: () => handleCreateJob(JobType.TILING),
        });
      }

      if (canAddRepairJob) {
        jobSubmenu.push({
          id: "job-repair",
          label: "Repair",
          icon: <Wrench className="h-4 w-4" />,
          onSelect: () => handleCreateJob(JobType.REPAIR),
        });
      }

      if (canAddExcavationJob) {
        jobSubmenu.push({
          id: "job-excavation",
          label: "Excavation",
          icon: <Shovel className="h-4 w-4" />,
          onSelect: () => handleCreateJob(JobType.EXCAVATION),
        });
      }

      actions.push({
        id: "create-job",
        label: "Create Job",
        icon: <Briefcase className="h-4 w-4" />,
        submenu: jobSubmenu,
        submenuSide: "left",
      });
    }

    return actions;
  }, [
    canWriteLeads,
    canAddExcavationJob,
    canAddRepairJob,
    canAddTilingJob,
    handleCreateLead,
    handleCreateJob,
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
