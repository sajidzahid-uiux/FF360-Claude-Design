"use client";

import type { Job, Lead, LeadStatus } from "@/api/types";
import {
  type VehicleDetailRecord,
  VehicleDetailView,
} from "@/features/equipment";
import ShowMoreMachineCard, {
  type MachineDetailRecord,
} from "@/features/equipment/ui/machine/ShowMoreMachineCard";
import ShowMoreTrailerCard, {
  type TrailerDetailRecord,
} from "@/features/equipment/ui/trailer/ShowMoreTrailerCard";
import ShowMoreCardExcavationJob from "@/features/job-lead/ui/show-more/JobExcavationShowMoreCardWrapper";
import ShowMoreCardRepairJob from "@/features/job-lead/ui/show-more/JobRepairShowMoreCardWrapper";
import ShowMoreCardTilingJob from "@/features/job-lead/ui/show-more/JobTilingShowMoreCardWrapper";
import ShowMoreCardExcavationLead from "@/features/job-lead/ui/show-more/LeadExcavationShowMoreCardWrapper";
import ShowMoreCardRepairLead from "@/features/job-lead/ui/show-more/LeadRepairShowMoreCardWrapper";
import ShowMoreCardTilingLead from "@/features/job-lead/ui/show-more/LeadTilingShowMoreCardWrapper";
import type { TrashItem } from "@/features/org-trash/lib/columns";

interface OrgTrashDetailCardProps {
  item: TrashItem;
  leadStatuses: LeadStatus[];
  trashWrite: boolean;
  trashDelete: boolean;
  onClose: () => void;
  onDelete: (item: TrashItem) => void;
  onRestore: (item: TrashItem) => void;
}

export function OrgTrashDetailCard({
  item,
  leadStatuses,
  trashWrite,
  trashDelete,
  onClose,
  onDelete,
  onRestore,
}: OrgTrashDetailCardProps) {
  if ("lead_object_subclass" in item) {
    if (item.lead_object_subclass === "RepairLead") {
      return (
        <ShowMoreCardRepairLead
          isTrashed
          hasDeletePermission={trashDelete}
          hasRestorePermission={trashWrite}
          leadData={item as unknown as Lead}
          leadStatuses={leadStatuses}
          toggleArchive={false}
          onClose={onClose}
          onDelete={() => onDelete(item)}
          onRestore={() => onRestore(item)}
        />
      );
    }
    if (item.lead_object_subclass === "ExcavationLead") {
      return (
        <ShowMoreCardExcavationLead
          isTrashed
          hasDeletePermission={trashDelete}
          hasRestorePermission={trashWrite}
          isLoadingComments={false}
          isLoadingFiles={false}
          leadData={item as unknown as Lead}
          leadStatuses={leadStatuses}
          leadTypes={[]}
          toggleArchive={false}
          onClose={onClose}
          onDelete={() => onDelete(item)}
          onRestore={() => onRestore(item)}
        />
      );
    }
    if (item.lead_object_subclass === "Drainage_TilingLead") {
      return (
        <ShowMoreCardTilingLead
          isTrashed
          hasDeletePermission={trashDelete}
          hasRestorePermission={trashWrite}
          isLoadingComments={false}
          isLoadingFiles={false}
          leadData={item as unknown as Lead}
          leadStatuses={leadStatuses}
          leadTypes={[]}
          toggleArchive={false}
          onClose={onClose}
          onDelete={() => onDelete(item)}
          onRestore={() => onRestore(item)}
        />
      );
    }
    return null;
  }

  if (item.equipment_type) {
    if (item.equipment_type === "machines") {
      return (
        <ShowMoreMachineCard
          isTrashed
          equipment={item as unknown as MachineDetailRecord}
          hasDeletePermission={trashDelete}
          hasRestorePermission={trashWrite}
          onClose={onClose}
          onDelete={() => onDelete(item)}
          onRestore={() => onRestore(item)}
        />
      );
    }
    if (item.equipment_type === "vehicles") {
      return (
        <VehicleDetailView
          isTrashed
          equipment={item as unknown as VehicleDetailRecord}
          hasDeletePermission={trashDelete}
          hasRestorePermission={trashWrite}
          onBack={onClose}
          onDelete={() => onDelete(item)}
          onRestore={() => onRestore(item)}
        />
      );
    }
    if (item.equipment_type === "trailers") {
      return (
        <ShowMoreTrailerCard
          isTrashed
          equipment={item as unknown as TrailerDetailRecord}
          hasDeletePermission={trashDelete}
          hasRestorePermission={trashWrite}
          onClose={onClose}
          onDelete={() => onDelete(item)}
          onRestore={() => onRestore(item)}
        />
      );
    }
    return null;
  }

  if ("job_object_subclass" in item) {
    switch (item.job_object_subclass) {
      case "RepairJob":
        return (
          <ShowMoreCardRepairJob
            isTrashed
            cancelled={false}
            completedJob={false}
            hasDeletePermission={trashDelete}
            hasRestorePermission={trashWrite}
            job={item as unknown as Job}
            toggleArchive={false}
            onArchive={() => {}}
            onClose={onClose}
            onDelete={() => onDelete(item)}
            onRestore={() => onRestore(item)}
          />
        );
      case "ExcavationJob":
        return (
          <ShowMoreCardExcavationJob
            isTrashed
            cancelled={false}
            completedJob={false}
            hasDeletePermission={trashDelete}
            hasRestorePermission={trashWrite}
            job={item as unknown as Job}
            toggleArchive={false}
            onArchiveJob={() => {}}
            onClose={onClose}
            onDelete={() => onDelete(item)}
            onRestore={() => onRestore(item)}
          />
        );
      case "Drainage_TilingJob":
        return (
          <ShowMoreCardTilingJob
            isTrashed
            cancelled={false}
            completedJob={false}
            hasDeletePermission={trashDelete}
            hasRestorePermission={trashWrite}
            job={item as unknown as Job}
            toggleArchive={false}
            onArchiveJob={() => {}}
            onClose={onClose}
            onDeleteJob={() => onDelete(item)}
            onRestore={() => onRestore(item)}
          />
        );
      default:
        return null;
    }
  }

  return null;
}
