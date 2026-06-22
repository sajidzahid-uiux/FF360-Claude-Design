"use client";

import { useShowMoreTrailerCard } from "@/features/equipment/hooks/useShowMoreTrailerCard";
import type { ShowMoreTrailerCardProps } from "@/features/equipment/model/show-more-card";
import { EquipmentNotes, MediaViewer } from "@/features/equipment/ui";
import { DialogManager, NavBar } from "@/shared/ui/common";

import { ShowMoreTrailerTopBar } from "./sections/ShowMoreTrailerTopBar";
import { ShowMoreTrailerViewDetailsTab } from "./sections/ShowMoreTrailerViewDetailsTab";

export default function ShowMoreTrailerCard({
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
}: ShowMoreTrailerCardProps) {
  const vm = useShowMoreTrailerCard({
    equipment,
    onClose,
    isTrashed,
    canWrite,
    canRead,
  });

  return (
    <div className="bg-bg-app min-h-screen w-full p-4">
      <ShowMoreTrailerTopBar
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
          tabs={["View Details", "Notes & Comments"]}
        />
      </div>
      {vm.activeTab === "View Details" && (
        <ShowMoreTrailerViewDetailsTab vm={vm} />
      )}
      {vm.activeTab === "Notes & Comments" && (
        <div className="pb-8">
          <EquipmentNotes
            equipmentId={vm.trailerData.id || equipment.id}
            isTrashed={isTrashed}
          />
        </div>
      )}
      <MediaViewer
        open={vm.mediaViewer.open}
        title={vm.mediaViewer.title}
        type={vm.mediaViewer.type}
        url={vm.mediaViewer.url}
        onOpenChange={vm.handleMediaViewerOpenChange}
      />
      <DialogManager manager={vm.dialogManager} />
    </div>
  );
}
