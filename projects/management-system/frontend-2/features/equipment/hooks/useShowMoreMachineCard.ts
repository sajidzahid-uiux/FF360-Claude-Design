import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import type {
  MachineUpdatePayload,
  MachineV2,
  MaintenanceAttribute,
} from "@/api/types";
import { getEquipmentRecordId } from "@/features/equipment";
import { useEquipmentMaintenanceLogDownload } from "@/features/equipment/hooks/useEquipmentMaintenanceLogDownload";
import { useEquipmentShowMorePermissions } from "@/features/equipment/hooks/useEquipmentShowMorePermissions";
import { ALL_AVAILABLE_FILTERS } from "@/features/equipment/model/maintenance-filters";
import type {
  ImageValue,
  MachineDetailRecord,
  MachineEditableFields,
  ShowMoreMachineCardProps,
} from "@/features/equipment/model/show-more-card";
import type { MediaViewerProps } from "@/features/equipment/ui";
import { useAssigneeDropdownItems } from "@/features/team/hooks";
import {
  useDialogManager,
  useFileUpload,
  useRouteIds,
  useTeamData,
} from "@/hooks";
import { useTrashMachine, useUpdateMachine } from "@/hooks/mutations";
import { orgPath } from "@/shared/config/routes";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { getErrorMessage } from "@/utils/apiError";

