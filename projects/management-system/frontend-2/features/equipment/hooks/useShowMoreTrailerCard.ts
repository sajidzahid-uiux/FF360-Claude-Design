import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import type { TrailerUpdatePayload, TrailerV2 } from "@/api/types";
import { getEquipmentRecordId } from "@/features/equipment";
import { useEquipmentMaintenanceLogDownload } from "@/features/equipment/hooks/useEquipmentMaintenanceLogDownload";
import { useEquipmentShowMorePermissions } from "@/features/equipment/hooks/useEquipmentShowMorePermissions";
import type {
  ImageValue,
  ShowMoreTrailerCardProps,
  TrailerDetailRecord,
  TrailerEditableFields,
} from "@/features/equipment/model/show-more-card";
import type { MediaViewerProps } from "@/features/equipment/ui";
import { useAssigneeDropdownItems } from "@/features/team/hooks";
import {
  useDialogManager,
  useFileUpload,
  useRouteIds,
  useTeamData,
} from "@/hooks";
import { useTrashTrailer, useUpdateTrailer } from "@/hooks/mutations";
import { orgPath } from "@/shared/config/routes";
import { getErrorMessage } from "@/utils/apiError";

export function useShowMoreTrailerCard({
  equipment,
  onClose,
  isTrashed = false,
  canWrite = true,
  canRead = true,
}: Pick<
  ShowMoreTrailerCardProps,
  "equipment" | "onClose" | "isTrashed" | "canWrite" | "canRead"
>) {
  const router = useRouter();
  const updateTrailer = useUpdateTrailer();
  const trashTrailer = useTrashTrailer();
  const [trailerData, setTrailerData] =
    useState<TrailerDetailRecord>(equipment);

  const trailerRecordId = useMemo(
    () => getEquipmentRecordId(trailerData),
    [trailerData]
  );

  const [editMode, setEditMode] = useState(false);
  const [editedFields, setEditedFields] = useState<TrailerEditableFields>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("View Details");
  const [mediaViewer, setMediaViewer] = useState<
    Omit<MediaViewerProps, "onOpenChange"> & { objectUrlToRevoke?: string }
  >({ open: false, url: null, type: "image", title: "" });
  const dialogManager = useDialogManager();
  const { data: teamMembers, isLoading: teamLoading } = useTeamData();
  const { orgId: organizationId } = useRouteIds();

  const navigateToEquipmentLogs = useCallback(() => {
    if (!organizationId) return;
    const equipmentId = String(trailerData.equipment_ptr_id ?? trailerData.id);
    const equipmentName =
      trailerData.machine_name ||
      trailerData.name ||
      `Equipment #${equipmentId}`;
    router.push(
      orgPath(
        organizationId,
        `/equipment/${equipmentId}/logs?equipment_type=${encodeURIComponent(
          "trailer"
        )}&name=${encodeURIComponent(equipmentName)}`
      )
    );
  }, [organizationId, router, trailerData]);

  const { effectiveCanRead, effectiveCanWrite, isDisabled } =
    useEquipmentShowMorePermissions({ canRead, canWrite, isTrashed });

  const {
    file: trailerImage,
    error: trailerImageError,
    fileInputRef: trailerImageRef,
    handleFileChange: handleTrailerImageChange,
    resetFile: resetTrailerImage,
  } = useFileUpload({
    onFileSelect: (file) => {
      if (file) {
        setTrailerData((v) => ({
          ...v,
          equipment_image: file,
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
        setTrailerData((v) => ({
          ...v,
          insurance_image: file,
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
        setTrailerData((v) => ({
          ...v,
          registration_image: file,
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
        setTrailerData((v) => ({
          ...v,
          serial_number_image: file,
        }));
      }
    },
  });

  useEffect(() => {
    if (trailerImageError) {
      toast.error(trailerImageError);
    }
  }, [trailerImageError]);

  useEffect(() => {
    if (insuranceImageError) {
      toast.error(insuranceImageError);
    }
  }, [insuranceImageError]);

  useEffect(() => {
    if (registrationImageError) {
      toast.error(registrationImageError);
    }
  }, [registrationImageError]);

  useEffect(() => {
    if (serialNumberImageError) {
      toast.error(serialNumberImageError);
    }
  }, [serialNumberImageError]);

  // Helper function to check if file is PDF
  const isPdf = (file: File | string | null) => {
    if (!file) return false;
    if (file instanceof File) {
      return (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      );
    }
    if (typeof file === "string") {
      return (
        file.toLowerCase().includes(".pdf") ||
        file.toLowerCase().endsWith(".pdf")
      );
    }
    return false;
  };

  // Helper function to get image URL
  const getImageUrl = useCallback((image: File | string | null) => {
    if (!image) return null;
    if (isPdf(image)) return null; // PDFs can't be displayed as images
    if (typeof image === "string") return image;
    if (image instanceof File) return URL.createObjectURL(image);
    return null;
  }, []);

  const assigneeDropdownItems = useAssigneeDropdownItems(
    teamMembers,
    editedFields.assigned_team_member ?? trailerData.assigned_team_member
  );

  const images = useMemo(
    (): Array<{ label: string; src: string | null; data: ImageValue }> => [
      {
        label: "Trailer Image",
        src: getImageUrl(trailerData.equipment_image ?? null),
        data: trailerData.equipment_image,
      },
      {
        label: "Insurance Image",
        src: getImageUrl(trailerData.insurance_image ?? null),
        data: trailerData.insurance_image,
      },
      {
        label: "Registration Image",
        src: getImageUrl(trailerData.registration_image ?? null),
        data: trailerData.registration_image,
      },
      {
        label: "Serial Number Image",
        src: getImageUrl(trailerData.serial_number_image ?? null),
        data: trailerData.serial_number_image,
      },
    ],
    [
      trailerData.equipment_image,
      trailerData.insurance_image,
      trailerData.registration_image,
      trailerData.serial_number_image,
      getImageUrl,
    ]
  );

  useEffect(() => {
    setTrailerData(equipment);
  }, [equipment]);

  // Cleanup object URLs when component unmounts or image changes
  useEffect(() => {
    return () => {
      // Cleanup any object URLs to prevent memory leaks
      if (trailerData.equipment_image instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(trailerData.equipment_image));
      }
      if (trailerData.insurance_image instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(trailerData.insurance_image));
      }
      if (trailerData.registration_image instanceof File) {
        URL.revokeObjectURL(
          URL.createObjectURL(trailerData.registration_image)
        );
      }
      if (trailerData.serial_number_image instanceof File) {
        URL.revokeObjectURL(
          URL.createObjectURL(trailerData.serial_number_image)
        );
      }
    };
  }, [
    trailerData.equipment_image,
    trailerData.insurance_image,
    trailerData.registration_image,
    trailerData.serial_number_image,
  ]);

  const openMediaViewer = useCallback(
    (label: string, data: File | string | null, src: string | null) => {
      if (isPdf(data)) {
        const url =
          typeof data === "string"
            ? data
            : data instanceof File
              ? URL.createObjectURL(data)
              : null;
        if (url) {
          setMediaViewer({
            open: true,
            url,
            type: "pdf",
            title: label,
            objectUrlToRevoke: data instanceof File ? url : undefined,
          });
        }
      } else if (src) {
        setMediaViewer({
          open: true,
          url: src,
          type: "image",
          title: label,
        });
      }
    },
    []
  );

  const handleMediaViewerOpenChange = useCallback((open: boolean) => {
    setMediaViewer((prev) => {
      if (!open && prev.objectUrlToRevoke) {
        URL.revokeObjectURL(prev.objectUrlToRevoke);
      }
      return {
        ...prev,
        open,
        ...(open ? {} : { objectUrlToRevoke: undefined }),
      };
    });
  }, []);

  const handleSaveTopInfo = async () => {
    // Validation - same restrictions as add form
    // Make is required
    const makeValue = editedFields.make ?? trailerData.make ?? "";
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
    const modelValue = editedFields.model ?? trailerData.model ?? "";
    if (modelValue && modelValue.trim().length > 100) {
      toast.error("Model cannot exceed 100 characters");
      return;
    }
    // Color max length 50
    const colorValue = editedFields.color ?? trailerData.color ?? "";
    if (colorValue && colorValue.trim().length > 50) {
      toast.error("Color cannot exceed 50 characters");
      return;
    }
    // Year validation: min 1900, max current year + 1
    const yearValue = editedFields.year ?? trailerData.year;
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
    // License plate max length 40
    if (editedFields.license_plate && editedFields.license_plate.length > 40) {
      toast.error("License plate cannot exceed 40 characters");
      return;
    }
    setIsSaving(true);

    const patchPayload = {
      ...editedFields,
    } as unknown as TrailerUpdatePayload;
    const assignedTeamMember = editedFields.assigned_team_member;
    if (assignedTeamMember && assignedTeamMember !== "none") {
      patchPayload.assigned_team_member = Number(assignedTeamMember);
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
      const updatedTrailer = await updateTrailer.mutateAsync({
        id: trailerRecordId,
        data: patchPayload,
      });

      // Prepare FormData for images
      const formData = new FormData();
      if (trailerImage) {
        formData.append("equipment_image", trailerImage);
      }
      if (insuranceImage) {
        formData.append("insurance_image", insuranceImage);
      }
      if (registrationImage) {
        formData.append("registration_image", registrationImage);
      }
      if (serialNumberImage) {
        formData.append("serial_number_image", serialNumberImage);
      }

      // Only send image update if there are images to upload
      let updatedImages: Partial<TrailerV2> = {};
      if (
        formData.has("equipment_image") ||
        formData.has("insurance_image") ||
        formData.has("registration_image") ||
        formData.has("serial_number_image")
      ) {
        updatedImages = await updateTrailer.mutateAsync({
          id: trailerRecordId,
          data: formData as unknown as TrailerUpdatePayload,
        });
      }

      setTrailerData((prev: TrailerDetailRecord) => ({
        ...prev,
        ...updatedTrailer,
        ...updatedImages,
        id: String(updatedTrailer.id || prev.id),
        assigned_team_member: updatedTrailer.assigned_team_member
          ? String(updatedTrailer.assigned_team_member)
          : null,
      }));
      setEditMode(false);
      setEditedFields({});
      resetTrailerImage();
      resetInsuranceImage();
      resetRegistrationImage();
      resetSerialNumberImage();
      toast.success("Trailer updated successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save changes"));
    } finally {
      setIsSaving(false);
    }
  };

  // Status badge logic
  const statusText =
    trailerData.service_status === "A" ? "Available" : "Unavailable";
  const statusColor =
    trailerData.service_status === "A" ? "#008000" : "#FF0000";

  const equipmentDisplayName =
    trailerData.machine_name || trailerData.name || "Trailer";

  const { isLogReady, isDownloading, downloadMaintenanceLog } =
    useEquipmentMaintenanceLogDownload({
      orgId: organizationId,
      equipmentId: String(trailerData.id),
      equipmentName: equipmentDisplayName,
      serialNumber: trailerData.serial_number,
      equipmentType: "Trailer",
    });

  return {
    trailerData,
    setTrailerData,
    trailerRecordId,
    editMode,
    setEditMode,
    editedFields,
    setEditedFields,
    isSaving,
    activeTab,
    setActiveTab,
    mediaViewer,
    setMediaViewer,
    dialogManager,
    navigateToEquipmentLogs,
    teamLoading,
    assigneeDropdownItems,
    effectiveCanRead,
    effectiveCanWrite,
    isDisabled,
    getImageUrl,
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
    handleMediaViewerOpenChange,
    handleSaveTopInfo,
    statusText,
    statusColor,
    equipmentDisplayName,
    isLogReady,
    isDownloading,
    downloadMaintenanceLog,
    updateTrailer,
    trashTrailer,
    onClose,
    isTrashed,
    organizationId,
  };
}
