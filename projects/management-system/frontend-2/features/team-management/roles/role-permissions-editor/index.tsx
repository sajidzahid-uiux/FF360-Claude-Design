"use client";

import { useCallback, useMemo, useState } from "react";

import type { Role } from "@/api/types";
import { useRoleMutations } from "@/hooks/mutations";
import { usePermissions } from "@/hooks/queries";
import { Card, CardContent, CardHeader, Label } from "@/shared/ui/primitives";

import { PERMISSIONS_CONFIG } from "./permissions-config";
import {
  PermissionCategoryGroup,
  PermissionsEmptyState,
  PermissionsLoadingState,
  RolePermissionsEditorHeader,
} from "./ui";
import { hasPermissionChanged } from "./utils";

interface RolePermissionsEditorProps {
  role: Role;
  onCancel: () => void;
  onSave?: () => void;
}

export default function RolePermissionsEditor({
  role,
  onCancel,
  onSave,
}: RolePermissionsEditorProps) {
  const { data: permissions = [], isLoading: isLoadingPermissions } =
    usePermissions();
  const { updateRole } = useRoleMutations();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(
    new Set(role.permissions.map((p) => p.id))
  );

  const handleTogglePermission = useCallback(
    (permissionId: number | number[]) => {
      setSelectedPermissions((prev) => {
        const newSelected = new Set(prev);
        const ids = Array.isArray(permissionId) ? permissionId : [permissionId];

        ids.forEach((id) => {
          if (newSelected.has(id)) {
            newSelected.delete(id);
          } else {
            newSelected.add(id);
          }
        });

        return newSelected;
      });
    },
    [setSelectedPermissions]
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateRole.mutateAsync({
        roleId: role.id,
        payload: {
          permission_ids: Array.from(selectedPermissions),
        },
      });
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error(error);
      // Error is handled by the hook
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = useMemo(() => {
    return hasPermissionChanged(role.permissions, selectedPermissions);
  }, [role.permissions, selectedPermissions]);

  return (
    <Card>
      <CardHeader>
        <RolePermissionsEditorHeader
          hasChanges={hasChanges}
          isSaving={isSaving}
          role={role}
          onCancel={onCancel}
          onSave={handleSave}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <Label variant="heading">
            Permissions <span className="text-red-500">*</span>
          </Label>
          {isLoadingPermissions ? (
            <PermissionsLoadingState />
          ) : !permissions || permissions.length === 0 ? (
            <PermissionsEmptyState />
          ) : (
            PERMISSIONS_CONFIG.map((section) => {
              return (
                <PermissionCategoryGroup
                  key={section.id}
                  permissions={permissions}
                  section={section}
                  selectedPermissionIds={selectedPermissions}
                  onToggle={handleTogglePermission}
                />
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
