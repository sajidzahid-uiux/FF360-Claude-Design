"use client";

import type { FormEvent } from "react";

import { AppFormModal, Input } from "@fieldflow360/org-ui";

import { usePermissions } from "@/hooks/queries";

import { PERMISSIONS_CONFIG } from "../role-permissions-editor/permissions-config";
import {
  PermissionCategoryGroup,
  PermissionsEmptyState,
  PermissionsLoadingState,
} from "../role-permissions-editor/ui";
import { useCreateRoleAction } from "./useCreateRoleAction";

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleCreated?: (roleId: number) => void;
}

export default function CreateRoleDialog({
  open,
  onOpenChange,
  onRoleCreated,
}: CreateRoleDialogProps) {
  const {
    formAction,
    isPending,
    selectedPermissions,
    handleTogglePermission,
    handleClose,
    roleName,
    setRoleName,
  } = useCreateRoleAction({ onOpenChange, onRoleCreated });

  const { data: permissions = [], isLoading: isLoadingPermissions } =
    usePermissions();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
    formData.set("roleName", roleName);
    await formAction(formData);
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelDisabled={isPending}
      isOpen={open}
      isSubmitting={isPending}
      maxHeight="calc(100vh - 4rem)"
      submitDisabled={!roleName.trim() || isPending}
      submitLabel="Create Role"
      title="Create New User Type"
      width={700}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <p className="text-text-muted text-sm">
        Create a new user type with a custom name and assign permissions.
      </p>
      <Input
        required
        disabled={isPending}
        helperText="A member can belong to only one User Type."
        label="Role Name"
        maxLength={150}
        placeholder="Enter role name"
        value={roleName}
        onChange={(event) => setRoleName(event.target.value)}
      />
      <div className="space-y-2">
        <p className="text-text-primary text-sm font-medium">Permissions</p>
        <p className="text-text-muted text-xs">
          Select the permissions for this role. You can modify these later if
          needed.
        </p>
        {isLoadingPermissions ? (
          <PermissionsLoadingState />
        ) : !permissions || permissions.length === 0 ? (
          <PermissionsEmptyState />
        ) : (
          <div className="max-h-[40vh] space-y-4 overflow-y-auto">
            {PERMISSIONS_CONFIG.map((section) => (
              <PermissionCategoryGroup
                key={section.id}
                permissions={permissions}
                section={section}
                selectedPermissionIds={selectedPermissions}
                onToggle={handleTogglePermission}
              />
            ))}
          </div>
        )}
      </div>
    </AppFormModal>
  );
}
