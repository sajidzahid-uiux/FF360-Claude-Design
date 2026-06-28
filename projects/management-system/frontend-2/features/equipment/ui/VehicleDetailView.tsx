import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { SearchableDropdownOption } from "@fieldflow360/org-ui";
import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type {
  MaintenanceAttribute,
  VehicleUpdatePayload,
  VehicleV2,
} from "@/api/types";
import { getEquipmentRecordId } from "@/features/equipment";
import {
  type EquipmentDetailImageSlotConfig,
  type VehicleDetailRecord,
  type VehicleEditableFields,
  type VehicleSpecificationFieldKey,
  createVehicleEditDraft,
  resolveVehicleSpecificationValues,
} from "@/features/equipment";
import { useEquipmentMaintenanceLogDownload } from "@/features/equipment/hooks/useEquipmentMaintenanceLogDownload";
import {
  AddMaintenanceFilterDropdown,
  BatteryReplacement,
  MediaViewer,
  type MediaViewerProps,
} from "@/features/equipment/ui";
import {
  EquipmentDetailLayout,
  EquipmentMaintenanceFilterCard,
  VEHICLE_DETAIL_TABS,
  type VehicleDetailTabId,
  VehicleDetailsPanel,
} from "@/features/equipment/ui/equipment-detail";
import {
  AddMaintenanceModalMount,
  useOpenAddMaintenanceDialog,
} from "@/features/maintenance";
import { useAssigneeDropdownItems } from "@/features/team/hooks";
import {
  useDialogManager,
  useEquipmentComments,
  useFileUpload,
  useRouteIds,
  useTeamData,
  useUnitSystem,
} from "@/hooks";
import { useTrashVehicle, useUpdateVehicle } from "@/hooks/mutations";
import { orgPath } from "@/shared/config/routes";
import { parseEntityId } from "@/shared/lib/parseEntityId";
import { useModalStack } from "@/shared/model/use-modal-stack";
import {
  DetailFormSection,
  DialogManager,
  Notes,
  ShowMoreExtraActionsDropdown,
} from "@/shared/ui/common";
import type { DropdownItem } from "@/shared/ui/common";
import { getErrorMessage } from "@/utils/apiError";

import { AddMaintenanceFilterModal } from "./AddMaintenanceFilterModal";

function isSelectableAssigneeItem(item: DropdownItem): item is {
  id: string;
  label: ReactNode;
  disabled?: boolean;
} {
  return item.type !== "separator" && item.type !== "header";
}

const ALL_AVAILABLE_FILTERS = [
  { title: "Fuel Filter", name: "fuel_filter" },
  { title: "Air Filter", name: "air_filter" },
  { title: "Oil & Filter", name: "oil_filter" },
  { title: "Hydraulic Filter", name: "hydraulic_filter" },
] as const;

type VehicleMaintenanceUpdate = VehicleUpdatePayload & {
  maintenance_attributes?: MaintenanceAttribute[];
};

export interface VehicleDetailViewProps {
  equipment: VehicleDetailRecord;
  onBack: () => void;
  isTrashed?: boolean;
  onRestore?: () => void;
  onDelete?: () => void;
  hasRestorePermission?: boolean;
  hasDeletePermission?: boolean;
  canDelete?: boolean;
  canWrite?: boolean;
  canRead?: boolean;
}

const IMAGE_ACCEPTS = [
  "image/*",
  "image/*",
  "image/*",
  "image/jpeg,image/png,image/jpg",
] as const;

