"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { AppFormModal } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { EQUIPMENT_TYPE_ENUM_LABELS, EquipmentTypeEnum } from "@/api/types";
import type { AddEquipmentSubmitPayload } from "@/features/equipment";
import { addEquipmentFormToSubmitPayload } from "@/features/equipment";
import {
  isAddEquipmentFormSubmittable,
  validateAddEquipmentForm,
} from "@/features/equipment/lib/add-equipment-form-validation";
import {
  type AddEquipmentFormValues,
  buildDefaultAddEquipmentFormValues,
} from "@/features/equipment/model/addEquipmentForm";
import { AddEquipmentFormFields } from "@/features/equipment/ui/add-equipment/AddEquipmentFormFields";

export interface AddEquipmentModalProps {
  open: boolean;
  equipmentType: EquipmentTypeEnum;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: AddEquipmentSubmitPayload) => void | Promise<void>;
  isSubmitting?: boolean;
}

function getModalTitle(equipmentType: EquipmentTypeEnum): string {
  return `Add New ${EQUIPMENT_TYPE_ENUM_LABELS[equipmentType]}`;
}

function getSubmitLabel(equipmentType: EquipmentTypeEnum): string {
  return `Add ${EQUIPMENT_TYPE_ENUM_LABELS[equipmentType]}`;
}

export function AddEquipmentModal({
  open,
  equipmentType,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddEquipmentModalProps) {
  const [formData, setFormData] = useState<AddEquipmentFormValues>(() =>
    buildDefaultAddEquipmentFormValues(equipmentType)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const wasOpenRef = useRef(false);
  const lastTypeRef = useRef(equipmentType);

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        setFormData(buildDefaultAddEquipmentFormValues(equipmentType));
        setFieldErrors({});
      }
      wasOpenRef.current = false;
      return;
    }

    if (!wasOpenRef.current || lastTypeRef.current !== equipmentType) {
      setFormData(buildDefaultAddEquipmentFormValues(equipmentType));
      setFieldErrors({});
      lastTypeRef.current = equipmentType;
    }

    wasOpenRef.current = true;
  }, [equipmentType, open]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  }, [isSubmitting, onOpenChange]);

  const handleFieldChange = useCallback(
    (field: keyof AddEquipmentFormValues) => {
      setFieldErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    },
    []
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const errors = validateAddEquipmentForm(formData, equipmentType);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    await onSubmit(addEquipmentFormToSubmitPayload(equipmentType, formData));
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={open}
      isSubmitting={isSubmitting}
      maxHeight="calc(100vh - 4rem)"
      submitDisabled={!isAddEquipmentFormSubmittable(formData, equipmentType)}
      submitLabel={getSubmitLabel(equipmentType)}
      title={getModalTitle(equipmentType)}
      width={900}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <AddEquipmentFormFields
        equipmentType={equipmentType}
        fieldErrors={fieldErrors}
        value={formData}
        onChange={setFormData}
        onFieldChange={handleFieldChange}
      />
    </AppFormModal>
  );
}
