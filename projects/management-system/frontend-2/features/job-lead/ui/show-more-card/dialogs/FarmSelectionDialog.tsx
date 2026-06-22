"use client";

import { useMemo } from "react";

import {
  AppFormModal,
  Button,
  ButtonVariantEnum,
  Dropdown,
  type DropdownOption,
} from "@fieldflow360/org-ui";
import { Plus } from "lucide-react";

import { ResourceType } from "@/constants";
import {
  ON_SITE_OPERATIONS_LABEL,
  ON_SITE_OPERATION_LABEL,
} from "@/features/contacts/model/constants";

interface FarmSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: ResourceType;
  contactId?: number;
  farms?: Array<{ id: number; name: string; acreage?: string | number }>;
  farmsLoading: boolean;
  canEditFarm: boolean;
  onFarmSelect: (farmId: string) => Promise<void>;
  onCreateNewFarm: () => void;
}

export function FarmSelectionDialog({
  open,
  onOpenChange,
  entityType,
  contactId,
  farms,
  farmsLoading,
  canEditFarm,
  onFarmSelect,
  onCreateNewFarm,
}: FarmSelectionDialogProps) {
  const entityLabel =
    entityType === ResourceType.JOB ? ResourceType.JOB : ResourceType.LEAD;

  const farmOptions = useMemo((): DropdownOption<string>[] => {
    if (!farms?.length) return [];
    return farms.map((farm) => ({
      value: farm.id.toString(),
      label: `${farm.name} (${farm.acreage ?? "—"} acres)`,
    }));
  }, [farms]);

  const farmHelperText = farmsLoading
    ? `Loading ${ON_SITE_OPERATIONS_LABEL.toLowerCase()}…`
    : !contactId
      ? `Assign a contact before selecting an ${ON_SITE_OPERATION_LABEL.toLowerCase()}.`
      : farmOptions.length === 0
        ? `No ${ON_SITE_OPERATIONS_LABEL.toLowerCase()} found for this contact.`
        : `Optional. Location data comes from the selected ${ON_SITE_OPERATION_LABEL.toLowerCase()}.`;

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      isOpen={open}
      submitLabel="Close"
      title={`Select ${ON_SITE_OPERATION_LABEL}`}
      width={480}
      onClose={() => onOpenChange(false)}
      onSubmit={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
    >
      {!contactId ? (
        <p className="text-text-muted text-sm">
          No contact information available. Please assign a contact first.
        </p>
      ) : (
        <div className="space-y-4">
          {canEditFarm ? (
            <Button
              fullWidth
              leftIcon={
                <Plus aria-hidden className="h-4 w-4" strokeWidth={2} />
              }
              title={`Create new ${ON_SITE_OPERATION_LABEL.toLowerCase()}`}
              variant={ButtonVariantEnum.GHOST}
              onClick={onCreateNewFarm}
            />
          ) : null}
          <Dropdown
            fullWidth
            disabled={farmsLoading || farmOptions.length === 0}
            helperText={farmHelperText}
            label={ON_SITE_OPERATION_LABEL}
            options={farmOptions}
            placeholder={
              farmsLoading
                ? `Loading ${ON_SITE_OPERATIONS_LABEL.toLowerCase()}…`
                : `Select an ${ON_SITE_OPERATION_LABEL.toLowerCase()}`
            }
            onChange={(farmId) => {
              void onFarmSelect(farmId).then(() => onOpenChange(false));
            }}
          />
          <p className="text-text-muted text-xs">
            {`Choose an ${ON_SITE_OPERATION_LABEL.toLowerCase()} for this ${entityLabel} or create a new one from the contact page.`}
          </p>
        </div>
      )}
    </AppFormModal>
  );
}
