"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { AppFormModal, ColorPicker, Input } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { TaskType } from "@/api/types";

interface TypeManagementDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  taskTypes: TaskType[];
  editingTypeId?: number | null;
  onAddType?: (name: string, color: string) => void;
  onEditType?: (id: number, name: string, color: string) => void;
}

export default function TypeManagementDialog({
  open = false,
  onOpenChange,
  taskTypes,
  editingTypeId = null,
  onAddType,
  onEditType,
}: TypeManagementDialogProps) {
  const [typeName, setTypeName] = useState("");
  const [typeColor, setTypeColor] = useState("#3b82f6");

  useEffect(() => {
    if (!open) return;
    if (editingTypeId) {
      const type = taskTypes.find((t) => t.id === editingTypeId);
      if (type) {
        setTypeName(type.type_name);
        setTypeColor(type.type_color);
        return;
      }
    }
    setTypeName("");
    setTypeColor("#3b82f6");
  }, [open, editingTypeId, taskTypes]);

  const handleClose = () => {
    setTypeName("");
    setTypeColor("#3b82f6");
    onOpenChange?.(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!typeName.trim()) {
      toast.error("Please enter a type name");
      return;
    }

    if (editingTypeId) {
      onEditType?.(editingTypeId, typeName.trim(), typeColor);
    } else {
      onAddType?.(typeName.trim(), typeColor);
    }

    handleClose();
  };

  const nameDisabled =
    editingTypeId !== null &&
    taskTypes.find((t) => t.id === editingTypeId)?.type_name === "Personal";

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      submitDisabled={!typeName.trim() || nameDisabled}
      submitLabel={editingTypeId ? "Save" : "Add"}
      title={editingTypeId ? "Edit Type" : "Add New Type"}
      width={480}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <Input
        disabled={nameDisabled}
        id="type_name"
        label="Type Name"
        maxLength={50}
        placeholder="Placeholder"
        value={typeName}
        onChange={(event) => setTypeName(event.target.value)}
      />
      <div className="space-y-2">
        <p className="text-text-primary text-sm font-medium">Type Color</p>
        <div className="bg-bg-surface/20 h-[350px] w-full rounded-lg border p-4">
          <div
            className="text-text-muted mb-2 h-[10px] w-full rounded-[20px]"
            style={{ backgroundColor: typeColor }}
          />
          <ColorPicker
            showHeader={false}
            value={typeColor}
            onChange={setTypeColor}
          />
        </div>
      </div>
    </AppFormModal>
  );
}