export function VehicleDetailView({
  equipment,
  onBack,
  isTrashed = false,
  onRestore,
  onDelete,
  hasRestorePermission = true,
  hasDeletePermission = true,
  canDelete = true,
  canWrite = true,
  canRead = true,
}: VehicleDetailViewProps) {
  const router = useRouter();
  const canEditEquipment = canWrite;
  const unitSystem = useUnitSystem();
  const isMetric = unitSystem === "metric";

  // Computed disabled state - when trashed, everything should be disabled
  const isDisabled = isTrashed || !canRead;

  const updateVehicle = useUpdateVehicle();
  const trashVehicle = useTrashVehicle();
  const [vehicleData, setVehicleData] =
    useState<VehicleDetailRecord>(equipment);
  const [editMode, setEditMode] = useState(false);
  const [editedFields, setEditedFields] = useState<VehicleEditableFields>({});
  const [isSaving, setIsSaving] = useState(false);
  const dialogManager = useDialogManager();
  const openAddMaintenanceDialog = useOpenAddMaintenanceDialog(dialogManager);

  const { stack, openModal, closeModalKey } = useModalStack();
  const isAddFilterModalOpen = stack.some(
    (f) => f.key === "add-equipment-filter"
  );
  const [selectedNewFilter, setSelectedNewFilter] = useState<
    { title: string; name: string } | undefined
  >(undefined);
  const [addFilterError, setAddFilterError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<VehicleDetailTabId>("details");
  const [mediaViewer, setMediaViewer] = useState<
    Omit<MediaViewerProps, "onOpenChange" | "type">
  >({ open: false, url: null, title: "" });

  const { data: teamMembers, isLoading: teamLoading } = useTeamData();
  const {
    data: comments,
    postComment,
    patchComment,
    deleteComment,
  } = useEquipmentComments(equipment.id);

  const [editingFilter, setEditingFilter] = useState<string | null>(null);
  const [editingFilterValues, setEditingFilterValues] = useState<{
    last_changed: string;
    threshold: string;
    filter_number: string;
  }>({ last_changed: "", threshold: "", filter_number: "" });

  const { orgId: organizationId } = useRouteIds();
  const navigateToEquipmentLogs = useCallback(() => {
    if (!organizationId) return;
    const equipmentId =
      (vehicleData as { equipment_ptr_id?: string }).equipment_ptr_id ||
      vehicleData.id;
    const equipmentName =
      vehicleData.machine_name ||
      vehicleData.name ||
      `Equipment #${equipmentId}`;
    router.push(
      orgPath(
        organizationId,
        `/equipment/${equipmentId}/logs?equipment_type=${encodeURIComponent(
          "vehicle"
        )}&name=${encodeURIComponent(equipmentName)}`
      )
    );
  }, [organizationId, router, vehicleData]);

  const {
    file: vehicleImage,
    error: vehicleImageError,
    fileInputRef: vehicleImageRef,
    handleFileChange: handleVehicleImageChange,
    resetFile: resetVehicleImage,
  } = useFileUpload({
    onFileSelect: (file) => {
      if (file) {
        setVehicleData((v) => ({
          ...v,
          equipment_image: file,
        }));
      }
    },
  });

  const {
    file: registrationImage,
    error: registrationImageError,
    fileInputRef: registrationImageRef,
    handleFileChange: handleRegistrationImageChange,
    resetFile: resetRegistrationImage,
  } = useFileUpload({
    onFileSelect: (file) => {
      if (file) {
        setVehicleData((v) => ({
          ...v,
          registration_image: file,
        }));
      }
    },
  });

  const {
    file: insuranceImage,
    error: insuranceImageError,
    fileInputRef: insuranceImageRef,
    handleFileChange: handleInsuranceImageChange,
    resetFile: resetInsuranceImage,
  } = useFileUpload({
    onFileSelect: (file) => {
      if (file) {
        setVehicleData((v) => ({
          ...v,
          insurance_image: file,
        }));
      }
    },
  });

  const {
    file: serialNumberImage,
    error: serialNumberImageError,
    fileInputRef: serialNumberImageRef,
    handleFileChange: handleSerialNumberImageChange,
    resetFile: resetSerialNumberImage,
  } = useFileUpload({
    onFileSelect: (file) => {
      if (file) {
        setVehicleData((prev) => ({
          ...prev,
          serial_number_image: file,
        }));
      }
    },
  });

  useEffect(() => {
    if (vehicleImageError) {
      toast.error(vehicleImageError);
    }
    if (registrationImageError) {
      toast.error(registrationImageError);
    }
    if (insuranceImageError) {
      toast.error(insuranceImageError);
    }
    if (serialNumberImageError) {
      toast.error(serialNumberImageError);
    }
  }, [
    vehicleImageError,
    registrationImageError,
    insuranceImageError,
    serialNumberImageError,
  ]);

  // Helper function to get image URL
  const getImageUrl = useCallback((image: File | string | null | undefined) => {
    if (!image) return null;
    if (typeof image === "string") return image;
    if (image instanceof File) return URL.createObjectURL(image);
    return null;
  }, []);

  const images = useMemo(
    () => [
      {
        label: "Vehicle Image",
        src: getImageUrl(vehicleData.equipment_image),
      },
      {
        label: "Registration Image",
        src: getImageUrl(vehicleData.registration_image),
      },
      {
        label: "Insurance Image",
        src: getImageUrl(vehicleData.insurance_image),
      },
      {
        label: "Serial Number Image",
        src: getImageUrl(vehicleData.serial_number_image),
      },
    ],
    [
      vehicleData.equipment_image,
      vehicleData.registration_image,
      vehicleData.insurance_image,
      vehicleData.serial_number_image,
      getImageUrl,
    ]
  );

  useEffect(() => {
    setVehicleData(equipment);
  }, [equipment]);

  // Cleanup object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      // Cleanup any object URLs to prevent memory leaks
      if (vehicleData.equipment_image instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(vehicleData.equipment_image));
      }
      if (vehicleData.registration_image instanceof File) {
        URL.revokeObjectURL(
          URL.createObjectURL(vehicleData.registration_image)
        );
      }
      if (vehicleData.insurance_image instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(vehicleData.insurance_image));
      }
      if (vehicleData.serial_number_image instanceof File) {
        URL.revokeObjectURL(
          URL.createObjectURL(vehicleData.serial_number_image)
        );
      }
    };
  }, [
    vehicleData.equipment_image,
    vehicleData.registration_image,
    vehicleData.insurance_image,
    vehicleData.serial_number_image,
  ]);

  const availableFiltersToAdd = useMemo(() => {
    const currentFilterNames =
      vehicleData.maintenance_attributes?.map((attr) => attr.title) || [];
    return ALL_AVAILABLE_FILTERS.filter(
      (f) => !currentFilterNames.includes(f.name)
    );
  }, [vehicleData.maintenance_attributes]);

  const assigneeDropdownItems = useAssigneeDropdownItems(
    teamMembers,
    editedFields.assigned_team_member ?? vehicleData.assigned_team_member
  );

  const assigneeSearchableOptions = useMemo(
    (): SearchableDropdownOption<string>[] =>
      assigneeDropdownItems
        .filter(isSelectableAssigneeItem)
        .filter((item) => !item.disabled)
        .map((item) => ({
          value: item.id,
          label: String(item.label),
        })),
    [assigneeDropdownItems]
  );

  const assignedMemberValue = String(
    editedFields.assigned_team_member ??
      vehicleData.assigned_team_member ??
      "none"
  );

  const handleSaveTopInfo = async () => {
    // Validation - same restrictions as add form
    // Make is required
    const makeValue = editedFields.make ?? vehicleData.make ?? "";
    if (!makeValue.trim()) {
      toast.error("Make is required");
      return;
    }
    // Make max length 100
    if (makeValue.trim().length > 100) {
      toast.error("Make cannot exceed 100 characters");
      return;
    }
    // Model max length 100
    const modelValue = editedFields.model ?? vehicleData.model ?? "";
    if (modelValue && modelValue.trim().length > 100) {
      toast.error("Model cannot exceed 100 characters");
      return;
    }
    // Color max length 50
    const colorValue = editedFields.color ?? vehicleData.color ?? "";
    if (colorValue && colorValue.trim().length > 50) {
      toast.error("Color cannot exceed 50 characters");
      return;
    }
    // Year validation: min 1900, max current year + 1
    const yearValue = editedFields.year ?? vehicleData.year;
    if (yearValue !== undefined && yearValue !== null && yearValue !== "") {
      const yearNum = Number(yearValue);
      if (isNaN(yearNum) || yearNum < 1900) {
        toast.error("Year must be at least 1900");
        return;
      }
      const maxYear = new Date().getFullYear() + 1;
      if (yearNum > maxYear) {
        toast.error(`Year cannot exceed ${maxYear}`);
        return;
      }
    }
    // VIN number max length 40
    if (editedFields.serial_number && editedFields.serial_number.length > 40) {
      toast.error("VIN number cannot exceed 40 characters");
      return;
    }
    // License plate max length 40
    if (editedFields.license_plate && editedFields.license_plate.length > 40) {
      toast.error("License plate cannot exceed 40 characters");
      return;
    }
    setIsSaving(true);

    const patchPayload = {
      ...editedFields,
    } as unknown as VehicleUpdatePayload;
    const assignedTeamMember = editedFields.assigned_team_member;
    if (assignedTeamMember && assignedTeamMember !== "none") {
      patchPayload.assigned_team_member = Number(assignedTeamMember);
    }
    if (editedFields.current_miles !== undefined) {
      patchPayload.current_miles = Number(editedFields.current_miles);
    }
    // Trim string fields
    if (patchPayload.make !== undefined) {
      patchPayload.make = patchPayload.make.trim();
    }
    if (patchPayload.model !== undefined) {
      patchPayload.model = patchPayload.model.trim() || undefined;
    }
    if (patchPayload.color !== undefined) {
      patchPayload.color = patchPayload.color.trim() || undefined;
    }
    // Convert year to number if provided
    if (yearValue !== undefined && yearValue !== null && yearValue !== "") {
      patchPayload.year = Number(yearValue);
    } else {
      patchPayload.year = undefined;
    }
    try {
      // Update using V2 API
      const updatedVehicle = await updateVehicle.mutateAsync({
        id: parseEntityId(vehicleData.id),
        data: patchPayload,
      });

      // Prepare FormData for images
      const formData = new FormData();
      if (vehicleImage) {
        formData.append("equipment_image", vehicleImage);
      }
      if (registrationImage) {
        formData.append("registration_image", registrationImage);
      }
      if (insuranceImage) {
        formData.append("insurance_image", insuranceImage);
      }
      if (serialNumberImage) {
        formData.append("serial_number_image", serialNumberImage);
      }

      // Only send image update if there are images to upload
      let updatedImages: Partial<VehicleV2> = {};
      if (
        formData.has("equipment_image") ||
        formData.has("registration_image") ||
        formData.has("insurance_image") ||
        formData.has("serial_number_image")
      ) {
        updatedImages = await updateVehicle.mutateAsync({
          id: parseEntityId(vehicleData.id),
          data: formData as unknown as VehicleUpdatePayload,
        });
      }

      setVehicleData((prev: VehicleDetailRecord) => ({
        ...prev,
        ...updatedVehicle,
        ...updatedImages,
        id: String(updatedVehicle.id || prev.id),
        assigned_team_member: updatedVehicle.assigned_team_member
          ? String(updatedVehicle.assigned_team_member)
          : null,
        license_plate: updatedVehicle.license_plate ?? undefined,
      }));
      setEditMode(false);
      setEditedFields({});
      resetVehicleImage();
      resetRegistrationImage();
      resetInsuranceImage();
      resetSerialNumberImage();
      toast.success("Vehicle updated successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save changes"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFilterSubmit = async (data: {
    lastChanged: string;
    threshold: string;
    filterNumber: string;
  }) => {
    if (!selectedNewFilter) {
      setAddFilterError("Please select a filter type.");
      return;
    }
    setAddFilterError(null);
    const newFilterData = {
      title: selectedNewFilter.name,
      last_changed: parseInt(data.lastChanged, 10),
      threshold: parseInt(data.threshold, 10),
      filter_number: data.filterNumber === "" ? undefined : data.filterNumber,
      automatic: true,
    };
    const currentAttributes = vehicleData.maintenance_attributes || [];
    const updatedAttributes = [...currentAttributes, newFilterData];
    try {
      await updateVehicle.mutateAsync({
        id: parseEntityId(vehicleData.id),
        data: {
          maintenance_attributes: updatedAttributes,
        } as VehicleMaintenanceUpdate,
      });
      setVehicleData((prev: VehicleDetailRecord) => ({
        ...prev,
        maintenance_attributes: updatedAttributes,
      }));
      closeModalKey("add-equipment-filter");
      setSelectedNewFilter(undefined);
      toast.success(`${selectedNewFilter.title} filter added successfully`);
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Failed to add filter");
      setAddFilterError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Handler to start editing a filter
  const handleStartEditFilter = (filter: MaintenanceAttribute) => {
    setEditingFilter(filter.title);
    setEditingFilterValues({
      last_changed:
        filter.last_changed !== undefined ? String(filter.last_changed) : "",
      threshold: filter.threshold !== undefined ? String(filter.threshold) : "",
      filter_number:
        filter.filter_number !== undefined && filter.filter_number !== null
          ? String(filter.filter_number)
          : "",
    });
  };

  // Handler to cancel editing
  const handleCancelEditFilter = () => {
    setEditingFilter(null);
    setEditingFilterValues({
      last_changed: "",
      threshold: "",
      filter_number: "",
    });
  };

  // Handler to save filter changes
  const handleSaveEditFilter = async () => {
    if (!editingFilter) return;
    const hasLastChanged = editingFilterValues.last_changed.trim() !== "";
    const hasThreshold = editingFilterValues.threshold.trim() !== "";
    if (hasLastChanged !== hasThreshold) {
      setAddFilterError(
        "Last changed and threshold must both be filled or both be left empty."
      );
      return;
    }
    setAddFilterError(null);
    const currentAttributes = vehicleData.maintenance_attributes || [];
    const updatedAttributes = currentAttributes.map((attr) =>
      attr.title === editingFilter
        ? {
            ...attr,
            last_changed:
              editingFilterValues.last_changed === ""
                ? undefined
                : Number(editingFilterValues.last_changed),
            threshold:
              editingFilterValues.threshold === ""
                ? undefined
                : Number(editingFilterValues.threshold),
            filter_number:
              editingFilterValues.filter_number === ""
                ? undefined
                : editingFilterValues.filter_number,
          }
        : attr
    );
    try {
      await updateVehicle.mutateAsync({
        id: parseEntityId(vehicleData.id),
        data: {
          maintenance_attributes: updatedAttributes,
        } as VehicleMaintenanceUpdate,
      });
      setVehicleData((prev: VehicleDetailRecord) => ({
        ...prev,
        maintenance_attributes: updatedAttributes as MaintenanceAttribute[],
      }));
      setEditingFilter(null);
      setEditingFilterValues({
        last_changed: "",
        threshold: "",
        filter_number: "",
      });
      toast.success("Filter updated successfully");
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Failed to update filter");
      setAddFilterError(errorMsg);
      toast.error(errorMsg);
    } finally {
      // no-op
    }
  };

  // Status badge logic
  const statusText =
    vehicleData.service_status === "A" ? "Available" : "Unavailable";
  const isAvailable = vehicleData.service_status === "A";
  const equipmentTitle =
    vehicleData.machine_name || vehicleData.name || "Vehicle";
  const usageUnitLabel = isMetric ? "km" : "mi";

  const { isLogReady, isDownloading, downloadMaintenanceLog } =
    useEquipmentMaintenanceLogDownload({
      orgId: organizationId,
      equipmentId: String(vehicleData.id),
      equipmentName: equipmentTitle,
      serialNumber: vehicleData.serial_number,
      equipmentType: "Vehicle",
    });

  // For filter calculations
  const filterCardCurrentMiles =
    typeof vehicleData.current_miles === "string"
      ? parseFloat(vehicleData.current_miles)
      : typeof vehicleData.current_miles === "number"
        ? vehicleData.current_miles
        : undefined;

  const handleAssigneeChange = useCallback(
    async (val: string) => {
      const newValue = val === "none" ? null : val;
      setEditedFields((prev) => ({
        ...prev,
        assigned_team_member: newValue,
      }));
      try {
        await updateVehicle.mutateAsync({
          id: parseEntityId(vehicleData.id),
          data: {
            assigned_team_member: newValue ? Number(newValue) : undefined,
          },
        });
        setVehicleData((prev: VehicleDetailRecord) => ({
          ...prev,
          assigned_team_member: newValue,
        }));
        toast.success("Team member updated successfully");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to update team member"));
      }
    },
    [updateVehicle, vehicleData.id]
  );

  const handleSpecFieldChange = useCallback(
    (field: VehicleSpecificationFieldKey, value: string) => {
      if (field === "serial_number" && value.length > 40) {
        toast.error("VIN number cannot exceed 40 characters");
        return;
      }
      if (field === "license_plate" && value.length > 40) {
        toast.error("License plate cannot exceed 40 characters");
        return;
      }
      setEditedFields((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleAddToMaintenance = useCallback(() => {
    const equipmentId = getEquipmentRecordId({
      id: vehicleData.id,
      equipment_ptr_id: (vehicleData as { equipment_ptr_id?: string | number })
        .equipment_ptr_id,
    });
    openAddMaintenanceDialog({
      equipmentId: String(equipmentId),
      equipmentType: "vehicle",
      navigateOnSuccess: true,
    });
  }, [openAddMaintenanceDialog, vehicleData]);

  const specFieldValues = useMemo(
    () =>
      resolveVehicleSpecificationValues(vehicleData, editedFields, editMode),
    [editMode, editedFields, vehicleData]
  );

  const detailImageSlots = useMemo(
    (): EquipmentDetailImageSlotConfig[] => [
      {
        label: "Vehicle image",
        src: images[0]?.src ?? null,
        accept: IMAGE_ACCEPTS[0],
        inputRef: vehicleImageRef,
        onFileChange: handleVehicleImageChange,
      },
      {
        label: "Registration image",
        src: images[1]?.src ?? null,
        accept: IMAGE_ACCEPTS[1],
        inputRef: registrationImageRef,
        onFileChange: handleRegistrationImageChange,
      },
      {
        label: "Insurance image",
        src: images[2]?.src ?? null,
        accept: IMAGE_ACCEPTS[2],
        inputRef: insuranceImageRef,
        onFileChange: handleInsuranceImageChange,
      },
      {
        label: "Serial number image",
        src: images[3]?.src ?? null,
        accept: IMAGE_ACCEPTS[3],
        inputRef: serialNumberImageRef,
        onFileChange: handleSerialNumberImageChange,
      },
    ],
    [
      images,
      vehicleImageRef,
      registrationImageRef,
      insuranceImageRef,
      serialNumberImageRef,
      handleVehicleImageChange,
      handleRegistrationImageChange,
      handleInsuranceImageChange,
      handleSerialNumberImageChange,
    ]
  );

  const lastUpdatedLabel = vehicleData.last_updated
    ? (() => {
        try {
          const date = new Date(vehicleData.last_updated);
          return isNaN(date.getTime())
            ? String(vehicleData.last_updated)
            : date.toLocaleDateString();
        } catch {
          return String(vehicleData.last_updated);
        }
      })()
    : null;

  const headerActions = isTrashed ? (
    <>
      {hasRestorePermission ? (
        <Button
          leftIcon={<CheckCircle className="h-4 w-4" />}
          title="Restore"
          onClick={onRestore}
        />
      ) : null}
      {hasDeletePermission ? (
        <Button
          leftIcon={<Trash2 className="h-4 w-4" />}
          title="Delete"
          variant={ButtonVariantEnum.DELETE}
          onClick={onDelete}
        />
      ) : null}
    </>
  ) : activeTab === "details" && (canDelete || canRead) ? (
    <ShowMoreExtraActionsDropdown
      onDelete={() => {
        dialogManager.openConfirmationDialog({
          title: "Trash Vehicle",
          confirmationType: "delete",
          itemTitle: equipmentTitle,
          variant: "destructive",
          confirmButtonText: "Move to Trash",
          trash: true,
          onConfirm: async () => {
            try {
              await trashVehicle.mutateAsync(parseEntityId(vehicleData.id));
              toast.success("Vehicle deleted successfully");
              onBack();
              dialogManager.closeDialog();
            } catch (error: unknown) {
              toast.error(getErrorMessage(error, "Failed to delete vehicle"));
              dialogManager.setConfirmationProcessing(false);
              throw error;
            }
          },
        });
      }}
      onLogs={canRead ? navigateToEquipmentLogs : undefined}
    />
  ) : null;

  return (
    <EquipmentDetailLayout
      actions={headerActions}
      activeTab={activeTab}
      backLabel="Back to equipment"
      footer={
        <>
          <MediaViewer
            open={mediaViewer.open}
            title={mediaViewer.title}
            type="image"
            url={mediaViewer.url}
            onOpenChange={(open) =>
              setMediaViewer((prev) => ({ ...prev, open }))
            }
          />
          <DialogManager manager={dialogManager} />
          <AddMaintenanceModalMount />
        </>
      }
      meta={
        <>
          <span
            className={
              isAvailable
                ? "text-sm font-semibold text-green-600 dark:text-green-400"
                : "text-sm font-semibold text-red-500 dark:text-red-400"
            }
          >
            {statusText}
          </span>
          {lastUpdatedLabel ? (
            <p className="text-text-muted text-sm">
              Last updated: {lastUpdatedLabel}
            </p>
          ) : null}
        </>
      }
      subtitle={equipmentTitle}
      tabs={VEHICLE_DETAIL_TABS}
      onBack={onBack}
      onTabChange={setActiveTab}
    >
      {activeTab === "details" && (
        <VehicleDetailsPanel
          access={{
            canRead,
            canWrite,
            canEdit: Boolean(canEditEquipment),
            isDisabled,
          }}
          assignment={{
            teamLoading,
            assigneeOptions: assigneeSearchableOptions,
            assignedMemberValue,
            onAssigneeChange: handleAssigneeChange,
          }}
          edit={{
            editMode,
            isSaving,
            onEditCancel: () => {
              setEditMode(false);
              setEditedFields({});
            },
            onEditStart: () => {
              setEditedFields(createVehicleEditDraft(vehicleData));
              setEditMode(true);
            },
            onSave: handleSaveTopInfo,
          }}
          images={detailImageSlots}
          maintenance={{
            isLogReady,
            isDownloading,
            onDownloadLog: downloadMaintenanceLog,
            onAddToMaintenance: handleAddToMaintenance,
          }}
          specifications={{
            values: specFieldValues,
            usageUnitLabel,
            isMetric,
            onFieldChange: handleSpecFieldChange,
          }}
          onImageView={(url, title) =>
            setMediaViewer({ open: true, url, title })
          }
        />
      )}
      {activeTab === "filters" && (
        <DetailFormSection
          actions={
            canWrite ? (
              <AddMaintenanceFilterDropdown
                availableFilters={availableFiltersToAdd}
                disabled={isDisabled}
                onFilterSelect={(filter) => {
                  setAddFilterError(null);
                  setSelectedNewFilter(filter);
                  openModal("add-equipment-filter");
                }}
              />
            ) : null
          }
          description="Track filter changes and maintenance thresholds."
          title="Maintenance filters"
        >
          <AddMaintenanceFilterModal
            error={addFilterError}
            maxLastChanged={Number(vehicleData.current_miles) || undefined}
            open={isAddFilterModalOpen}
            title={selectedNewFilter?.title || ""}
            onAdd={handleAddFilterSubmit}
            onOpenChange={(open) => {
              if (!open) closeModalKey("add-equipment-filter");
            }}
          />
          {vehicleData.maintenance_attributes &&
          vehicleData.maintenance_attributes.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {vehicleData.maintenance_attributes
                .filter((attr) =>
                  ALL_AVAILABLE_FILTERS.some((f) => f.name === attr.title)
                )
                .map((attr, index: number) => {
                  const filterDefinition = ALL_AVAILABLE_FILTERS.find(
                    (f) => f.name === attr.title
                  );
                  const isEditing = editingFilter === attr.title;
                  const lastChangedVal = isEditing
                    ? editingFilterValues.last_changed
                    : attr.last_changed === undefined
                      ? ""
                      : attr.last_changed;
                  const thresholdVal = isEditing
                    ? editingFilterValues.threshold
                    : attr.threshold === undefined
                      ? ""
                      : attr.threshold;
                  const filterNumberVal = isEditing
                    ? editingFilterValues.filter_number
                    : attr.filter_number || null;
                  let countdown = "";
                  let maintenanceRequired = false;
                  if (
                    filterCardCurrentMiles !== undefined &&
                    lastChangedVal !== "" &&
                    thresholdVal !== ""
                  ) {
                    countdown = String(
                      Number(thresholdVal) -
                        (filterCardCurrentMiles - Number(lastChangedVal))
                    );
                    const remaining =
                      Number(thresholdVal) -
                      (filterCardCurrentMiles - Number(lastChangedVal));
                    maintenanceRequired = remaining < 0;
                  }
                  return (
                    <EquipmentMaintenanceFilterCard
                      key={index}
                      canWrite={canWrite}
                      countdown={countdown}
                      currentUsage={Number(vehicleData.current_miles) || 0}
                      disabled={isDisabled}
                      filterNumber={filterNumberVal}
                      isEditing={isEditing}
                      lastChanged={lastChangedVal}
                      maintenanceRequired={maintenanceRequired}
                      threshold={thresholdVal}
                      title={filterDefinition?.title || attr.title}
                      usageUnitLabel={usageUnitLabel}
                      onCancel={handleCancelEditFilter}
                      onChange={(field, value) => {
                        setEditingFilterValues((v) => ({
                          ...v,
                          [field === "lastChanged"
                            ? "last_changed"
                            : field === "threshold"
                              ? "threshold"
                              : "filter_number"]: value,
                        }));
                      }}
                      onDelete={() => {
                        const filterTitle =
                          filterDefinition?.title || attr.title;
                        const filterTitleToDelete = attr.title;
                        dialogManager.openConfirmationDialog({
                          title: "Remove Filter",
                          description: `Are you sure you want to remove this filter?`,
                          variant: "destructive",
                          confirmButtonText: "Yes",
                          onConfirm: async () => {
                            const currentAttributes =
                              vehicleData.maintenance_attributes || [];
                            const updatedAttributes = currentAttributes.filter(
                              (filter) => filter.title !== filterTitleToDelete
                            );
                            try {
                              await updateVehicle.mutateAsync({
                                id: parseEntityId(vehicleData.id),
                                data: {
                                  maintenance_attributes: updatedAttributes,
                                } as VehicleMaintenanceUpdate,
                              });
                              setVehicleData((prev: VehicleDetailRecord) => ({
                                ...prev,
                                maintenance_attributes: updatedAttributes,
                              }));
                              toast.success(
                                `${filterTitle} filter removed successfully`
                              );
                              dialogManager.closeDialog();
                            } catch (err: unknown) {
                              console.error("Failed to delete filter:", err);
                              toast.error(
                                getErrorMessage(err, "Failed to remove filter")
                              );
                              dialogManager.setConfirmationProcessing(false);
                              throw err;
                            }
                          },
                        });
                      }}
                      onEdit={
                        canWrite ? () => handleStartEditFilter(attr) : undefined
                      }
                      onSave={handleSaveEditFilter}
                    />
                  );
                })}
            </div>
          ) : (
            <p className="text-text-muted text-sm">
              No maintenance filters set up for this vehicle.
            </p>
          )}
        </DetailFormSection>
      )}
      {activeTab === "notes" && (
        <DetailFormSection
          description="Team notes and updates for this vehicle."
          title="Notes & comments"
        >
          <Notes
            embedded
            comments={comments || []}
            deleteComment={async (id) => {
              if (deleteComment?.mutateAsync) {
                await deleteComment.mutateAsync({ comment_id: id });
              }
              return id;
            }}
            patchComment={async (id, payload) => {
              if (patchComment?.mutateAsync) {
                return patchComment.mutateAsync({
                  comment_id: id,
                  ...payload,
                });
              }
              throw new Error("patchComment is not available");
            }}
            postComment={async (payload) => postComment.mutateAsync(payload)}
            readOnly={isDisabled || !canWrite}
            showTitle={false}
          />
        </DetailFormSection>
      )}
      {activeTab === "battery" && (
        <DetailFormSection title="Battery replacement">
          <BatteryReplacement
            disabled={isDisabled || !canWrite}
            equipmentId={vehicleData.id || equipment.id}
            onOpenMediaViewer={({ url, title }) =>
              setMediaViewer({ open: true, url, title })
            }
          />
        </DetailFormSection>
      )}
    </EquipmentDetailLayout>
  );
}
