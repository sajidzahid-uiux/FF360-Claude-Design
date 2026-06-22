import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { Save } from "lucide-react";

import type { Role } from "@/api/types";

interface RolePermissionsEditorHeaderProps {
  role: Role;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

export function RolePermissionsEditorHeader({
  role,
  onCancel,
  onSave,
  isSaving,
  hasChanges,
}: RolePermissionsEditorHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">
          {role.name}&apos;s Role Permissions
        </h2>
      </div>
      <div className="flex gap-2">
        <Button
          aria-label="Cancel"
          title="Cancel"
          variant={ButtonVariantEnum.SURFACE}
          onClick={onCancel}
        />
        <Button
          disabled={!hasChanges || isSaving}
          leftIcon={<Save className="h-4 w-4" />}
          loading={isSaving}
          title={isSaving ? "Saving..." : "Save Changes"}
          onClick={onSave}
        />
      </div>
    </div>
  );
}
