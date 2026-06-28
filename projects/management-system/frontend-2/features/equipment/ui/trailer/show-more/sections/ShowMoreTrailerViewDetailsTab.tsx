import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { Check, Edit2, Save, XCircle } from "lucide-react";
import { toast } from "sonner";

import { getEquipmentRecordId } from "@/features/equipment";
import type { useShowMoreTrailerCard } from "@/features/equipment/hooks/useShowMoreTrailerCard";
import type { TrailerDetailRecord } from "@/features/equipment/model/show-more-card";
import { DownloadMaintenanceLogButton } from "@/features/equipment/ui";
import {
  AddMaintenanceModalMount,
  useOpenAddMaintenanceDialog,
} from "@/features/maintenance";
import { Dropdown } from "@/shared/ui/common";
import { Card, Label, SanitizedInput } from "@/shared/ui/primitives";
import { getErrorMessage } from "@/utils/apiError";

type Vm = ReturnType<typeof useShowMoreTrailerCard>;

interface Props {
  vm: Vm;
}

export function ShowMoreTrailerViewDetailsTab({ vm }: Props) {
  const {
    trailerData,
    setTrailerData,
    trailerRecordId,
    editMode,
    setEditMode,
    editedFields,
    setEditedFields,
    isSaving,
    dialogManager,
    teamLoading,
    assigneeDropdownItems,
    effectiveCanRead,
    effectiveCanWrite,
    isDisabled,
    trailerImageRef,
    handleTrailerImageChange,
    insuranceImageRef,
    handleInsuranceImageChange,
    registrationImageRef,
    handleRegistrationImageChange,
    serialNumberImageRef,
    handleSerialNumberImageChange,
    images,
    isPdf,
    openMediaViewer,
    handleSaveTopInfo,
    statusText,
    statusColor,
    isLogReady,
    isDownloading,
    downloadMaintenanceLog,
    updateTrailer,
  } = vm;

  const openAddMaintenanceDialog = useOpenAddMaintenanceDialog(dialogManager);

  return (
    <>
    <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-6 lg:grid-cols-3">
      {/* Info Card (2/3 width) */}
      <Card className="flex flex-col p-4 sm:p-6 lg:col-span-2">
        <div className="mb-4 flex flex-row items-start justify-between">
          <div className="flex w-full flex-col gap-1">
            <span className="block w-full max-w-full text-2xl font-bold break-words whitespace-normal">
              {trailerData.machine_name || trailerData.name}
            </span>
            {trailerData.last_updated && (
              <div className="text-text-muted mt-1 text-xs">
                Last updated:{" "}
                {(() => {
                  try {
                    const date = new Date(trailerData.last_updated);
                    return isNaN(date.getTime())
                      ? trailerData.last_updated
                      : date.toLocaleDateString();
                  } catch {
                    return trailerData.last_updated;
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
        <div className="mb-4 sm:mb-6">
          <Label variant="detailBlock">Assigned Team Member</Label>
          <Dropdown
            disabled={isDisabled || teamLoading || !effectiveCanWrite}
            items={assigneeDropdownItems}
            mode="select"
            placeholder={teamLoading ? "Loading users..." : "Select User"}
            selectedValue={String(
              editedFields.assigned_team_member ??
                trailerData.assigned_team_member ??
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
                await updateTrailer.mutateAsync({
                  id: trailerRecordId,
                  data: {
                    assigned_team_member: newValue
                      ? Number(newValue)
                      : undefined,
                  },
                });
                setTrailerData((prev: TrailerDetailRecord) => ({
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

        {/* Trailer Specifications Section */}
        <div className="mb-4">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <h3 className="text-xl font-bold sm:text-2xl">
              Trailer Specifications
            </h3>
            {editMode ? (
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
                    serial_number: trailerData.serial_number || "",
                    license_plate: trailerData.license_plate || "",
                    year: trailerData.year?.toString() || "",
                    make: trailerData.make || "",
                    model: trailerData.model || "",
                    color: trailerData.color || "",
                    tracker_status: trailerData.tracker_status || "Y",
                  });
                  setEditMode(true);
                }}
              />
            ) : null}
          </div>

          {/* Specifications Fields - Full Width Rows */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Serial Number */}
            <div className="flex items-center gap-4">
              <Label variant="detailRow">Serial Number</Label>
              {editMode ? (
                <SanitizedInput
                  className="flex-1"
                  value={
                    editedFields.serial_number ??
                    trailerData.serial_number ??
                    ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 50) {
                      toast.error("Serial number cannot exceed 50 characters");
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
                  {trailerData.serial_number || "N/A"}
                </div>
              )}
            </div>

            {/* License Plate */}
            <div className="flex items-center gap-4">
              <Label variant="detailRow">License Plate</Label>
              {editMode ? (
                <SanitizedInput
                  className="flex-1"
                  value={
                    editedFields.license_plate ??
                    trailerData.license_plate ??
                    ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 40) {
                      toast.error("License plate cannot exceed 40 characters");
                      return;
                    }
                    setEditedFields((prev) => ({
                      ...prev,
                      license_plate: value,
                    }));
                  }}
                />
              ) : (
                <div className="flex-1 text-right text-base">
                  {trailerData.license_plate || "N/A"}
                </div>
              )}
            </div>

            {/* Tracker Status */}
            <div className="flex items-center gap-4">
              <Label variant="detailRow">Tracker Status</Label>
              {editMode ? (
                <div className="flex-1">
                  <Dropdown
                    items={[
                      { id: "Y", label: "Yes" },
                      { id: "N", label: "No" },
                    ]}
                    mode="select"
                    placeholder="Select Status"
                    selectedValue={
                      editedFields.tracker_status ??
                      trailerData.tracker_status ??
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
                  {trailerData.tracker_status === "Y"
                    ? "Yes"
                    : trailerData.tracker_status === "N"
                      ? "No"
                      : "N/A"}
                </div>
              )}
            </div>

            {/* Year */}
            <div className="flex items-center gap-4">
              <Label variant="detailRow">Year</Label>
              {editMode ? (
                <SanitizedInput
                  className="flex-1"
                  max={new Date().getFullYear() + 1}
                  min="1900"
                  type="number"
                  value={
                    editedFields.year ?? trailerData.year?.toString() ?? ""
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
                  {trailerData.year || "N/A"}
                </div>
              )}
            </div>

            {/* Make */}
            <div className="flex items-center gap-4">
              <Label variant="detailRow">
                Make <span className="text-red-500">*</span>
              </Label>
              {editMode ? (
                <SanitizedInput
                  required
                  className="flex-1"
                  maxLength={100}
                  value={editedFields.make ?? trailerData.make ?? ""}
                  onChange={(e) => {
                    setEditedFields((prev) => ({
                      ...prev,
                      make: e.target.value,
                    }));
                  }}
                />
              ) : (
                <div className="flex-1 text-right text-base">
                  {trailerData.make || "N/A"}
                </div>
              )}
            </div>

            {/* Model */}
            <div className="flex items-center gap-4">
              <Label variant="detailRow">Model</Label>
              {editMode ? (
                <SanitizedInput
                  className="flex-1"
                  maxLength={100}
                  value={editedFields.model ?? trailerData.model ?? ""}
                  onChange={(e) => {
                    setEditedFields((prev) => ({
                      ...prev,
                      model: e.target.value,
                    }));
                  }}
                />
              ) : (
                <div className="flex-1 text-right text-base">
                  {trailerData.model || "N/A"}
                </div>
              )}
            </div>

            {/* Color */}
            <div className="flex items-center gap-4">
              <Label variant="detailRow">Color</Label>
              {editMode ? (
                <SanitizedInput
                  className="flex-1"
                  maxLength={50}
                  value={editedFields.color ?? trailerData.color ?? ""}
                  onChange={(e) => {
                    setEditedFields((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }));
                  }}
                />
              ) : (
                <div className="flex-1 text-right text-base">
                  {trailerData.color || "N/A"}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {effectiveCanRead && (
            <Button
              aria-label="Add to Maintenance"
              className="w-full sm:w-auto"
              disabled={isDisabled}
              size={ComponentSizeEnum.SM}
              title="Add to Maintenance"
              variant={ButtonVariantEnum.SURFACE}
              onClick={() => {
                openAddMaintenanceDialog({
                  equipmentId: String(
                    getEquipmentRecordId({
                      id: trailerRecordId,
                      equipment_ptr_id: (
                        trailerData as {
                          equipment_ptr_id?: string | number;
                        }
                      ).equipment_ptr_id,
                    })
                  ),
                  equipmentType: "trailer",
                  navigateOnSuccess: true,
                });
              }}
            />
          )}

          <DownloadMaintenanceLogButton
            className="w-full sm:w-auto"
            isDownloading={isDownloading}
            isLogReady={isLogReady}
            onDownload={downloadMaintenanceLog}
          />
        </div>
      </Card>

      {/* Right Side Column - Images - Each in its own card */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-0 lg:grid-cols-1">
        {images.map((image, index) => (
          <Card key={index} className="flex flex-col items-center p-4 sm:p-6">
            <div className="mb-4 text-lg font-semibold">{image.label}</div>
            <div className="bg-bg-surface border-border-subtle relative flex h-48 w-full max-w-64 items-center justify-center rounded-xl border">
              {editMode ? (
                <label className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden">
                  {isPdf(image.data ?? null) ? (
                    <span className="text-text-muted absolute mb-2 flex flex-col items-center gap-2">
                      PDF uploaded
                    </span>
                  ) : image.src ? (
                    <img
                      alt={image.label}
                      className="absolute mb-2 max-h-full max-w-full object-contain"
                      src={image.src}
                    />
                  ) : (
                    <span className="text-text-muted mb-2">
                      No {image.label.toLowerCase()}
                    </span>
                  )}
                  <span className="absolute z-10 mb-2 rounded bg-black px-4 py-2 font-semibold text-white">
                    Upload Image
                  </span>
                  <SanitizedInput
                    ref={
                      index === 0
                        ? trailerImageRef
                        : index === 1
                          ? insuranceImageRef
                          : index === 2
                            ? registrationImageRef
                            : serialNumberImageRef
                    }
                    accept={index === 0 ? "image/*" : "image/*,.pdf"}
                    className="hidden"
                    type="file"
                    onChange={
                      index === 0
                        ? handleTrailerImageChange
                        : index === 1
                          ? handleInsuranceImageChange
                          : index === 2
                            ? handleRegistrationImageChange
                            : handleSerialNumberImageChange
                    }
                  />
                </label>
              ) : isPdf(image.data ?? null) ? (
                <button
                  className="focus:ring-accent flex flex-col items-center justify-center gap-2 focus:ring-2 focus:outline-none"
                  type="button"
                  onClick={() =>
                    openMediaViewer(
                      image.label,
                      image.data as File | string | null,
                      null
                    )
                  }
                >
                  <span className="text-text-muted">PDF uploaded</span>
                  <span className="text-accent hover:underline">
                    View in viewer
                  </span>
                </button>
              ) : image.src ? (
                <button
                  className="focus:ring-accent flex h-full w-full items-center justify-center focus:ring-2 focus:outline-none"
                  type="button"
                  onClick={() =>
                    openMediaViewer(
                      image.label,
                      image.data as File | string | null,
                      image.src
                    )
                  }
                >
                  <img
                    alt={image.label}
                    className="max-h-full max-w-full cursor-pointer object-contain"
                    src={image.src}
                  />
                </button>
              ) : (
                <span className="text-text-muted">
                  No {image.label.toLowerCase()}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
    <AddMaintenanceModalMount />
    </>
  );
}
