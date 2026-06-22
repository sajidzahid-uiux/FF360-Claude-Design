"use client";

import { useShowMoreMachineCard } from "@/features/equipment/hooks/useShowMoreMachineCard";
import type { ShowMoreMachineCardProps } from "@/features/equipment/model/show-more-card";
import {
  BatteryReplacement,
  EquipmentNotes,
  MediaViewer,
} from "@/features/equipment/ui";
import { DialogManager, NavBar } from "@/shared/ui/common";

import { ShowMoreMachineFiltersTab } from "./sections/ShowMoreMachineFiltersTab";
import { ShowMoreMachineTopBar } from "./sections/ShowMoreMachineTopBar";
import { ShowMoreMachineViewDetailsTab } from "./sections/ShowMoreMachineViewDetailsTab";

export default function ShowMoreMachineCard({
  equipment,
  onClose,
  isTrashed = false,
  onRestore,
  onDelete,
  hasRestorePermission = true,
  hasDeletePermission = true,
  canDelete = true,
  canWrite = true,
  canRead = true,
}: ShowMoreMachineCardProps) {
  const vm = useShowMoreMachineCard({
    equipment,
    onClose,
    isTrashed,
    canWrite,
    canRead,
  });

  return (
    <div className="bg-bg-app min-h-screen w-full p-4">
      <ShowMoreMachineTopBar
        canDelete={canDelete}
        hasDeletePermission={hasDeletePermission}
        hasRestorePermission={hasRestorePermission}
        vm={vm}
        onDelete={onDelete}
        onRestore={onRestore}
      />
      <div className="mb-4 overflow-x-auto">
        <NavBar
          activeTab={vm.activeTab}
          className="min-w-max"
          setActiveTab={vm.setActiveTab}
          tabs={[
            "View Details",
            "Filters Maintenance",
            "Battery Replacement",
            "Notes & Comments",
          ]}
        />
      </div>
      {vm.activeTab === "View Details" && (
        <ShowMoreMachineViewDetailsTab vm={vm} />
      )}
      {vm.activeTab === "Filters Maintenance" && (
        <ShowMoreMachineFiltersTab vm={vm} />
      )}
      {vm.activeTab === "Notes & Comments" && (
        <div className="pb-8">
          <EquipmentNotes
            equipmentId={vm.machineData.id || equipment.id}
            isTrashed={isTrashed}
          />
        </div>
      )}
      {vm.activeTab === "Battery Replacement" && (
        <BatteryReplacement
          disabled={vm.isDisabled || !vm.effectiveCanWrite}
          equipmentId={vm.machineData.id || equipment.id}
          onOpenMediaViewer={({ url, title }) =>
            vm.setMediaViewer({ open: true, url, title })
          }
        />
      )}
      <MediaViewer
        open={vm.mediaViewer.open}
        title={vm.mediaViewer.title}
        type="image"
        url={vm.mediaViewer.url}
        onOpenChange={(open) =>
          vm.setMediaViewer((prev) => ({ ...prev, open }))
        }
      />
      <DialogManager manager={vm.dialogManager} />
    </div>
  );
}
