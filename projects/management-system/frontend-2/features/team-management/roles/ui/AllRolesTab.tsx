"use client";

import { useCallback, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";

import type { Role } from "@/api/types";
import { useDialogManager } from "@/hooks";
import { useRoleMutations } from "@/hooks/mutations";
import { useRoutePermissions } from "@/hooks/permissions";
import { useRoles } from "@/hooks/queries";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { DialogManager, Dropdown } from "@/shared/ui/common";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  SanitizedInput,
} from "@/shared/ui/primitives";
import { buildRowActions } from "@/utils/actions";

import CreateRoleDialog from "./CreateRoleDialog";

interface AllRolesTabProps {
  onEditRole?: (role: Role) => void;
}

export default function AllRolesTab({ onEditRole }: AllRolesTabProps) {
  const { write: canEditTeam } = useRoutePermissions() || {};
  const { data: roles, isLoading } = useRoles();
  const { deleteRole } = useRoleMutations();
  const dialogManager = useDialogManager();
  const { stack, openModal, closeModalKey } = useModalStack();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const createDialogOpen = stack.some((f) => f.key === "create-role");

  const isAdmin =
    useDataFromStorageByKey(StorageKey.USER_ROLE)?.is_admin === true;

  const sortedRoles = useMemo(() => {
    if (!roles) return [];
    return [...roles].sort((a, b) => {
      if (a.is_admin !== b.is_admin) {
        return a.is_admin ? -1 : 1;
      }
      if (a.is_default !== b.is_default) {
        return a.is_default ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [roles]);

  const handleEditClick = useCallback(
    (role: Role) => {
      if (role.is_admin) return;
      setEditingRole(role);
      setRoleName(role.name);
      onEditRole?.(role);
    },
    [onEditRole]
  );

  const handleCancelEdit = () => {
    setEditingRole(null);
    setRoleName("");
  };

  const handleDeleteClick = useCallback(
    (role: Role) => {
      dialogManager.openConfirmationDialog({
        title: "Delete User Type",
        confirmationType: "delete",
        itemTitle: role.name,
        variant: "destructive",
        onConfirm: async () => {
          await deleteRole.mutateAsync(role.id);
        },
      });
    },
    [dialogManager, deleteRole]
  );

  const handleRoleCreated = (roleId: number) => {
    const newRole = roles?.find((r) => r.id === roleId);
    if (newRole && onEditRole) {
      onEditRole(newRole);
    }
  };

  const canManageRoles = isAdmin;
  const buildRoleActions = useCallback(
    (role: Role) => {
      const isAdminRole = role.is_admin;
      const isDefault = role.is_default;
      const hasMembers = role.members_count > 0;
      const canDelete = !isDefault && !isAdminRole && !hasMembers;
      const canEdit = !isAdminRole;
      const customActions = [];

      if (isAdminRole) {
        customActions.push({
          id: "edit-disabled",
          label: "Admin role cannot be modified",
          icon: <Pencil className="h-4 w-4" />,
          disabled: true,
          onSelect: () => {},
        });
      }

      if (!isAdminRole && !canDelete) {
        const reason = isDefault
          ? "Default roles cannot be deleted"
          : hasMembers
            ? "Role has assigned members"
            : "Cannot delete this role";
        customActions.push({
          id: "delete-disabled",
          label: reason,
          icon: <Trash2 className="h-4 w-4" />,
          disabled: true,
          onSelect: () => {},
          destructive: true,
        });
      }

      return buildRowActions({
        canView: false,
        canEdit,
        canDelete,
        canArchive: false,
        canTrack: false,
        isArchived: false,
        onView: () => {},
        onEdit: () => handleEditClick(role),
        onDelete: () => handleDeleteClick(role),
        customActions: customActions.length > 0 ? customActions : undefined,
      });
    },
    [handleEditClick, handleDeleteClick]
  );

  if (isLoading) {
    return (
      <p className="text-text-muted py-12 text-center text-sm">
        Loading roles...
      </p>
    );
  }

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">All roles</CardTitle>
          <CardDescription>
            View default roles and manage custom roles for your organization.
          </CardDescription>
          {canEditTeam ? (
            <CardAction className="max-sm:col-span-2 max-sm:row-start-3 max-sm:w-full max-sm:justify-self-stretch sm:justify-self-end">
              <Button
                leftIcon={<PlusCircle className="h-4 w-4" />}
                size={ComponentSizeEnum.SM}
                title="Add role"
                onClick={() => openModal("create-role")}
              />
            </CardAction>
          ) : null}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="border-border-subtle divide-border-subtle divide-y overflow-hidden rounded-xl border">
            {sortedRoles.map((role) => {
              const isEditing = editingRole?.id === role.id;
              const isDefault = role.is_default;
              const hasMembers = role.members_count > 0;

              return (
                <div
                  key={role.id}
                  className="hover:bg-bg-hover/40 flex flex-col gap-3 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <SanitizedInput
                          className="max-w-xs"
                          disabled={role.is_default}
                          placeholder="Enter role name"
                          value={roleName}
                          onChange={(e) => setRoleName(e.target.value)}
                        />
                        <Button
                          size={ComponentSizeEnum.SM}
                          title="Cancel"
                          variant={ButtonVariantEnum.SURFACE}
                          onClick={handleCancelEdit}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="text-text-primary font-medium">
                          {role.name}
                        </div>
                        {isDefault ? (
                          <p className="text-text-muted mt-1 text-xs">
                            Default role — cannot be renamed or deleted
                          </p>
                        ) : (
                          <p className="text-text-muted mt-1 text-xs">
                            {hasMembers
                              ? `${role.members_count} member${
                                  role.members_count === 1 ? "" : "s"
                                } assigned — cannot be deleted`
                              : "Custom role"}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {!isEditing && canManageRoles ? (
                    <div className="shrink-0 self-end sm:self-center">
                      <Dropdown items={buildRoleActions(role)} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <CreateRoleDialog
        open={createDialogOpen}
        onOpenChange={(o) => {
          if (!o) closeModalKey("create-role");
        }}
        onRoleCreated={handleRoleCreated}
      />

      <DialogManager manager={dialogManager} />
    </>
  );
}
