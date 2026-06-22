"use client";

import { useActionState, useCallback, useState } from "react";

import { toast } from "sonner";

import type { RoleCreatePayload } from "@/api/types";
import { useRoleMutations } from "@/hooks";

type CreateRoleState = {
  success: boolean;
  message: string;
} | null;

interface UseCreateRoleActionOptions {
  onOpenChange: (open: boolean) => void;
  onRoleCreated?: (roleId: number) => void;
}

const ROLE_NAME_MAX_LENGTH = 150;

export function useCreateRoleAction({
  onOpenChange,
  onRoleCreated,
}: UseCreateRoleActionOptions) {
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(
    new Set()
  );
  const { createRole } = useRoleMutations();

  const resetForm = useCallback(() => {
    setRoleName("");
    setSelectedPermissions(new Set());
  }, []);

  const [, formAction, isPending] = useActionState(
    async (
      _prevState: CreateRoleState,
      formData: FormData
    ): Promise<CreateRoleState> => {
      const nextRoleName = (formData.get("roleName") as string)?.trim();

      if (!nextRoleName) {
        toast.error("Role name is required");
        return { success: false, message: "Role name is required" };
      }

      if (nextRoleName.length > ROLE_NAME_MAX_LENGTH) {
        toast.error(
          `Role name must be ${ROLE_NAME_MAX_LENGTH} characters or less`
        );
        return {
          success: false,
          message: `Role name must be ${ROLE_NAME_MAX_LENGTH} characters or less`,
        };
      }

      try {
        const payload: RoleCreatePayload = {
          name: nextRoleName,
          permission_ids: Array.from(selectedPermissions),
        };

        const newRole = await createRole.mutateAsync(payload);
        resetForm();
        onOpenChange(false);

        if (onRoleCreated && newRole.id) {
          onRoleCreated(newRole.id);
        }

        return { success: true, message: "Role created successfully" };
      } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to create role" };
      }
    },
    null
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
    []
  );

  const handleClose = useCallback(() => {
    if (!isPending) {
      resetForm();
      onOpenChange(false);
    }
  }, [isPending, resetForm, onOpenChange]);

  return {
    formAction,
    isPending,
    roleName,
    setRoleName,
    selectedPermissions,
    handleTogglePermission,
    handleClose,
  };
}
