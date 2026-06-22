"use client";

import { useBatteryReplacement } from "@/features/equipment/hooks/useBatteryReplacement";
import type { BatteryReplacementProps } from "@/features/equipment/model/battery-replacement-ui";

import { BatteryReplacementFormCard } from "./sections/BatteryReplacementFormCard";
import { BatteryReplacementImageCard } from "./sections/BatteryReplacementImageCard";

export default function BatteryReplacement({
  equipmentId,
  disabled = false,
  onOpenMediaViewer,
}: BatteryReplacementProps) {
  const vm = useBatteryReplacement({ equipmentId, disabled });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <BatteryReplacementFormCard
        batteryTypeId={vm.batteryTypeId}
        createBatteryTypePending={vm.createBatteryTypePending}
        disabled={vm.disabled}
        isEditing={vm.isEditing}
        isSaving={vm.isSaving}
        lifetime={vm.lifetime}
        newTypeName={vm.newTypeName}
        nextReplacementDate={vm.nextReplacementDate}
        replacementDate={vm.replacementDate}
        typeOptions={vm.typeOptions}
        warranty={vm.warranty}
        onAddBatteryType={vm.addBatteryType}
        onBatteryTypeChange={vm.setBatteryTypeId}
        onCancel={() => vm.setIsEditing(false)}
        onEdit={() => vm.setIsEditing(true)}
        onLifetimeChange={vm.setLifetime}
        onNewTypeNameChange={vm.setNewTypeName}
        onReplacementDateChange={vm.setReplacementDate}
        onSave={vm.handleSave}
        onWarrantyChange={vm.setWarranty}
      />
      <BatteryReplacementImageCard
        disabled={vm.disabled}
        existingUrl={
          vm.existing?.battery_image_url || vm.existing?.battery_image
        }
        imagePreview={vm.batteryImagePreview}
        inputRef={vm.batteryInputRef}
        isEditing={vm.isEditing}
        kind="battery"
        title="Battery Image"
        onOpenMediaViewer={onOpenMediaViewer}
        onQuickUpload={vm.quickUpload}
        onSetImage={vm.setBatteryImage}
      />
      <BatteryReplacementImageCard
        disabled={vm.disabled}
        existingUrl={
          vm.existing?.battery_warranty_image_url ||
          vm.existing?.battery_warranty_image
        }
        imagePreview={vm.warrantyImagePreview}
        inputRef={vm.warrantyInputRef}
        isEditing={vm.isEditing}
        kind="warranty"
        title="Battery Warranty Image"
        onOpenMediaViewer={onOpenMediaViewer}
        onQuickUpload={vm.quickUpload}
        onSetImage={vm.setWarrantyImage}
      />
    </div>
  );
}
