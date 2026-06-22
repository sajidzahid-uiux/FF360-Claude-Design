"use client";

import { FormEvent, useMemo } from "react";

import {
  AppFormModal,
  Dropdown,
  type DropdownOption,
} from "@fieldflow360/org-ui";

interface AssignCrewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: "group" | "individual";
  selectedId: string;
  onSelectedIdChange: (id: string) => void;
  availableOptions: Array<{ id: number; name: string; email?: string }>;
  canManageCrew: boolean;
  isCrewPermissionLoading: boolean;
  isPending: boolean;
  onSubmit: () => void;
}

export function AssignCrewDialog({
  isOpen,
  onClose,
  type,
  selectedId,
  onSelectedIdChange,
  availableOptions,
  canManageCrew,
  isCrewPermissionLoading,
  isPending,
  onSubmit,
}: AssignCrewDialogProps) {
  const isGroup = type === "group";
  const title = isGroup ? "Assign crew group" : "Assign individual";
  const fieldLabel = isGroup ? "Crew group" : "Team member";
  const placeholder = isGroup ? "Choose a group…" : "Choose an individual…";
  const emptyMessage = isGroup
    ? "No available groups"
    : "No available individuals";

  const options = useMemo((): DropdownOption<string>[] => {
    if (availableOptions.length === 0) {
      return [{ value: "", label: emptyMessage, disabled: true }];
    }
    return availableOptions.map((option) => ({
      value: option.id.toString(),
      label: isGroup
        ? option.name
        : `${option.name}${option.email ? ` (${option.email})` : ""}`,
    }));
  }, [availableOptions, emptyMessage, isGroup]);

  const handleClose = () => {
    if (isPending) return;
    onClose();
    onSelectedIdChange("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      isOpen={isOpen}
      isSubmitting={isPending}
      submitDisabled={
        !selectedId ||
        isPending ||
        !canManageCrew ||
        isCrewPermissionLoading ||
        availableOptions.length === 0
      }
      submitLabel="Assign"
      title={title}
      width={480}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <Dropdown
        fullWidth
        disabled={availableOptions.length === 0 || isCrewPermissionLoading}
        helperText={availableOptions.length === 0 ? emptyMessage : undefined}
        label={fieldLabel}
        options={options}
        placeholder={placeholder}
        value={selectedId || undefined}
        onChange={onSelectedIdChange}
      />
    </AppFormModal>
  );
}