export function useShowMoreMachineCard({
  equipment,
  onClose,
  isTrashed = false,
  canWrite = true,
  canRead = true,
}: Pick<
  ShowMoreMachineCardProps,
  "equipment" | "onClose" | "isTrashed" | "canWrite" | "canRead"
>) {
  const router = useRouter();
  const { orgId } = useRouteIds();
  const updateMachine = useUpdateMachine();
  const trashMachine = useTrashMachine();
  const [machineData, setMachineData] =
    useState<MachineDetailRecord>(equipment);

  const [editMode, setEditMode] = useState(false);
  const [editedFields, setEditedFields] = useState<MachineEditableFields>({});
  const [isSaving, setIsSaving] = useState(false);
  const dialogManager = useDialogManager();

  const machineRecordId = useMemo(
    () => getEquipmentRecordId(machineData),
    [machineData]
  );

  const navigateToEquipmentLogs = useCallback(() => {
    if (!orgId) return;
    const equipmentId = String(machineData.equipment_ptr_id ?? machineData.id);
    const equipmentName =
      machineData.machine_name ||
      machineData.name ||
      `Equipment #${equipmentId}`;
    router.push(
      orgPath(
        orgId,
        `/equipment/${equipmentId}/logs?equipment_type=${encodeURIComponent(
          "machine"
        )}&name=${encodeURIComponent(equipmentName)}`
      )
    );
  }, [orgId, router, machineData]);

  const { stack, openModal, closeModalKey } = useModalStack();
  const isAddFilterModalOpen = stack.some(
    (f) => f.key === "add-equipment-filter"
  );
  const openAddFilterModal = useCallback(
    () => openModal("add-equipment-filter"),
    [openModal]
  );
  const closeAddFilterModal = useCallback(
    () => closeModalKey("add-equipment-filter"),
    [closeModalKey]
  );
  const [selectedNewFilter, setSelectedNewFilter] = useState<
    { title: string; name: string } | undefined
  >(undefined);
  const [addFilterError, setAddFilterError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("View Details");
  const [mediaViewer, setMediaViewer] = useState<
    Omit<MediaViewerProps, "onOpenChange" | "type">
  >({ open: false, url: null, title: "" });

  const { data: teamMembers, isLoading: teamLoading } = useTeamData();
  const [editingFilter, setEditingFilter] = useState<string | null>(null);
  const [editingFilterValues, setEditingFilterValues] = useState<{
    last_changed: string;
    threshold: string;
    filter_number: string;
  }>({ last_changed: "", threshold: "", filter_number: "" });

  const { orgId: organization } = useRouteIds();

  const {
    file: machineImage,
    error: machineImageError,
    fileInputRef: machineImageRef,
    handleFileChange: handleMachineImageChange,
    resetFile: resetMachineImage,
  } = useFileUpload({
    onFileSelect: (file) => {
      if (file) {
        setMachineData((v) => ({
          ...v,
          equipment_image: file,
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
        setMachineData((prev) => ({
          ...prev,
          serial_number_image: file,
        }));
      }
    },
  });

  useEffect(() => {
    if (machineImageError) {
      toast.error(machineImageError);
    }
    if (serialNumberImageError) {
      toast.error(serialNumberImageError);
    }
  }, [machineImageError, serialNumberImageError]);

  // Helper function to get image URL
  const getImageUrl = useCallback((image: ImageValue) => {
    if (!image) return null;
    if (typeof image === "string") return image;
    if (image instanceof File) return URL.createObjectURL(image);
    return null;
  }, []);

  const serialNumberImageUrl = useMemo(
    () => getImageUrl(machineData.serial_number_image as ImageValue),
    [machineData.serial_number_image, getImageUrl]
  );

  const { effectiveCanRead, effectiveCanWrite, isDisabled } =
    useEquipmentShowMorePermissions({ canRead, canWrite, isTrashed });

  useEffect(() => {
    setMachineData(equipment);
  }, [equipment]);

  // Cleanup object URLs when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (machineData.equipment_image instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(machineData.equipment_image));
      }
      if (machineData.serial_number_image instanceof File) {
        URL.revokeObjectURL(
          URL.createObjectURL(machineData.serial_number_image)
        );
      }
    };
  }, [machineData.equipment_image, machineData.serial_number_image]);

  const availableFiltersToAdd = useMemo(() => {
    const currentFilterNames =
      machineData.maintenance_attributes?.map((attr) => attr.title) || [];
    return ALL_AVAILABLE_FILTERS.filter(
      (f) => !currentFilterNames.includes(f.name)
    );
  }, [machineData.maintenance_attributes]);

  const assigneeDropdownItems = useAssigneeDropdownItems(
    teamMembers,
    editedFields.assigned_team_member ?? machineData.assigned_team_member
  );

  const handleSaveTopInfo = async () => {
    // Validation - same restrictions as add form
    // Make is required
    const makeValue = editedFields.make ?? machineData.make ?? "";
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
    const modelValue = editedFields.model ?? machineData.model ?? "";
    if (modelValue && modelValue.trim().length > 100) {
      toast.error("Model cannot exceed 100 characters");
      return;
    }
    // Color max length 50
    const colorValue = editedFields.color ?? machineData.color ?? "";
    if (colorValue && colorValue.trim().length > 50) {
      toast.error("Color cannot exceed 50 characters");
      return;
    }
    // Year validation: min 1900, max current year + 1
    const yearValue = editedFields.year ?? machineData.year;
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
    // Serial number max length 50
    if (editedFields.serial_number && editedFields.serial_number.length > 50) {
      toast.error("Serial number cannot exceed 50 characters");
      return;
    }
    setIsSaving(true);

    const patchPayload = {
      ...editedFields,
    } as unknown as MachineUpdatePayload;
    const assignedTeamMember = editedFields.assigned_team_member;
    if (assignedTeamMember && assignedTeamMember !== "none") {
      patchPayload.assigned_team_member = Number(assignedTeamMember);
    }
    if (editedFields.current_hours !== undefined) {
      patchPayload.current_hours = Number(editedFields.current_hours);
    }
    if (editedFields.hour_rate !== undefined) {
      patchPayload.hour_rate = Number(editedFields.hour_rate);
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
      const updatedMachine = await updateMachine.mutateAsync({
        id: machineRecordId,
        data: patchPayload,
      });
      // Prepare FormData for images
      const formData = new FormData();
      if (machineImage) {
        formData.append("equipment_image", machineImage);
      }
      if (serialNumberImage) {
        formData.append("serial_number_image", serialNumberImage);
      }
      // Only send image update if there are images to upload
      let updatedImages: Partial<MachineV2> = {};
      if (
        formData.has("equipment_image") ||
        formData.has("serial_number_image")
      ) {
        updatedImages = await updateMachine.mutateAsync({
          id: machineRecordId,
          data: formData as unknown as MachineUpdatePayload,
        });
      }
      setMachineData((prev: MachineDetailRecord) => ({
        ...prev,
        ...updatedMachine,
        ...updatedImages,
        id: String(updatedMachine.id || prev.id),
        assigned_team_member: updatedMachine.assigned_team_member
          ? String(updatedMachine.assigned_team_member)
          : null,
      }));
      setEditMode(false);
      setEditedFields({});
      resetMachineImage();
      resetSerialNumberImage();
      toast.success("Machine updated successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save changes"));
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
    const currentAttributes = machineData.maintenance_attributes || [];
    const updatedAttributes = [...currentAttributes, newFilterData];
    try {
      const updatedMachine = await updateMachine.mutateAsync({
        id: machineRecordId,
        data: {
          maintenance_attributes:
            updatedAttributes as MachineUpdatePayload["maintenance_attributes"],
        },
      });
      setMachineData((prev: MachineDetailRecord) => ({
        ...prev,
        maintenance_attributes: updatedMachine.maintenance_attributes,
      }));
      closeAddFilterModal();
      setSelectedNewFilter(undefined);
      toast.success(`${selectedNewFilter.title} filter added successfully`);
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, "Failed to add filter");
      setAddFilterError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const filterCardCurrentHours =
    typeof machineData.current_hours === "string"
      ? parseFloat(machineData.current_hours)
      : typeof machineData.current_hours === "number"
        ? machineData.current_hours
        : undefined;

  const statusText =
    machineData.service_status === "A" ? "Available" : "Unavailable";
  const statusColor =
    machineData.service_status === "A" ? "#008000" : "#FF0000";

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

  const handleCancelEditFilter = () => {
    setEditingFilter(null);
    setEditingFilterValues({
      last_changed: "",
      threshold: "",
      filter_number: "",
    });
  };

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
    const currentAttributes = machineData.maintenance_attributes || [];
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
            automatic: true,
          }
        : attr
    );
    try {
      const updatedMachine = await updateMachine.mutateAsync({
        id: machineRecordId,
        data: {
          maintenance_attributes:
            updatedAttributes as MachineUpdatePayload["maintenance_attributes"],
        },
      });
      setMachineData((prev: MachineDetailRecord) => ({
        ...prev,
        maintenance_attributes: updatedMachine.maintenance_attributes,
      }));
      setEditingFilter(null);
      setEditingFilterValues({
        last_changed: "",
        threshold: "",
        filter_number: "",
      });
      toast.success("Filter updated successfully");
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, "Failed to update filter");
      setAddFilterError(errorMsg);
      toast.error(errorMsg);
    } finally {
      // no-op
    }
  };

  const equipmentDisplayName =
    machineData.machine_name || machineData.name || "Machine";

  const { isLogReady, isDownloading, downloadMaintenanceLog } =
    useEquipmentMaintenanceLogDownload({
      orgId: organization,
      equipmentId: String(machineData.id),
      equipmentName: equipmentDisplayName,
      serialNumber: machineData.serial_number,
      equipmentType: "Machine",
    });

  return {
    orgId,
    equipment,
    machineData,
    setMachineData,
    editMode,
    setEditMode,
    editedFields,
    setEditedFields,
    isSaving,
    dialogManager,
    machineRecordId,
    navigateToEquipmentLogs,
    isAddFilterModalOpen,
    openAddFilterModal,
    closeAddFilterModal,
    selectedNewFilter,
    setSelectedNewFilter,
    addFilterError,
    setAddFilterError,
    activeTab,
    setActiveTab,
    mediaViewer,
    setMediaViewer,
    teamLoading,
    editingFilter,
    setEditingFilter,
    editingFilterValues,
    setEditingFilterValues,
    organization,
    machineImageRef,
    handleMachineImageChange,
    serialNumberImageRef,
    handleSerialNumberImageChange,
    getImageUrl,
    serialNumberImageUrl,
    effectiveCanRead,
    effectiveCanWrite,
    isDisabled,
    availableFiltersToAdd,
    assigneeDropdownItems,
    handleSaveTopInfo,
    handleAddFilterSubmit,
    filterCardCurrentHours,
    statusText,
    statusColor,
    handleStartEditFilter,
    handleCancelEditFilter,
    handleSaveEditFilter,
    equipmentDisplayName,
    isLogReady,
    isDownloading,
    downloadMaintenanceLog,
    updateMachine,
    trashMachine,
    onClose,
    isTrashed,
  };
}
