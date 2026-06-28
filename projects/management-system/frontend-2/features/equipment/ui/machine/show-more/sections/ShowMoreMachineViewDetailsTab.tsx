import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { Check, Edit2, Save, XCircle } from "lucide-react";
import { toast } from "sonner";

import { getEquipmentRecordId } from "@/features/equipment";
import type { useShowMoreMachineCard } from "@/features/equipment/hooks/useShowMoreMachineCard";
import type { MachineDetailRecord } from "@/features/equipment/model/show-more-card";
import { DownloadMaintenanceLogButton } from "@/features/equipment/ui";
import {
  AddMaintenanceModalMount,
  useOpenAddMaintenanceDialog,
} from "@/features/maintenance";
import { Dropdown } from "@/shared/ui/common";
import { Card, Label, SanitizedInput } from "@/shared/ui/primitives";
import { getErrorMessage } from "@/utils/apiError";

type Vm = ReturnType<typeof useShowMoreMachineCard>;

interface Props {
  vm: Vm;
}

export function ShowMoreMachineViewDetailsTab({ vm }: Props) {
  const {
    machineData,
    editMode,
    setEditMode,
    editedFields,
    setEditedFields,
    isSaving,
    dialogManager,
    machineRecordId,
    teamLoading,
    machineImageRef,
    handleMachineImageChange,
    serialNumberImageRef,
    handleSerialNumberImageChange,
    getImageUrl,
    serialNumberImageUrl,
    effectiveCanRead,
    effectiveCanWrite,
    isDisabled,
    assigneeDropdownItems,
    handleSaveTopInfo,
    statusText,
    statusColor,
    setMediaViewer,
    isLogReady,
    isDownloading,
    downloadMaintenanceLog,
    updateMachine,
    setMachineData,
  } = vm;

  const openAddMaintenanceDialog = useOpenAddMaintenanceDialog(dialogManager);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Info Card (2/3 width) */}
        <Card className="flex flex-col p-4 sm:p-6 lg:col-span-2">
          {/* Name Section */}
          <div className="mb-4 flex flex-row items-start justify-between">
            <div className="flex w-full flex-col gap-1">
              <span className="block w-full max-w-full text-2xl font-bold break-words whitespace-normal">
                {machineData.machine_name || machineData.name}
              </span>
              {machineData.last_updated && (
                <div className="text-text-muted mt-1 text-xs">
                  Last updated:{" "}
                  {(() => {
                    try {
                      const date = new Date(machineData.last_updated);
                      return isNaN(date.getTime())
                        ? machineData.last_updated
                        : date.toLocaleDateString();
                    } catch {
                      return machineData.last_updated;
                    }
                  })()}
                </div>
              )}
              <div className="mt-1 flex items-center gap-2">
                <Button
                  disabled
                  leftIcon={
                    statusText === "Available" ? (
                      <Check
                        aria-label={statusText}
                        className="h-5 w-5"
                        style={{ color: statusColor }}
                      />
                    ) : undefined
                  }
                  size={ComponentSizeEnum.SM}
                  style={{
                    borderColor: statusColor,
                    color: statusColor,
                    borderWidth: 2,
                    boxShadow: "none",
                  }}
                  title={statusText}
                  variant={ButtonVariantEnum.SURFACE}
                />
              </div>
            </div>
          </div>

          {/* Assigned Team Member - Always Editable, Full Width */}
          <div className="mb-6">
            <Label variant="detailBlock">Assigned Team Member</Label>
            <Dropdown
              disabled={teamLoading || isDisabled || !effectiveCanWrite}
              items={assigneeDropdownItems}
              mode="select"
              placeholder={teamLoading ? "Loading users..." : "Select User"}
              selectedValue={String(
                editedFields.assigned_team_member ??
                  machineData.assigned_team_member ??
                  "none"
              )}
              width="full"
              onValueChange={async (val) => {
                const newValue = val === "none" ? null : val;
                setEditedFields((prev) => ({
                  ...prev,
                  assigned_team_member: newValue,
                }));
                // Auto-save on change
                try {
                  await updateMachine.mutateAsync({
                    id: machineRecordId,
                    data: {
                      assigned_team_member: newValue
                        ? Number(newValue)
                        : undefined,
                    },
                  });
                  setMachineData((prev: MachineDetailRecord) => ({
                    ...prev,
                    assigned_team_member: newValue,
                  }));
                  toast.success("Team member updated successfully");
                } catch (error: unknown) {
                  toast.error(
                    getErrorMessage(error, "Failed to update team member")
                  );
                }
              }}
            />
          </div>

          {/* Machine Specifications Section */}
          <div className="mb-4">
            <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h3 className="text-xl font-bold sm:text-2xl">
                Machine Specifications
              </h3>
              {editMode && effectiveCanWrite ? (
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isSaving || isDisabled}
                    leftIcon={<Save className="h-4 w-4" />}
                    loading={isSaving}
                    size={ComponentSizeEnum.SM}
                    title={isSaving ? "Saving..." : "Save Changes"}
                    onClick={handleSaveTopInfo}
                  />
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isDisabled}
                    leftIcon={<XCircle className="h-4 w-4" />}
                    size={ComponentSizeEnum.SM}
                    title="Cancel"
                    variant={ButtonVariantEnum.SURFACE}
                    onClick={() => {
                      setEditMode(false);
                      setEditedFields({});
                    }}
                  />
                </div>
              ) : effectiveCanWrite ? (
                <Button
                  className="w-full sm:w-auto"
                  disabled={isDisabled}
                  leftIcon={<Edit2 className="h-4 w-4" />}
                  size={ComponentSizeEnum.SM}
                  title="Edit"
                  variant={ButtonVariantEnum.SURFACE}
                  onClick={() => {
                    setEditedFields({
                      serial_number: machineData.serial_number || "",
                      year: machineData.year?.toString() || "",
                      make: machineData.make || "",
                      model: machineData.model || "",
                      color: machineData.color || "",
                      tracker_status: machineData.tracker_status || "Y",
                    });
                    setEditMode(true);
                  }}
                />
              ) : null}
            </div>

            {/* Specifications Fields - Full Width Rows */}
            <div className="flex flex-col gap-4">
              {/* Serial Number */}
              <div className="flex items-center gap-4">
                <Label variant="detailRow">Serial Number</Label>
                {editMode && effectiveCanWrite ? (
                  <SanitizedInput
                    className="flex-1"
                    disabled={isDisabled}
                    value={
                      editedFields.serial_number ??
                      machineData.serial_number ??
                      ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length > 50) {
                        toast.error(
                          "Serial number cannot exceed 50 characters"
                        );
                        return;
                      }
                      setEditedFields((prev) => ({
                        ...prev,
                        serial_number: value,
                      }));
                    }}
                  />
                ) : (
                  <div className="flex-1 text-right text-base">
                    {machineData.serial_number || "N/A"}
                  </div>
                )}
              </div>

              {/* Tracker Status */}
              <div className="flex items-center gap-4">
                <Label variant="detailRow">Tracker Status</Label>
                {editMode && effectiveCanWrite ? (
                  <div className="flex-1">
                    <Dropdown
                      disabled={isDisabled}
                      items={[
                        { id: "Y", label: "Yes" },
                        { id: "N", label: "No" },
                      ]}
                      mode="select"
                      placeholder="Select Status"
                      selectedValue={
                        editedFields.tracker_status ??
                        machineData.tracker_status ??
                        "Y"
                      }
                      width="full"
                      onValueChange={(val) =>
                        setEditedFields((prev) => ({
                          ...prev,
                          tracker_status: val,
                        }))
                      }
                    />
                  </div>
                ) : (
                  <div className="flex-1 text-right text-base">
                    {machineData.tracker_status === "Y"
                      ? "Yes"
                      : machineData.tracker_status === "N"
                        ? "No"
                        : "N/A"}
                  </div>
                )}
              </div>

              {/* Year */}
              <div className="flex items-center gap-4">
                <Label variant="detailRow">Year</Label>
                {editMode && effectiveCanWrite ? (
                  <SanitizedInput
                    className="flex-1"
                    disabled={isDisabled}
                    max={new Date().getFullYear() + 1}
                    min="1900"
                    type="number"
                    value={
                      editedFields.year ?? machineData.year?.toString() ?? ""
                    }
                    onChange={(e) => {
                      setEditedFields((prev) => ({
                        ...prev,
                        year: e.target.value,
                      }));
                    }}
                  />
                ) : (
                  <div className="flex-1 text-right text-base">
                    {machineData.year || "N/A"}
                  </div>
                )}
              </div>

              {/* Make */}
              <div className="flex items-center gap-4">
                <Label variant="detailRow">
                  Make <span className="text-red-500">*</span>
                </Label>
                {editMode && effectiveCanWrite ? (
                  <SanitizedInput
                    required
                    className="flex-1"
                    disabled={isDisabled}
                    maxLength={100}
                    value={editedFields.make ?? machineData.make ?? ""}
                    onChange={(e) => {
                      setEditedFields((prev) => ({
                        ...prev,
                        make: e.target.value,
                      }));
                    }}
                  />
                ) : (
                  <div className="flex-1 text-right text-base">
                    {machineData.make || "N/A"}
                  </div>
                )}
              </div>

              {/* Model */}
              <div className="flex items-center gap-4">
                <Label variant="detailRow">Model</Label>
                {editMode && effectiveCanWrite ? (
                  <SanitizedInput
                    className="flex-1"
                    disabled={isDisabled}
                    maxLength={100}
                    value={editedFields.model ?? machineData.model ?? ""}
                    onChange={(e) => {
                      setEditedFields((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }));
                    }}
                  />
                ) : (
                  <div className="flex-1 text-right text-base">
                    {machineData.model || "N/A"}
                  </div>
                )}
              </div>

              {/* Color */}
              <div className="flex items-center gap-4">
                <Label variant="detailRow">Color</Label>
                {editMode && effectiveCanWrite ? (
                  <SanitizedInput
                    className="flex-1"
                    disabled={isDisabled}
                    maxLength={50}
                    value={editedFields.color ?? machineData.color ?? ""}
                    onChange={(e) => {
                      setEditedFields((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }));
                    }}
                  />
                ) : (
                  <div className="flex-1 text-right text-base">
                    {machineData.color || "N/A"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {effectiveCanRead && (
              <Button
                aria-label="Add to Maintenance"
                disabled={isDisabled}
                size={ComponentSizeEnum.SM}
                title="Add to Maintenance"
                variant={ButtonVariantEnum.SURFACE}
                onClick={() => {
                  openAddMaintenanceDialog({
                    equipmentId: String(
                      getEquipmentRecordId({
                        id: machineRecordId,
                        equipment_ptr_id: (
                          machineData as {
                            equipment_ptr_id?: string | number;
                          }
                        ).equipment_ptr_id,
                      })
                    ),
                    equipmentType: "machine",
                    navigateOnSuccess: true,
                  });
                }}
              />
            )}

            <DownloadMaintenanceLogButton
              isDownloading={isDownloading}
              isLogReady={isLogReady}
              onDownload={downloadMaintenanceLog}
            />
          </div>
        </Card>

        {/* Right Side Column - Metrics Card and Image Card */}
        <div className="mt-4 flex flex-col gap-4 sm:gap-6 lg:mt-0">
          {/* Machine Metrics Card */}
          <Card className="p-6">
            <h3 className="mb-4 text-2xl font-bold">Machine Metrics</h3>
            <div className="flex flex-col gap-4">
              {/* Current Hours */}
              <div className="flex items-center gap-4">
                <Label variant="detailRow">Current Hours</Label>
                {editMode && effectiveCanWrite ? (
                  <SanitizedInput
                    className="flex-1"
                    disabled={isDisabled}
                    type="number"
                    value={
                      editedFields.current_hours ??
                      machineData.current_hours?.toString() ??
                      ""
                    }
                    onChange={(e) => {
                      setEditedFields((prev) => ({
                        ...prev,
                        current_hours: e.target.value,
                      }));
                    }}
                  />
                ) : (
                  <div className="flex-1 text-right text-base">
                    {machineData.current_hours || "N/A"}
                  </div>
                )}
              </div>

              {/* Hourly Rate */}
              <div className="flex items-center gap-4">
                <Label variant="detailRow">Hourly Rate</Label>
                {editMode && effectiveCanWrite ? (
                  <SanitizedInput
                    className="flex-1"
                    disabled={isDisabled}
                    type="number"
                    value={
                      editedFields.hour_rate ?? machineData.hour_rate ?? ""
                    }
                    onChange={(e) => {
                      setEditedFields((prev) => ({
                        ...prev,
                        hour_rate: e.target.value,
                      }));
                    }}
                  />
                ) : (
                  <div className="flex-1 text-right text-base">
                    ${machineData.hour_rate || "N/A"}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Images - Each in its own card */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {/* Machine Image Card */}
            <Card className="flex flex-col items-center p-4 sm:p-6">
              <div className="mb-4 text-lg font-semibold">Machine Image</div>
              <div className="bg-bg-surface border-border-subtle relative flex h-48 w-full max-w-64 items-center justify-center rounded-xl border">
                {editMode && effectiveCanWrite ? (
                  <label className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden">
                    {getImageUrl(machineData.equipment_image ?? null) ? (
                      <img
                        alt="Machine"
                        className="absolute mb-2 max-h-full max-w-full object-contain"
                        src={
                          getImageUrl(machineData.equipment_image ?? null) || ""
                        }
                      />
                    ) : (
                      <span className="text-text-muted mb-2">
                        No machine image
                      </span>
                    )}
                    <span className="absolute z-10 mb-2 rounded bg-black px-4 py-2 font-semibold text-white">
                      Upload Image
                    </span>
                    <SanitizedInput
                      ref={machineImageRef}
                      accept="image/*"
                      className="hidden"
                      type="file"
                      onChange={handleMachineImageChange}
                    />
                  </label>
                ) : getImageUrl(machineData.equipment_image ?? null) ? (
                  <button
                    className="focus:ring-accent flex h-full w-full items-center justify-center focus:ring-2 focus:outline-none"
                    type="button"
                    onClick={() =>
                      setMediaViewer({
                        open: true,
                        url:
                          getImageUrl(machineData.equipment_image ?? null) ||
                          null,
                        title: "Machine Image",
                      })
                    }
                  >
                    <img
                      alt="Machine"
                      className="max-h-full max-w-full cursor-pointer object-contain"
                      src={
                        getImageUrl(machineData.equipment_image ?? null) || ""
                      }
                    />
                  </button>
                ) : (
                  <span className="text-text-muted">No machine image</span>
                )}
              </div>
            </Card>

            {/* Serial Number Image Card */}
            <Card className="flex flex-col items-center p-4 sm:p-6">
              <div className="mb-4 text-lg font-semibold">
                Serial Number Image
              </div>
              <div className="bg-bg-surface border-border-subtle relative flex h-48 w-full max-w-64 items-center justify-center rounded-xl border">
                {editMode && effectiveCanWrite ? (
                  <label className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden">
                    {serialNumberImageUrl ? (
                      <img
                        alt="Serial Number"
                        className="absolute mb-2 max-h-full max-w-full object-contain"
                        src={serialNumberImageUrl}
                      />
                    ) : null}
                    <span className="absolute z-10 mb-2 rounded bg-black px-4 py-2 font-semibold text-white">
                      Upload Image
                    </span>
                    <SanitizedInput
                      ref={serialNumberImageRef}
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                      type="file"
                      onChange={handleSerialNumberImageChange}
                    />
                  </label>
                ) : serialNumberImageUrl ? (
                  <button
                    className="focus:ring-accent flex h-full w-full items-center justify-center focus:ring-2 focus:outline-none"
                    type="button"
                    onClick={() =>
                      setMediaViewer({
                        open: true,
                        url: serialNumberImageUrl,
                        title: "Serial Number Image",
                      })
                    }
                  >
                    <img
                      alt="Serial Number"
                      className="max-h-full max-w-full cursor-pointer object-contain"
                      src={serialNumberImageUrl}
                    />
                  </button>
                ) : (
                  <span className="text-text-muted">
                    No serial number image
                  </span>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <AddMaintenanceModalMount />
    </>
  );
}
